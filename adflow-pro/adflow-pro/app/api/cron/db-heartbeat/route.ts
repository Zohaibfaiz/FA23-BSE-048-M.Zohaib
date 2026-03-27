// app/api/cron/db-heartbeat/route.ts — Every 6 hours
import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const start = Date.now();
  const supabase = createAdminClient();
  try {
    const { count } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status','published');
    await supabase.from('system_health_logs').insert({ check_type: 'db_heartbeat', status: 'ok', details: { active_ads: count }, duration_ms: Date.now() - start });
    return NextResponse.json({ status: 'ok', active_ads: count, duration_ms: Date.now() - start });
  } catch (err) {
    await supabase.from('system_health_logs').insert({ check_type: 'db_heartbeat', status: 'error', details: { error: String(err) }, duration_ms: Date.now() - start });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
