import { fail, ok } from '@/lib/api';
import { createPackage } from '@/lib/governance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return ok(await createPackage(body), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create package', 400);
  }
}
