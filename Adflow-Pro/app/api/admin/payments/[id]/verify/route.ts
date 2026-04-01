import { fail, ok } from '@/lib/api';
import { verifyAdminPayment } from '@/lib/marketplace';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    return ok(await verifyAdminPayment(params.id, body));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to verify payment', 400);
  }
}
