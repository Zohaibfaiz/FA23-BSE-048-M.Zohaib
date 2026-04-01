import { fail, ok } from '@/lib/api';
import { createCategory } from '@/lib/governance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return ok(await createCategory(body), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create category', 400);
  }
}
