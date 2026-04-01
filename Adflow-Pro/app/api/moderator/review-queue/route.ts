import { fail, ok } from '@/lib/api';
import { getModeratorQueue } from '@/lib/marketplace';

export async function GET() {
  try {
    return ok(await getModeratorQueue());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to load review queue', 500);
  }
}
