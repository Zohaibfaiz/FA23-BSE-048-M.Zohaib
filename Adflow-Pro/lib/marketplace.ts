import { addDays, addHours } from 'date-fns';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';
import {
  CreateAdSchema,
  LoginSchema,
  RegisterSchema,
  ReviewAdSchema,
  ScheduleAdSchema,
  SearchSchema,
  SubmitPaymentSchema,
  UpdateAdSchema,
  VerifyPaymentSchema,
} from '@/lib/validations';
import { normalizeMediaUrl, validateMediaUrl } from '@/lib/media';
import { slugify } from '@/lib/utils';
import { assertTransition } from '@/lib/workflow';
import { createAuditLog, createNotification, createStatusHistory, recalculateAdRank } from '@/lib/dashboard';
import type { AdStatus } from '@/lib/types';

type SupabaseLike = Awaited<ReturnType<typeof createClient>>;

async function fetchAd(supabase: SupabaseLike, adId: string) {
  const { data: ad } = await supabase.from('ads').select('*, package:packages(*)').eq('id', adId).single();
  if (!ad) throw new Error('Ad not found');
  return ad as Record<string, any>;
}

async function changeAdStatus(
  supabase: SupabaseLike,
  params: {
    adId: string;
    nextStatus: AdStatus;
    actorId?: string | null;
    actorEmail?: string | null;
    note?: string | null;
    extra?: Record<string, unknown>;
  }
) {
  const ad = await fetchAd(supabase, params.adId);
  assertTransition(ad.status as AdStatus, params.nextStatus);

  const updatePayload = {
    status: params.nextStatus,
    ...(params.extra ?? {}),
  };

  const { error } = await supabase.from('ads').update(updatePayload).eq('id', params.adId);
  if (error) throw error;

  await Promise.all([
    createStatusHistory(supabase, {
      adId: params.adId,
      previousStatus: ad.status as AdStatus,
      newStatus: params.nextStatus,
      changedBy: params.actorId ?? null,
      note: params.note ?? null,
    }),
    createAuditLog(supabase, {
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      action: 'ad_status_transition',
      entityType: 'ad',
      entityId: params.adId,
      oldData: { status: ad.status },
      newData: updatePayload,
    }),
  ]);

  return ad;
}

export async function registerUser(body: unknown) {
  const input = RegisterSchema.parse(body);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name,
        role: input.role,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function loginUser(body: unknown) {
  const input = LoginSchema.parse(body);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;
  return data;
}

export async function listPackagesData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listPublicAdsData(searchParams: URLSearchParams) {
  const input = SearchSchema.parse({
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  });

  const supabase = await createClient();
  let query = supabase.from('v_public_ads').select('*', { count: 'exact' });

  if (input.q) {
    query = query.or(`title.ilike.%${input.q}%,description.ilike.%${input.q}%`);
  }
  if (input.category) {
    query = query.eq('category_slug', input.category);
  }
  if (input.city) {
    query = query.eq('city_slug', input.city);
  }

  if (input.sort === 'created_at') {
    query = query.order('created_at', { ascending: false });
  } else if (input.sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (input.sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('rank_score', { ascending: false });
  }

  const from = (input.page - 1) * input.pageSize;
  const to = from + input.pageSize - 1;
  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    items: data ?? [],
    total: count ?? 0,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / input.pageSize)),
  };
}

