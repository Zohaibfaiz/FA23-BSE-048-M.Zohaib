import { fail, ok } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { LoginSchema } from '@/lib/validations';
import { getAuthScopeLoginPath, resolveRedirectForRole, isRoleAllowedForScope, type AuthScope } from '@/lib/auth-config';
import { z } from 'zod';

const SessionLoginSchema = LoginSchema.extend({
  scope: z.enum(['client', 'moderator', 'admin']).default('client'),
  redirectTo: z.string().optional(),
});

const SCOPE_ERROR_MESSAGE: Record<AuthScope, string> = {
  client: 'Your account could not be routed to a dashboard.',
  moderator: 'This portal only allows moderator or admin accounts.',
  admin: 'This portal only allows admin or super admin accounts.',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = SessionLoginSchema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      return fail(error.message, 400);
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return fail('Your account profile is missing. Please contact support.', 403);
    }

    if (!isRoleAllowedForScope(profile.role, input.scope)) {
      await supabase.auth.signOut();
      return fail(SCOPE_ERROR_MESSAGE[input.scope], 403, {
        loginPath: getAuthScopeLoginPath(input.scope),
        role: profile.role,
      });
    }

    return ok({
      user: profile,
      redirectTo: resolveRedirectForRole(profile.role, input.redirectTo),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Login failed', 400);
  }
}
