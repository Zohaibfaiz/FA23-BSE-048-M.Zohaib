import { fail, ok } from '@/lib/api';
import { getAdminAnalyticsSummary } from '@/lib/dashboard';

export async function GET() {
  try {
    return ok(await getAdminAnalyticsSummary());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to load analytics', 500);
  }
}
