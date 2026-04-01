import { fail, ok } from '@/lib/api';
import { listPackagesData } from '@/lib/marketplace';

export async function GET() {
  try {
    return ok(await listPackagesData());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to fetch packages', 500);
  }
}
