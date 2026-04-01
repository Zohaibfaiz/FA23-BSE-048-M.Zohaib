import { fail, ok } from '@/lib/api';
import { reviewModeratorAd } from '@/lib/marketplace';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return ok(await reviewModeratorAd(params.id, body));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to review ad', 400);
  }
}
