import { fail, ok } from '@/lib/api';
import { publishAdminAd } from '@/lib/marketplace';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return ok(await publishAdminAd(params.id, body));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to publish ad', 400);
  }
}
