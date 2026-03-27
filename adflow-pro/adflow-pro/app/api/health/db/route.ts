// app/api/health/db/route.ts — Public health check
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const start = Date.now();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('system_health_logs').select('id,created_at').order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    return NextResponse.json({ status: 'healthy', last_check: data?.[0]?.created_at, response_ms: Date.now() - start });
  } catch (err) {
    return NextResponse.json({ status: 'unhealthy', error: String(err) }, { status: 503 });
  }
}
