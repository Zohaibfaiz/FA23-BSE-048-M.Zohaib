// app/api/ads/report/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { abuseReportSchema } from '@/lib/validations/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = abuseReportSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('abuse_reports').insert({
      ad_id: parsed.data.ad_id,
      reporter_id: user?.id ?? null,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
