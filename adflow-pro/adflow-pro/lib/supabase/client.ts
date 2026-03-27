// ============================================================
// AdFlow Pro — Supabase Client Setup
// lib/supabase/client.ts  — Browser-side client
// lib/supabase/server.ts  — Server-side (Server Components / API)
// ============================================================

// ── CLIENT (browser) ────────────────────────────────────────
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
