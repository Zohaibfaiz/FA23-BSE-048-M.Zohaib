import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser client — use in client components */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Server client — use in Server Components, Route Handlers, Server Actions */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: Record<string,unknown>) {
        try { (cookieStore as any).set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: Record<string,unknown>) {
        try { (cookieStore as any).set({ name, value: '', ...options }); } catch {}
      },
    },
  });
}

/** Admin client — use ONLY in server-side cron/admin routes */
export function createAdminClient() {
  const { createClient: createSBClient } = require('@supabase/supabase-js');
  return createSBClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
