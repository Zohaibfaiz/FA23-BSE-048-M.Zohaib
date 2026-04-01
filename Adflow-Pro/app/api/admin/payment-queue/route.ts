import { fail, ok } from '@/lib/api';
import { getAdminPaymentQueue } from '@/lib/marketplace';

export async function GET() {
  try {
    return ok(await getAdminPaymentQueue());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to load payment queue', 500);
  }
}
