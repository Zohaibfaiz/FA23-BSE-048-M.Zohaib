import { NextResponse } from 'next/server';
import { reviewModeratorAd } from '@/lib/marketplace';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const adId = String(formData.get('ad_id') ?? '');
    const action = String(formData.get('action') ?? '');
    const notes = formData.get('notes');
    const rejectionReason = formData.get('rejection_reason');

    await reviewModeratorAd(adId, {
      action,
      notes: notes ? String(notes) : undefined,
      rejection_reason: rejectionReason ? String(rejectionReason) : undefined,
    });

    return NextResponse.redirect(new URL('/moderator', request.url));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to review ad' },
      { status: 400 }
    );
  }
}
