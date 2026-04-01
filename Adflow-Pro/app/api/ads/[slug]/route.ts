import { fail, ok } from '@/lib/api';
import { getPublicAdData } from '@/lib/marketplace';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    return ok(await getPublicAdData(params.slug));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to fetch ad', 404);
  }
}
