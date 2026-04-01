import { fail, ok } from '@/lib/api';
import { runDatabaseHealthCheck } from '@/lib/marketplace';

export async function GET() {
  try {
    return ok(await runDatabaseHealthCheck());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Database health check failed', 500);
  }
}
