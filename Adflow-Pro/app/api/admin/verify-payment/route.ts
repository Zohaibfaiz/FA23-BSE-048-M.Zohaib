import { NextResponse } from 'next/server';
import { verifyAdminPayment } from '@/lib/marketplace';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paymentId = String(formData.get('payment_id') ?? '');
    const action = String(formData.get('action') ?? '');
    const rejectionReason = formData.get('rejection_reason');
    const notes = formData.get('notes');

    await verifyAdminPayment(paymentId, {
      action,
      rejection_reason: rejectionReason ? String(rejectionReason) : undefined,
      notes: notes ? String(notes) : undefined,
    });

    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 400 }
    );
  }
}
