'use server';
/**
 * AdFlow Pro — Server Actions
 * Handles all data mutations with proper auth checks and audit logging
 */
import { createServerSupabaseClient, createAdminClient } from './supabase';
import { generateSlug } from './utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/** Helper: get current user + role */
async function getCurrentUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { auth: user, profile };
}

/** Helper: insert audit log */
async function auditLog(params: {
  actorId: string; actorRole: string; action: string;
  entityType: string; entityId: string;
  oldValue?: Record<string,unknown>; newValue?: Record<string,unknown>;
}) {
  const admin = createAdminClient();
  await admin.from('audit_logs').insert({
    actor_id: params.actorId,
    actor_role: params.actorRole,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_value: params.oldValue ?? null,
    new_value: params.newValue ?? null,
  });
}

/** Helper: insert status history */
async function insertStatusHistory(adId: string, fromStatus: string|null, toStatus: string, changedBy: string, notes?: string) {
  const admin = createAdminClient();
  await admin.from('ad_status_history').insert({
    ad_id: adId, from_status: fromStatus, to_status: toStatus,
    changed_by: changedBy, notes: notes ?? null,
  });
}

/** Helper: send notification */
async function sendNotification(userId: string, type: string, title: string, message: string, adId?: string) {
  const admin = createAdminClient();
  await admin.from('notifications').insert({
    user_id: userId, ad_id: adId ?? null, type, title, message,
  });
}

// ============================================================
// AD ACTIONS
// ============================================================

export async function createAdAction(formData: FormData) {
  const { auth, profile } = await getCurrentUser();
  const supabase = createServerSupabaseClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category_id = formData.get('category_id') as string;
  const city_id = formData.get('city_id') as string;
  const package_id = formData.get('package_id') as string;
  const media_url = formData.get('media_url') as string;

  let slug = generateSlug(title);
  // Ensure unique slug
  const { data: existing } = await supabase.from('ads').select('slug').eq('slug', slug).single();
  if (existing) slug = `${slug}-${Date.now()}`;

  const { data: ad, error } = await supabase.from('ads').insert({
    slug, title, description, category_id, city_id, package_id,
    owner_id: auth.id, status: 'draft',
  }).select().single();

  if (error) throw new Error(error.message);

  // Add media if provided
  if (media_url && ad) {
    const { normalizeMediaUrl } = await import('./utils');
    const { thumbnailUrl, sourceType } = normalizeMediaUrl(media_url);
    await supabase.from('ad_media').insert({
      ad_id: ad.id, original_url: media_url,
      normalized_thumbnail_url: thumbnailUrl, source_type: sourceType,
      is_primary: true, validation_status: 'valid',
    });
  }

  await auditLog({ actorId: auth.id, actorRole: profile.role, action: 'ad.created', entityType: 'ad', entityId: ad.id, newValue: { title, status: 'draft' } });
  revalidatePath('/dashboard/client');
  return { success: true, adId: ad.id, slug: ad.slug };
}

export async function submitAdAction(adId: string) {
  const { auth, profile } = await getCurrentUser();
  const supabase = createServerSupabaseClient();

  const { data: ad } = await supabase.from('ads').select('*').eq('id', adId).eq('owner_id', auth.id).single();
  if (!ad) throw new Error('Ad not found');

  const { error } = await supabase.from('ads').update({ status: 'submitted' }).eq('id', adId);
  if (error) throw new Error(error.message);

  await insertStatusHistory(adId, ad.status, 'submitted', auth.id);
  await auditLog({ actorId: auth.id, actorRole: profile.role, action: 'ad.submitted', entityType: 'ad', entityId: adId, oldValue: { status: ad.status }, newValue: { status: 'submitted' } });
  revalidatePath('/dashboard/client');
  return { success: true };
}

