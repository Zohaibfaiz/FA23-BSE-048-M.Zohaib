import { fail, ok } from '@/lib/api';
import { runPublishScheduled } from '@/lib/marketplace';

function getCronSecret(request: Request) {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  return request.headers.get('x-cron-secret') ?? new URL(request.url).searchParams.get('secret');
}

async function handle(request: Request) {
  try {
    const secret = getCronSecret(request);
    return ok(await runPublishScheduled(secret));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to run scheduled publisher', 401);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