export async function getPublicAdData(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      user:users(full_name, email, is_verified_seller),
      package:packages(*),
      category:categories(*),
      city:cities(*),
      media:ad_media(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  return data;
}

export async function createClientAd(body: unknown) {
  const user = await requireAuth();
  const input = CreateAdSchema.parse(body);
  const supabase = await createClient();
  const slug = `${slugify(input.title)}-${Date.now()}`;

  const { data: pkg } = await supabase.from('packages').select('*').eq('id', input.package_id).single();
  if (!pkg) throw new Error('Selected package was not found');

  const { data: ad, error: adError } = await supabase
    .from('ads')
    .insert({
      user_id: user.id,
      package_id: input.package_id,
      title: input.title,
      slug,
      category_id: input.category_id,
      city_id: input.city_id,
      description: input.description,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone || null,
      website_url: input.website_url || null,
      price: input.price ?? null,
      status: 'draft',
    })
    .select('*')
    .single();

  if (adError) throw adError;

  const mediaRows = input.media_urls.map((url, index) => {
    const validation = validateMediaUrl(url);
    const normalized = normalizeMediaUrl(url);
    return {
      ad_id: ad.id,
      source_type: normalized.sourceType,
      original_url: url,
      normalized_thumbnail_url: validation.valid ? normalized.thumbnailUrl : normalized.fallbackThumbnailUrl,
      youtube_video_id: normalized.youtubeId ?? null,
      validation_status: validation.valid ? 'valid' : 'invalid',
      is_primary: index === 0,
      sort_order: index,
    };
  });

  const { error: mediaError } = await supabase.from('ad_media').insert(mediaRows);
  if (mediaError) throw mediaError;

  await supabase.from('payments').insert({
    ad_id: ad.id,
    user_id: user.id,
    package_id: pkg.id,
    amount: pkg.price,
    currency: 'PKR',
    status: 'pending',
  });

  await createAuditLog(supabase, {
    actorId: user.id,
    actorEmail: user.email,
    action: 'ad_created',
    entityType: 'ad',
    entityId: ad.id,
    newData: { title: ad.title, status: ad.status },
  });

  return ad;
}

export async function updateClientAd(adId: string, body: unknown) {
  const user = await requireAuth();
  const input = UpdateAdSchema.parse({ ...(body as Record<string, unknown>), id: adId });
  const supabase = await createClient();
  const ad = await fetchAd(supabase, adId);
  const requestedStatus = (body as Record<string, unknown>).status;

  if (ad.user_id !== user.id) throw new Error('Forbidden');
  if (!['draft', 'submitted'].includes(ad.status)) {
    throw new Error('Only draft or submitted ads can be edited');
  }

  const updates = Object.fromEntries(
    Object.entries({
      title: input.title,
      description: input.description,
      category_id: input.category_id,
      city_id: input.city_id,
      package_id: input.package_id,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      website_url: input.website_url,
      price: input.price,
    }).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('ads').update(updates).eq('id', adId);
    if (error) throw error;
  }

  const incomingMedia = (body as Record<string, unknown>).media_urls;
  if (Array.isArray(incomingMedia)) {
    await supabase.from('ad_media').delete().eq('ad_id', adId);
    const mediaRows = incomingMedia.map((item, index) => {
      const url = String(item);
      const validation = validateMediaUrl(url);
      const normalized = normalizeMediaUrl(url);
      return {
        ad_id: adId,
        source_type: normalized.sourceType,
        original_url: url,
        normalized_thumbnail_url: validation.valid ? normalized.thumbnailUrl : normalized.fallbackThumbnailUrl,
        youtube_video_id: normalized.youtubeId ?? null,
        validation_status: validation.valid ? 'valid' : 'invalid',
        is_primary: index === 0,
        sort_order: index,
      };
    });
    if (mediaRows.length > 0) {
      const { error } = await supabase.from('ad_media').insert(mediaRows);
      if (error) throw error;
    }
  }

  await createAuditLog(supabase, {
    actorId: user.id,
    actorEmail: user.email,
    action: 'ad_updated',
    entityType: 'ad',
    entityId: adId,
    oldData: ad,
    newData: updates,
  });

  if (requestedStatus === 'submitted' && ad.status === 'draft') {
    await changeAdStatus(supabase, {
      adId,
      nextStatus: 'submitted',
      actorId: user.id,
      actorEmail: user.email,
      note: 'Client submitted ad for moderation',
    });

    await createNotification(supabase, {
      userId: user.id,
      title: 'Ad submitted',
      message: `"${ad.title}" has been submitted and is waiting for moderation.`,
      type: 'status_change',
      adId,
    });
  }

  return { id: adId, ...updates };
}

export async function submitClientPayment(body: unknown) {
  const user = await requireAuth();
  const input = SubmitPaymentSchema.parse(body);
  const supabase = await createClient();
  const ad = await fetchAd(supabase, input.ad_id);

  if (ad.user_id !== user.id) throw new Error('Forbidden');
  if (ad.status !== 'payment_pending') {
    throw new Error('This ad is not ready for payment submission');
  }

  const { data: duplicate } = await supabase
    .from('payments')
    .select('id')
    .eq('transaction_ref', input.transaction_ref)
    .neq('ad_id', input.ad_id)
    .maybeSingle();

  if (duplicate) {
    throw new Error('Duplicate transaction reference detected');
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      transaction_ref: input.transaction_ref,
      payment_proof_url: input.payment_proof_url,
      notes: input.notes ?? null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('ad_id', input.ad_id)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) throw error;

  await changeAdStatus(supabase, {
    adId: input.ad_id,
    nextStatus: 'payment_submitted',
    actorId: user.id,
    actorEmail: user.email,
    note: 'Client submitted payment',
  });

  await createNotification(supabase, {
    userId: user.id,
    title: 'Payment submitted',
    message: `Payment for "${ad.title}" has been sent for admin verification.`,
    type: 'status_change',
    adId: input.ad_id,
  });

  return payment;
}

export async function getClientDashboardApiData() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [{ data: ads }, { data: notifications }] = await Promise.all([
    supabase
      .from('ads')
      .select(`
        *,
        package:packages(name, duration_days, price),
        category:categories(name),
        city:cities(name),
        media:ad_media(*),
        payments(*)
      `)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  return {
    user,
    ads: ads ?? [],
    notifications: notifications ?? [],
  };
}

export async function getModeratorQueue() {
  await requireRole(['moderator', 'admin', 'super_admin']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      user:users(email, full_name, is_verified_seller),
      package:packages(*),
      category:categories(*),
      city:cities(*),
      media:ad_media(*)
    `)
    .in('status', ['submitted', 'under_review'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function reviewModeratorAd(adId: string, body: unknown) {
  const moderator = await requireRole(['moderator', 'admin', 'super_admin']);
  const input = ReviewAdSchema.parse({ ...(body as Record<string, unknown>), ad_id: adId });
  const supabase = await createClient();
  const ad = await fetchAd(supabase, adId);

  if (!['submitted', 'under_review'].includes(ad.status)) {
    throw new Error('Ad is not in the moderation queue');
  }

  const approve = input.action === 'approve';
  const nextStatus: AdStatus = approve ? 'payment_pending' : 'archived';

  if (ad.status === 'submitted') {
    await changeAdStatus(supabase, {
      adId,
      nextStatus: 'under_review',
      actorId: moderator.id,
      actorEmail: moderator.email,
      note: 'Moderator started review',
    });
  }

  await changeAdStatus(supabase, {
    adId,
    nextStatus,
    actorId: moderator.id,
    actorEmail: moderator.email,
    note: input.notes ?? input.rejection_reason ?? null,
    extra: approve
      ? { moderation_notes: input.notes ?? null }
      : {
          moderation_notes: input.notes ?? null,
          rejection_reason: input.rejection_reason ?? 'Rejected during moderation',
        },
  });

  await createNotification(supabase, {
    userId: ad.user_id,
    title: approve ? 'Ad approved by moderator' : 'Ad rejected by moderator',
    message: approve
      ? `Your ad "${ad.title}" passed moderation and is ready for payment.`
      : `Your ad "${ad.title}" was rejected. ${input.rejection_reason ?? 'Please revise and resubmit.'}`,
    type: approve ? 'payment_required' : 'moderation_note',
    adId,
  });

  return { id: adId, status: nextStatus };
}

export async function getAdminPaymentQueue() {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      ad:ads(id, title, slug, status, user_id),
      user:users(email, full_name),
      package:packages(name, duration_days, price)
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function verifyAdminPayment(paymentId: string, body: unknown) {
  const admin = await requireRole(['admin', 'super_admin']);
  const input = VerifyPaymentSchema.parse({ ...(body as Record<string, unknown>), payment_id: paymentId });
  const supabase = await createClient();
  const { data: payment } = await supabase
    .from('payments')
    .select('*, ad:ads(*), package:packages(*)')
    .eq('id', paymentId)
    .single();

  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'submitted') throw new Error('Payment is not awaiting verification');

  if (input.action === 'verify') {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: admin.id,
        rejection_reason: null,
        notes: input.notes ?? null,
      })
      .eq('id', paymentId);
    if (error) throw error;

    await changeAdStatus(supabase, {
      adId: payment.ad_id,
      nextStatus: 'payment_verified',
      actorId: admin.id,
      actorEmail: admin.email,
      note: input.notes ?? 'Payment verified by admin',
    });

    await createNotification(supabase, {
      userId: payment.user_id,
      title: 'Payment verified',
      message: `Your payment for "${payment.ad?.title}" has been verified.`,
      type: 'payment_verified',
      adId: payment.ad_id,
    });

    return { id: paymentId, status: 'verified' };
  }

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'rejected',
      rejection_reason: input.rejection_reason ?? 'Payment rejected by admin',
      notes: input.notes ?? null,
    })
    .eq('id', paymentId);
  if (error) throw error;

  await changeAdStatus(supabase, {
    adId: payment.ad_id,
    nextStatus: 'payment_pending',
    actorId: admin.id,
    actorEmail: admin.email,
    note: input.rejection_reason ?? input.notes ?? 'Payment rejected',
  });

  await createNotification(supabase, {
    userId: payment.user_id,
    title: 'Payment rejected',
    message: `Your payment for "${payment.ad?.title}" was rejected. ${input.rejection_reason ?? 'Please submit a new transaction.'}`,
    type: 'payment_rejected',
    adId: payment.ad_id,
  });

  return { id: paymentId, status: 'rejected' };
}

export async function publishAdminAd(adId: string, body: unknown) {
  const admin = await requireRole(['admin', 'super_admin']);
  const input = ScheduleAdSchema.parse({ ...(body as Record<string, unknown>), ad_id: adId });
  const supabase = await createClient();
  const ad = await fetchAd(supabase, adId);

  if (!['payment_verified', 'scheduled'].includes(ad.status)) {
    throw new Error('Ad is not ready for publishing');
  }

  const publishAt = new Date(input.publish_at);
  const expireAt = addDays(publishAt, Number(ad.package?.duration_days ?? 7));
  const publishNow = publishAt <= new Date();
  const nextStatus: AdStatus = publishNow ? 'published' : 'scheduled';

  if (ad.status !== nextStatus) {
    await changeAdStatus(supabase, {
      adId,
      nextStatus,
      actorId: admin.id,
      actorEmail: admin.email,
      note: publishNow ? 'Published by admin' : 'Scheduled by admin',
      extra: {
        publish_at: publishAt.toISOString(),
        expire_at: expireAt.toISOString(),
        is_featured: input.is_featured,
        admin_boost: input.admin_boost,
      },
    });
  } else {
    await supabase
      .from('ads')
      .update({
        publish_at: publishAt.toISOString(),
        expire_at: expireAt.toISOString(),
        is_featured: input.is_featured,
        admin_boost: input.admin_boost,
      })
      .eq('id', adId);
  }

  await recalculateAdRank(supabase, adId, {
    is_featured: input.is_featured,
    admin_boost: input.admin_boost,
  });

  await createNotification(supabase, {
    userId: ad.user_id,
    title: publishNow ? 'Ad published' : 'Ad scheduled',
    message: publishNow
      ? `Your ad "${ad.title}" is now live.`
      : `Your ad "${ad.title}" is scheduled for ${publishAt.toLocaleString()}.`,
    type: 'status_change',
    adId,
  });

  return {
    id: adId,
    status: nextStatus,
    publish_at: publishAt.toISOString(),
    expire_at: expireAt.toISOString(),
  };
}

export async function runPublishScheduled(secret?: string | null) {
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    throw new Error('Unauthorized cron request');
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data: ads, error } = await supabase
    .from('ads')
    .select('*, package:packages(*)')
    .eq('status', 'scheduled')
    .lte('publish_at', now);

  if (error) throw error;

  for (const ad of ads ?? []) {
    await supabase
      .from('ads')
      .update({
        status: 'published',
        expire_at: ad.expire_at ?? addDays(new Date(now), Number(ad.package?.duration_days ?? 7)).toISOString(),
      })
      .eq('id', ad.id);

    await Promise.all([
      supabase.from('ad_status_history').insert({
        ad_id: ad.id,
        from_status: 'scheduled',
        to_status: 'published',
        notes: 'Published automatically by cron',
      }),
      supabase.from('notifications').insert({
        user_id: ad.user_id,
        title: 'Ad published automatically',
        message: `"${ad.title}" is now live in the marketplace.`,
        type: 'status_change',
        ad_id: ad.id,
      }),
      supabase.from('audit_logs').insert({
        action: 'cron_publish',
        entity_type: 'ad',
        entity_id: ad.id,
        new_data: { status: 'published' },
      }),
    ]);
  }

  await supabase.from('system_health_logs').insert({
    check_type: 'cron_publish',
    status: 'ok',
    message: `Processed ${ads?.length ?? 0} scheduled ads`,
    duration_ms: 0,
  });

  return { processed: ads?.length ?? 0 };
}

export async function runExpireAds(secret?: string | null) {
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    throw new Error('Unauthorized cron request');
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const reminderIso = addHours(new Date(), 48).toISOString();

  const [{ data: expiringSoon }, { data: expiredAds }] = await Promise.all([
    supabase.from('ads').select('*').eq('status', 'published').gt('expire_at', nowIso).lte('expire_at', reminderIso),
    supabase.from('ads').select('*').eq('status', 'published').lte('expire_at', nowIso),
  ]);

  for (const ad of expiringSoon ?? []) {
    await supabase.from('notifications').insert({
      user_id: ad.user_id,
      title: 'Expiry reminder',
      message: `"${ad.title}" will expire in the next 48 hours.`,
      type: 'ad_expiring_soon',
      ad_id: ad.id,
    });
  }

  for (const ad of expiredAds ?? []) {
    await supabase.from('ads').update({ status: 'expired' }).eq('id', ad.id);
    await Promise.all([
      supabase.from('ad_status_history').insert({
        ad_id: ad.id,
        from_status: 'published',
        to_status: 'expired',
        notes: 'Expired automatically by cron',
      }),
      supabase.from('notifications').insert({
        user_id: ad.user_id,
        title: 'Ad expired',
        message: `"${ad.title}" has expired and is no longer public.`,
        type: 'ad_expired',
        ad_id: ad.id,
      }),
      supabase.from('audit_logs').insert({
        action: 'cron_expire',
        entity_type: 'ad',
        entity_id: ad.id,
        new_data: { status: 'expired' },
      }),
    ]);
  }

  await supabase.from('system_health_logs').insert({
    check_type: 'cron_expire',
    status: 'ok',
    message: `Expired ${expiredAds?.length ?? 0} ads and reminded ${expiringSoon?.length ?? 0}`,
    duration_ms: 0,
  });

  return {
    expired: expiredAds?.length ?? 0,
    reminders: expiringSoon?.length ?? 0,
  };
}

export async function runDatabaseHealthCheck() {
  const supabase = createAdminClient();
  const startedAt = Date.now();
  const { error } = await supabase.from('packages').select('id').limit(1);
  const responseMs = Date.now() - startedAt;

  await supabase.from('system_health_logs').insert({
    check_type: 'db_heartbeat',
    status: error ? 'error' : 'ok',
    message: error ? error.message : 'Database connection healthy',
    duration_ms: responseMs,
  });

  return {
    ok: !error,
    responseMs,
    checkedAt: new Date().toISOString(),
  };
}
