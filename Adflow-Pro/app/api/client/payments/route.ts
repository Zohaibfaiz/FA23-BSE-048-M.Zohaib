import { fail, ok } from '@/lib/api';
import { submitClientPayment } from '@/lib/marketplace';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return ok(await submitClientPayment(body), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to submit payment', 400);
  }
}
