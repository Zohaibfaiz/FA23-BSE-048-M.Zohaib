'use server';

import { requireRole } from '@/lib/auth';
import { reviewModeratorAd } from '@/lib/marketplace';
import { revalidatePath } from 'next/cache';

export async function approveAd(adId: string, notes?: string) {
  await requireRole(['moderator', 'admin', 'super_admin']);

  await reviewModeratorAd(adId, {
    action: 'approve',
    notes: notes || undefined,
  });

  revalidatePath('/moderator');
  revalidatePath('/moderator/approved');
  return { success: true };
}

export async function rejectAd(adId: string, reason: string) {
  await requireRole(['moderator', 'admin', 'super_admin']);

  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  await reviewModeratorAd(adId, {
    action: 'reject',
    rejection_reason: reason,
  });

  revalidatePath('/moderator');
  revalidatePath('/moderator/rejected');
  return { success: true };
}
