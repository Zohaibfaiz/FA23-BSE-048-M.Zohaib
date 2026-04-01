import { fail, ok } from '@/lib/api';
import { getClientDashboardApiData } from '@/lib/marketplace';

export async function GET() {
  try {
    return ok(await getClientDashboardApiData());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to load dashboard', 500);
  }
}
