// app/api/cron/expire-ads/route.ts — Daily cron at 1 AM
import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const start = Date.now();
  const supabase = createAdminClient();
  try {
    const now = new Date();
    // Expire past ads
    const { data: toExpire } = await supabase.from('ads').select('id,title,user_id').eq('status','published').lt('expire_at', now.toISOString()).is('deleted_at',null);
    let expired = 0;
    for (const ad of toExpire ?? []) {
      await supabase.from('ads').update({ status: 'expired', expired_at: now.toISOString() }).eq('id', ad.id);
      await supabase.from('notifications').insert({ user_id: ad.user_id, title: '⏰ Ad Expired', message: `"${ad.title}" has expired.`, type: 'warning', link: '/client' });
      expired++;
    }
    // 48h reminder
    const in48 = new Date(now.getTime() + 48 * 3600000);
    const in49 = new Date(now.getTime() + 49 * 3600000);
    const { data: soon } = await supabase.from('ads').select('id,title,user_id').eq('status','published').gte('expire_at', in48.toISOString()).lte('expire_at', in49.toISOString()).is('deleted_at',null);
    let reminders = 0;
    for (const ad of soon ?? []) {
      await supabase.from('notifications').insert({ user_id: ad.user_id, title: '⚠️ Expiring Soon', message: `"${ad.title}" expires in ~48 hours.`, type: 'warning', link: '/client' });
      reminders++;
    }
    await supabase.from('system_health_logs').insert({ check_type: 'cron_expire', status: 'ok', details: { expired, reminders }, duration_ms: Date.now() - start });
    return NextResponse.json({ success: true, expired, reminders });
  } catch (err) {
    await supabase.from('system_health_logs').insert({ check_type: 'cron_expire', status: 'error', details: { error: String(err) }, duration_ms: Date.now() - start });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