export async function moderatorReviewAction(adId: string, decision: 'approve' | 'reject', notes?: string) {
  const { auth, profile } = await getCurrentUser();
  if (!['moderator', 'admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }
  const supabase = createServerSupabaseClient();
  const { data: ad } = await supabase.from('ads').select('*').eq('id', adId).single();
  if (!ad) throw new Error('Ad not found');

  const newStatus = decision === 'approve' ? 'payment_pending' : 'rejected';
  await supabase.from('ads').update({
    status: newStatus,
    moderator_notes: notes ?? null,
    rejection_reason: decision === 'reject' ? notes : null,
  }).eq('id', adId);

  await insertStatusHistory(adId, ad.status, newStatus, auth.id, notes);
  await auditLog({ actorId: auth.id, actorRole: profile.role, action: `ad.${decision}d`, entityType: 'ad', entityId: adId, oldValue: { status: ad.status }, newValue: { status: newStatus } });

  const notifType = decision === 'approve' ? 'ad_approved' : 'ad_rejected';
  const notifTitle = decision === 'approve' ? 'Ad Approved — Payment Required' : 'Ad Rejected';
  await sendNotification(ad.owner_id, notifType, notifTitle, notes ?? '', adId);
  revalidatePath('/dashboard/moderator');
  return { success: true };
}

export async function submitPaymentAction(formData: FormData) {
  const { auth, profile } = await getCurrentUser();
  const supabase = createServerSupabaseClient();

  const ad_id = formData.get('ad_id') as string;
  const transaction_ref = formData.get('transaction_ref') as string;
  const proof_url = formData.get('proof_url') as string;
  const notes = formData.get('notes') as string;

  const { data: ad } = await supabase.from('ads').select('*, packages(price)').eq('id', ad_id).single();
  if (!ad) throw new Error('Ad not found');

  // Check duplicate transaction_ref
  const { data: dupPay } = await supabase.from('payments').select('id').eq('transaction_ref', transaction_ref).single();
  if (dupPay) throw new Error('Duplicate transaction reference — already used');

  const { error } = await supabase.from('payments').insert({
    ad_id, user_id: auth.id, package_id: ad.package_id,
    amount: ad.packages?.price ?? 0, transaction_ref, proof_url,
    status: 'submitted', submitted_at: new Date().toISOString(), notes,
  });
  if (error) throw new Error(error.message);

  await supabase.from('ads').update({ status: 'payment_submitted' }).eq('id', ad_id);
  await insertStatusHistory(ad_id, 'payment_pending', 'payment_submitted', auth.id);
  await auditLog({ actorId: auth.id, actorRole: profile.role, action: 'payment.submitted', entityType: 'payment', entityId: ad_id, newValue: { transaction_ref, amount: ad.packages?.price } });
  revalidatePath('/dashboard/client');
  return { success: true };
}

export async function verifyPaymentAction(paymentId: string, decision: 'verify' | 'reject', reason?: string) {
  const { auth, profile } = await getCurrentUser();
  if (!['admin', 'super_admin'].includes(profile.role)) throw new Error('Unauthorized');

  const admin = createAdminClient();
  const { data: payment } = await admin.from('payments').select('*, ads(*)').eq('id', paymentId).single();
  if (!payment) throw new Error('Payment not found');

  if (decision === 'verify') {
    await admin.from('payments').update({ status: 'verified', verified_at: new Date().toISOString(), verified_by: auth.id }).eq('id', paymentId);
    await admin.from('ads').update({ status: 'payment_verified' }).eq('id', payment.ad_id);
    await insertStatusHistory(payment.ad_id, 'payment_submitted', 'payment_verified', auth.id);
    await sendNotification(payment.ads.owner_id, 'payment_verified', 'Payment Verified!', 'Your payment has been verified. Your ad will be published soon.', payment.ad_id);
  } else {
    await admin.from('payments').update({ status: 'rejected', rejection_reason: reason ?? '' }).eq('id', paymentId);
    await admin.from('ads').update({ status: 'payment_pending', rejection_reason: reason ?? '' }).eq('id', payment.ad_id);
    await insertStatusHistory(payment.ad_id, 'payment_submitted', 'payment_pending', auth.id, reason);
  }

  await auditLog({ actorId: auth.id, actorRole: profile.role, action: `payment.${decision}d`, entityType: 'payment', entityId: paymentId, newValue: { decision, reason } });
  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function publishAdAction(adId: string, scheduleAt?: Date) {
  const { auth, profile } = await getCurrentUser();
  if (!['admin', 'super_admin'].includes(profile.role)) throw new Error('Unauthorized');

  const admin = createAdminClient();
  const { data: ad } = await admin.from('ads').select('*, packages(duration_days, featured_weight)').eq('id', adId).single();
  if (!ad) throw new Error('Ad not found');
  if (!ad.package_id) throw new Error('No package selected');

  const durationDays = ad.packages?.duration_days ?? 7;
  const packageWeight = ad.packages?.featured_weight ?? 1;

  if (scheduleAt && scheduleAt > new Date()) {
    // Schedule for future
    await admin.from('ads').update({ status: 'scheduled', publish_at: scheduleAt.toISOString() }).eq('id', adId);
    await insertStatusHistory(adId, ad.status, 'scheduled', auth.id, `Scheduled for ${scheduleAt.toISOString()}`);
  } else {
    // Publish now
    const now = new Date();
    const expireAt = new Date(now.getTime() + durationDays * 86400000);
    const rankScore = (ad.is_featured ? 50 : 0) + packageWeight * 10 + 20; // max freshness
    await admin.from('ads').update({
      status: 'published', publish_at: now.toISOString(),
      expire_at: expireAt.toISOString(), rank_score: rankScore,
    }).eq('id', adId);
    await insertStatusHistory(adId, ad.status, 'published', auth.id);
    await sendNotification(ad.owner_id, 'ad_published', 'Ad Published! 🎉', `Your ad "${ad.title}" is now live.`, adId);
  }

  await auditLog({ actorId: auth.id, actorRole: profile.role, action: 'ad.published', entityType: 'ad', entityId: adId });
  revalidatePath('/dashboard/admin');
  revalidatePath('/ads');
  return { success: true };
}

export async function toggleFeaturedAction(adId: string, isFeatured: boolean) {
  const { auth, profile } = await getCurrentUser();
  if (!['admin', 'super_admin'].includes(profile.role)) throw new Error('Unauthorized');
  const admin = createAdminClient();
  await admin.from('ads').update({ is_featured: isFeatured }).eq('id', adId);
  await auditLog({ actorId: auth.id, actorRole: profile.role, action: 'ad.featured_toggled', entityType: 'ad', entityId: adId, newValue: { is_featured: isFeatured } });
  revalidatePath('/dashboard/admin');
  return { success: true };
}
