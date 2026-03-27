// app/api/cron/publish-scheduled/route.ts
// Called every hour via Vercel Cron: "0 * * * *"
import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();
  const supabase = createAdminClient();

  try {
    const now = new Date().toISOString();
    const { data: ads } = await supabase
      .from('ads')
      .select('id, title, user_id, package:packages(duration_days)')
      .eq('status', 'scheduled')
      .lte('publish_at', now)
      .is('deleted_at', null);

    let count = 0;
    for (const ad of ads ?? []) {
      const days = (ad.package as { duration_days?: number })?.duration_days ?? 7;
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + days);
      await supabase.from('ads').update({ status: 'published', published_at: now, expire_at: expireAt.toISOString() }).eq('id', ad.id);
      await supabase.from('notifications').insert({ user_id: ad.user_id, title: '🚀 Your Ad is Live!', message: `"${ad.title}" is now visible to everyone.`, type: 'success', link: '/client' });
      count++;
    }

    await supabase.from('system_health_logs').insert({ check_type: 'cron_publish', status: 'ok', details: { published: count }, duration_ms: Date.now() - start });
    return NextResponse.json({ success: true, published: count });
  } catch (err) {
    await supabase.from('system_health_logs').insert({ check_type: 'cron_publish', status: 'error', details: { error: String(err) }, duration_ms: Date.now() - start });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
