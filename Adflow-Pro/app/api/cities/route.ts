import { fail, ok } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return ok(data ?? []);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to fetch cities', 500);
  }
}
