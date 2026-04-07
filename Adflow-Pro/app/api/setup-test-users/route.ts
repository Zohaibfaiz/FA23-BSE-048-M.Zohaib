import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const adminClient = createAdminClient();

  const testUsers = [
    { email: 'client@test.com', password: 'password123', role: 'client', name: 'Test Client' },
    { email: 'moderator@test.com', password: 'password123', role: 'moderator', name: 'Test Moderator' },
    { email: 'admin@test.com', password: 'password123', role: 'admin', name: 'Test Admin' },
    { email: 'superadmin@test.com', password: 'password123', role: 'super_admin', name: 'Test SuperAdmin' },
  ];

  const results = [];

  for (const user of testUsers) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.name },
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          results.push(`User ${user.email} already exists.`);
        } else {
          results.push(`Error creating ${user.email}: ${authError.message}`);
        }
        continue;
      }

      // Update role in the public.users table
      if (authData.user) {
        const { error: dbError } = await adminClient
          .from('users')
          .update({ role: user.role, full_name: user.name })
          .eq('id', authData.user.id);

        if (dbError) {
          results.push(`Created Auth for ${user.email} but failed to update role: ${dbError.message}`);
        } else {
          results.push(`Successfully created ${user.role} account: ${user.email}`);
        }
      }
    } catch (err: any) {
      results.push(`Unexpected error for ${user.email}: ${err.message}`);
    }
  }

  return NextResponse.json({
    message: 'Test setup complete. Note: This requires your Supabase project to be unpaused and running.',
    results,
    testCredentials: testUsers.map(u => ({ email: u.email, password: u.password, role: u.role }))
  });
}
