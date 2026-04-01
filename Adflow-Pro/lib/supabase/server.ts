import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for SERVER components and API routes.
 * Uses cookie-based auth session management.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase is not configured. Please add credentials to .env.local');
    // Return a chainable mock client
    const mockChain = {
      select: () => mockChain,
      eq: () => mockChain,
      order: () => mockChain,
      limit: () => mockChain,
      single: () => mockChain,
      insert: () => mockChain,
      update: () => mockChain,
      delete: () => mockChain,
      then: (resolve: any) => resolve({ data: null, error: null }),
      catch: (reject: any) => mockChain,
    };
    
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => mockChain,
      rpc: () => mockChain,
    } as any;
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be safely ignored if middleware refreshes user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase ADMIN client using the service role key.
 * Use ONLY in secure server-side contexts (cron jobs, admin actions).
 * Never expose the service_role key to the client.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
    throw new Error('Supabase service role key is not configured');
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
