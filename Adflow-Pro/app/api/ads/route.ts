import { fail, ok } from '@/lib/api';
import { listPublicAdsData } from '@/lib/marketplace';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return ok(await listPublicAdsData(searchParams));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to fetch ads', 500);
  }
}
