import { fail, ok } from '@/lib/api';
import { createClientAd } from '@/lib/marketplace';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ad = await createClientAd(body);
    return ok(ad, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create ad', 400);
  }
}
