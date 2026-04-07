import { fail, ok } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAuditLog, recalculateAdRank, createNotification } from '@/lib/dashboard';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole(['admin', 'super_admin']);
    const supabase = await createClient();
    const body = await request.json();

    const { data: ad } = await supabase
      .from('ads')
      .select('id, title, is_featured, user_id, status')
      .eq('id', params.id)
      .single();

    if (!ad) throw new Error('Ad not found');

    const newFeatured = body.is_featured !== undefined ? Boolean(body.is_featured) : !ad.is_featured;

    const { error } = await supabase
      .from('ads')
      .update({ is_featured: newFeatured })
      .eq('id', params.id);

    if (error) throw error;

    // Recalculate rank score
    await recalculateAdRank(supabase, params.id, { is_featured: newFeatured });

    // Audit log
    await createAuditLog(supabase, {
      actorId: admin.id,
      actorEmail: admin.email,
      action: newFeatured ? 'ad_featured' : 'ad_unfeatured',
      entityType: 'ad',
      entityId: params.id,
      oldData: { is_featured: ad.is_featured },
      newData: { is_featured: newFeatured },
    });

    // Notify client
    await createNotification(supabase, {
      userId: ad.user_id,
      title: newFeatured ? 'Ad featured' : 'Ad unfeatured',
      message: newFeatured
        ? `Your ad "${ad.title}" has been marked as featured and will get higher ranking.`
        : `Your ad "${ad.title}" is no longer featured.`,
      type: 'status_change',
      adId: params.id,
    });

    return ok({ id: params.id, is_featured: newFeatured });
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to toggle featured', 400);
  }
}
