'use server';

import { revalidatePath } from 'next/cache';
import { submitClientPayment, updateClientAd } from '@/lib/marketplace';

function getErrorMessage(error: unknown, fallback: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
        ? error.message
        : fallback;

  if (message.toLowerCase().includes('row-level security policy')) {
    return 'Database policies need the workflow RLS migration before submit will work.';
  }

  return message;
}

export async function submitAdForReviewAction(adId: string) {
  try {
    await updateClientAd(adId, { status: 'submitted' });
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/ads/${adId}`);

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: getErrorMessage(error, 'Failed to submit ad'),
    };
  }
}

export async function submitPaymentAction(payload: {
  adId: string;
  transactionRef: string;
  proofUrl: string;
  notes?: string;
}) {
  try {
    await submitClientPayment({
      ad_id: payload.adId,
      transaction_ref: payload.transactionRef,
      payment_proof_url: payload.proofUrl,
      notes: payload.notes || undefined,
    });

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/ads/${payload.adId}`);

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: getErrorMessage(error, 'Payment submission failed'),
    };
  }
}
