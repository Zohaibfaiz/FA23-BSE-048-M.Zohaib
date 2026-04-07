import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password || password.length < 8) {
      return NextResponse.json({ error: 'Valid email and password (minimum 8 characters) are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // 1. Get the user ID from the public users table based on email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError || !userData) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // 2. Force update their password using Admin privileges
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password: password }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
