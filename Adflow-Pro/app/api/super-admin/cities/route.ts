import { fail, ok } from '@/lib/api';
import { createCity } from '@/lib/governance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return ok(await createCity(body), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create city', 400);
  }
}
