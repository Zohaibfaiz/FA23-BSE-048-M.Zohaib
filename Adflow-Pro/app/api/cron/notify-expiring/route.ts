import { fail, ok } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase/server';
import { addHours } from 'date-fns';

function getCronSecret(request: Request) {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }
  return request.headers.get('x-cron-secret') ?? new URL(request.url).searchParams.get('secret');
}

async function handle(request: Request) {
  try {
    const secret = getCronSecret(request);
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      throw new Error('Unauthorized cron request');
    }

    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();
    const reminderIso = addHours(new Date(), 48).toISOString();

    // Find ads expiring within 48 hours
    const { data: expiringSoon } = await supabase
      .from('ads')
      .select('id, title, user_id')
      .eq('status', 'published')
      .gt('expire_at', nowIso)
      .lte('expire_at', reminderIso);

    let notified = 0;
    for (const ad of expiringSoon ?? []) {
      // Check if we already sent a reminder for this ad recently
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('ad_id', ad.id)
        .eq('type', 'ad_expiring_soon')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from('notifications').insert({
          user_id: ad.user_id,
          title: 'Ad expiring soon',
          message: `Your ad "${ad.title}" will expire in the next 48 hours. Consider renewing to stay visible.`,
          type: 'ad_expiring_soon',
          ad_id: ad.id,
        });
        notified++;
      }
    }

    // Log health
    await supabase.from('system_health_logs').insert({
      check_type: 'cron_notify_expiring',
      status: 'ok',
      message: `Sent ${notified} expiry reminders out of ${expiringSoon?.length ?? 0} expiring ads`,
      duration_ms: 0,
    });

    return ok({ notified, total: expiringSoon?.length ?? 0 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to run notify-expiring job', 401);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
