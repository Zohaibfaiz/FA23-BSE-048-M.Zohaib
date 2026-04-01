import { fail, ok } from '@/lib/api';
import { registerUser } from '@/lib/marketplace';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await registerUser(body);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Registration failed', 400);
  }
}
