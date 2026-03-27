// app/api/cron/heartbeat/route.ts
// Called by Vercel Cron every 6 hours: { "schedule": "0 */6 * * *" }
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();
  const supabase = createAdminClient();

  try {
    // Simple DB ping — count active ads
    const { count, error } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (error) throw error;

    const duration = Date.now() - start;

    await supabase.from('system_health_logs').insert({
      check_type: 'db_heartbeat',
      status: 'ok',
      details: { active_ads: count, ping_ms: duration },
      duration_ms: duration,
    });

    return NextResponse.json({ success: true, active_ads: count, ping_ms: duration });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    await supabase.from('system_health_logs').insert({
      check_type: 'db_heartbeat',
      status: 'error',
      details: { error: msg },
      duration_ms: Date.now() - start,
    });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
