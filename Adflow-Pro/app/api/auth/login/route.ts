import { fail, ok } from '@/lib/api';
import { loginUser } from '@/lib/marketplace';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await loginUser(body);
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Login failed', 400);
  }
}
