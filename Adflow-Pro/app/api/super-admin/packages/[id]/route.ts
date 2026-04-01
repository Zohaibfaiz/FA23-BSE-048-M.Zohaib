import { fail, ok } from '@/lib/api';
import { updatePackage } from '@/lib/governance';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return ok(await updatePackage({ ...body, id: params.id }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update package', 400);
  }
}
