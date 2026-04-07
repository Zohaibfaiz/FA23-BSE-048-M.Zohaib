import { fail, ok } from '@/lib/api';
import { runDatabaseHealthCheck } from '@/lib/marketplace';

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
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      throw new Error('Unauthorized cron request');
    }
    return ok(await runDatabaseHealthCheck());
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Database heartbeat failed', 401);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
