import { fail, ok } from '@/lib/api';
import { updateClientAd } from '@/lib/marketplace';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return ok(await updateClientAd(params.id, body));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update ad', 400);
  }
}
