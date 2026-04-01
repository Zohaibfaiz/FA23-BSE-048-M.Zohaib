import { fail, ok } from '@/lib/api';
import { updateCategory } from '@/lib/governance';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return ok(await updateCategory({ ...body, id: params.id }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update category', 400);
  }
}
