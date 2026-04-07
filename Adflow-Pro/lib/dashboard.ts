import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole, requireRolePage } from '@/lib/auth';
import { calculateFreshnessPoints, calculateRankScore } from '@/lib/ranking';
import type { AdStatus, UserRole } from '@/lib/types';

type SupabaseLike = Awaited<ReturnType<typeof createClient>>;

function parseAmount(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function recalculateAdRank(
  supabase: SupabaseLike,
  adId: string,
  overrides?: Partial<{
    is_featured: boolean;
    admin_boost: number;
    freshness_points: number;
  }>
) {
  const { data: ad } = await supabase
    .from('ads')
    .select('id, is_featured, admin_boost, freshness_points, last_refreshed_at, package:packages(featured_weight), user:users(is_verified_seller)')
    .eq('id', adId)
    .single();

  if (!ad) return null;

  const freshnessPoints =
    overrides?.freshness_points ??
    calculateFreshnessPoints(ad.last_refreshed_at ? new Date(ad.last_refreshed_at) : new Date());

  const rankScore = calculateRankScore({
    isFeatured: overrides?.is_featured ?? Boolean(ad.is_featured),
    packageWeight: Number(ad.package?.featured_weight ?? 1),
    freshnessPoints,
    adminBoost: overrides?.admin_boost ?? Number(ad.admin_boost ?? 0),
    isVerifiedSeller: Boolean(ad.user?.is_verified_seller),
  });

  await supabase
    .from('ads')
    .update({
      rank_score: rankScore,
      freshness_points: freshnessPoints,
      last_refreshed_at: new Date().toISOString(),
    })
    .eq('id', adId);

  return rankScore;
}

export async function createAuditLog(
  supabase: SupabaseLike,
  payload: {
    actorId?: string | null;
    actorEmail?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldData?: Record<string, unknown> | null;
    newData?: Record<string, unknown> | null;
  }
) {
  await supabase.from('audit_logs').insert({
    actor_id: payload.actorId ?? null,
    actor_email: payload.actorEmail ?? null,
    action: payload.action,
    entity_type: payload.entityType,
    entity_id: payload.entityId ?? null,
    old_data: payload.oldData ?? null,
    new_data: payload.newData ?? null,
  });
}

export async function createNotification(
  supabase: SupabaseLike,
  payload: {
    userId: string;
    title: string;
    message: string;
    type:
      | 'status_change'
      | 'payment_required'
      | 'payment_verified'
      | 'payment_rejected'
      | 'ad_expiring_soon'
      | 'ad_expired'
      | 'moderation_note'
      | 'system';
    adId?: string | null;
  }
) {
  await supabase.from('notifications').insert({
    user_id: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    ad_id: payload.adId ?? null,
  });
}

export async function createStatusHistory(
  supabase: SupabaseLike,
  payload: {
    adId: string;
    previousStatus: AdStatus | null;
    newStatus: AdStatus;
    changedBy?: string | null;
    note?: string | null;
  }
) {
  await supabase.from('ad_status_history').insert({
    ad_id: payload.adId,
    from_status: payload.previousStatus,
    to_status: payload.newStatus,
    changed_by: payload.changedBy ?? null,
    notes: payload.note ?? null,
  });
}

export async function getPublicMarketplaceData() {
  const supabase = await createClient();
  const [{ data: featuredAds }, { data: liveAds }, { data: packages }, { data: categories }, { data: cities }] =
    await Promise.all([
      supabase.from('v_public_ads').select('*').order('rank_score', { ascending: false }).limit(6),
      supabase.from('v_public_ads').select('*').order('rank_score', { ascending: false }).limit(12),
      supabase.from('packages').select('*').eq('is_active', true).order('price', { ascending: true }),
      supabase.from('categories').select('*').eq('is_active', true).limit(8),
      supabase.from('cities').select('*').eq('is_active', true).limit(8),
    ]);

  return {
    featuredAds: featuredAds ?? [],
    liveAds: liveAds ?? [],
    packages: packages ?? [],
    categories: categories ?? [],
    cities: cities ?? [],
  };
}

export async function getClientDashboardData() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [{ data: ads }, { data: notifications }, { data: history }] = await Promise.all([
    supabase
      .from('ads')
      .select(`
        *,
        package:packages(*),
        category:categories(*),
        city:cities(*),
        payment:payments(*),
        media:ad_media(*)
      `)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('ad_status_history')
      .select('*, ad:ads(title, slug, user_id)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const safeAds = (ads ?? []) as Array<Record<string, any>>;
  const filteredHistory = (history ?? []).filter((item: any) => item.ad?.user_id === user.id);

  return {
    user,
    ads: safeAds,
    notifications: notifications ?? [],
    timeline: filteredHistory,
    stats: {
      totalAds: safeAds.length,
      publishedAds: safeAds.filter((ad) => ad.status === 'published').length,
      pendingAds: safeAds.filter((ad) =>
        ['submitted', 'under_review', 'payment_pending', 'payment_submitted', 'scheduled'].includes(
          ad.status
        )
      ).length,
      drafts: safeAds.filter((ad) => ad.status === 'draft').length,
      totalSpend: safeAds.reduce((sum, ad) => {
        const payments = Array.isArray(ad.payment) ? ad.payment : ad.payment ? [ad.payment] : [];
        return (
          sum +
          payments
            .filter((payment: any) => payment.status === 'verified')
            .reduce((paymentSum: number, payment: any) => paymentSum + parseAmount(payment.amount), 0)
        );
      }, 0),
    },
  };
}

export async function getModeratorDashboardData() {
  const user = await requireRolePage(['moderator', 'admin', 'super_admin']);
  const supabase = await createClient();
  const todayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [{ data: reviewQueue }, { count: pendingCount }, { count: approvedToday }, { count: rejectedToday }] =
    await Promise.all([
      supabase
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
        .order('created_at', { ascending: true }),
      supabase.from('ads').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
      supabase
        .from('ad_status_history')
        .select('*', { count: 'exact', head: true })
        .eq('to_status', 'payment_pending')
        .gte('created_at', todayIso),
      supabase
        .from('ad_status_history')
        .select('*', { count: 'exact', head: true })
        .eq('to_status', 'archived')
        .gte('created_at', todayIso),
    ]);

  return {
    user,
    reviewQueue: reviewQueue ?? [],
    stats: {
      pendingCount: pendingCount ?? 0,
      approvedToday: approvedToday ?? 0,
      rejectedToday: rejectedToday ?? 0,
      inQueue: reviewQueue?.length ?? 0,
    },
  };
}

export async function getAdminAnalyticsSummary() {
  await requireRolePage(['admin', 'super_admin']);
  const supabase = await createClient();

  const [{ data: ads }, { data: payments }, { data: history }, { data: categories }, { data: cities }] =
    await Promise.all([
      supabase.from('ads').select('id, status'),
      supabase.from('payments').select('amount, status, package:packages(name)'),
      supabase.from('ad_status_history').select('to_status'),
      supabase.from('categories').select('name, ads:ads(id)'),
      supabase.from('cities').select('name, ads:ads(id)'),
    ]);

  const approvedCount = (history ?? []).filter((item: any) => item.to_status === 'payment_pending').length;
  const rejectedCount = (history ?? []).filter((item: any) => item.to_status === 'archived').length;
  const reviews = approvedCount + rejectedCount;
  const revenueByPackageMap = new Map<string, number>();

  for (const payment of (payments ?? []) as Array<Record<string, any>>) {
    if (payment.status !== 'verified') continue;
    const packageName = payment.package?.name ?? 'Unknown';
    revenueByPackageMap.set(packageName, (revenueByPackageMap.get(packageName) ?? 0) + parseAmount(payment.amount));
  }

  return {
    totalAds: ads?.length ?? 0,
    activeAds: (ads ?? []).filter((ad: any) => ad.status === 'published').length,
    verifiedRevenue: (payments ?? [])
      .filter((payment: any) => payment.status === 'verified')
      .reduce((sum: number, payment: any) => sum + parseAmount(payment.amount), 0),
    revenueByPackage: Array.from(revenueByPackageMap.entries()).map(([pkg, revenue]) => ({
      package: pkg,
      revenue,
    })),
    approvalRate: reviews ? approvedCount / reviews : 0,
    rejectionRate: reviews ? rejectedCount / reviews : 0,
    adsByCategory: (categories ?? []).map((item: any) => ({
      category: item.name,
      count: Array.isArray(item.ads) ? item.ads.length : 0,
    })),
    adsByCity: (cities ?? []).map((item: any) => ({
      city: item.name,
      count: Array.isArray(item.ads) ? item.ads.length : 0,
    })),
  };
}

export async function getAdminDashboardData() {
  const user = await requireRolePage(['admin', 'super_admin']);
  const supabase = await createClient();
  const [summary, { data: pendingPayments }, { data: verifiedAds }, { data: healthLogs }] = await Promise.all([
    getAdminAnalyticsSummary(),
    supabase
      .from('payments')
      .select(`
        *,
        ad:ads(id, title, slug, status, user_id),
        user:users!payments_user_id_fkey(email, full_name),
        package:packages(name, duration_days, price)
      `)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true }),
    supabase
      .from('ads')
      .select(`
        *,
        package:packages(*),
        category:categories(*),
        city:cities(*),
        user:users!ads_user_id_fkey(email, full_name)
      `)
      .eq('status', 'payment_verified')
      .order('updated_at', { ascending: false }),
    supabase.from('system_health_logs').select('*').order('created_at', { ascending: false }).limit(6),
  ]);

  return {
    user,
    summary,
    pendingPayments: pendingPayments ?? [],
    verifiedAds: verifiedAds ?? [],
    healthLogs: healthLogs ?? [],
  };
}

export async function getSuperAdminDashboardData() {
  const user = await requireRolePage(['super_admin']);
  const supabase = await createClient();
  const [summary, { data: packages }, { data: categories }, { data: cities }, { data: staff }, { data: auditLogs }, { data: healthLogs }] =
    await Promise.all([
      getAdminAnalyticsSummary(),
      supabase.from('packages').select('*').order('price', { ascending: true }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('cities').select('*').order('name', { ascending: true }),
      supabase
        .from('users')
        .select('id, full_name, email, role, created_at')
        .in('role', ['moderator', 'admin', 'super_admin'])
        .order('created_at', { ascending: false }),
      supabase
        .from('audit_logs')
        .select('*, user:users(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('system_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  return {
    user,
    summary,
    packages: packages ?? [],
    categories: categories ?? [],
    cities: cities ?? [],
    staff: staff ?? [],
    auditLogs: auditLogs ?? [],
    healthLogs: healthLogs ?? [],
  };
}

export function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    client: 'Client',
    moderator: 'Moderator',
    admin: 'Admin',
    super_admin: 'Super Admin',
  };

  return labels[role];
}

export async function getAdminUsersData() {
  await requireRolePage(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_verified_seller, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return users ?? [];
}

export async function getAdminAllAdsData(statusFilter?: string) {
  await requireRolePage(['admin', 'super_admin']);
  const supabase = await createClient();

  let query = supabase
    .from('ads')
    .select(`
      id, title, slug, status, created_at, updated_at, is_deleted, view_count, click_count,
      user:users(email, full_name),
      package:packages(name),
      category:categories(name),
      city:cities(name)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAdminAllPaymentsData() {
  await requireRolePage(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      ad:ads(id, title, slug),
      user:users!payments_user_id_fkey(email, full_name),
      package:packages(name, price)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOverviewStats() {
  await requireRolePage(['admin', 'super_admin']);
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalAds },
    { count: pendingAds },
    { count: publishedAds },
    { count: archivedAds },
    { count: scheduledAds },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('ads').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('ads').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
    supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalAds: totalAds ?? 0,
    pendingAds: pendingAds ?? 0,
    publishedAds: publishedAds ?? 0,
    archivedAds: archivedAds ?? 0,
    scheduledAds: scheduledAds ?? 0,
  };
}

export async function getModeratorApprovedAdsData() {
  await requireRolePage(['moderator', 'admin', 'super_admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ads')
    .select(`
      id, title, slug, status, created_at, updated_at, moderation_notes,
      user:users(email, full_name),
      category:categories(name),
      city:cities(name)
    `)
    .in('status', ['payment_pending', 'payment_submitted', 'payment_verified', 'scheduled', 'published'])
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getModeratorRejectedAdsData() {
  await requireRolePage(['moderator', 'admin', 'super_admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ads')
    .select(`
      id, title, slug, status, created_at, updated_at, rejection_reason, moderation_notes,
      user:users(email, full_name),
      category:categories(name),
      city:cities(name)
    `)
    .eq('status', 'archived')
    .not('rejection_reason', 'is', null)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
