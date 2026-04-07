'use server';

import { requireRole } from '@/lib/auth';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/dashboard';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/types';

export async function changeUserRole(userId: string, newRole: UserRole) {
  const admin = await requireRole(['admin', 'super_admin']);
  const adminClient = createAdminClient();

  // Prevent self-demotion
  if (userId === admin.id) {
    throw new Error('You cannot change your own role');
  }

  // Only super_admin can assign super_admin
  if (newRole === 'super_admin' && admin.role !== 'super_admin') {
    throw new Error('Only super admins can assign the super_admin role');
  }

  const { data: targetUser } = await adminClient
    .from('users')
    .select('id, email, role')
    .eq('id', userId)
    .single();

  if (!targetUser) throw new Error('User not found');

  const { error } = await adminClient
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;

  const supabase = await createClient();
  await createAuditLog(supabase, {
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'role_change',
    entityType: 'user',
    entityId: userId,
    oldData: { role: targetUser.role },
    newData: { role: newRole },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function adminDeleteAd(adId: string) {
  const admin = await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data: ad } = await supabase
    .from('ads')
    .select('id, title, user_id, status')
    .eq('id', adId)
    .single();

  if (!ad) throw new Error('Ad not found');

  const { error } = await supabase
    .from('ads')
    .update({ is_deleted: true })
    .eq('id', adId);

  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'ad_deleted_by_admin',
    entityType: 'ad',
    entityId: adId,
    oldData: { title: ad.title, status: ad.status },
    newData: { is_deleted: true },
  });

  revalidatePath('/admin/ads');
  return { success: true };
}

export async function adminUpdateAdStatus(adId: string, newStatus: string) {
  const admin = await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data: ad } = await supabase
    .from('ads')
    .select('id, title, status')
    .eq('id', adId)
    .single();

  if (!ad) throw new Error('Ad not found');

  const { error } = await supabase
    .from('ads')
    .update({ status: newStatus })
    .eq('id', adId);

  if (error) throw error;

  await createAuditLog(supabase, {
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'ad_status_override',
    entityType: 'ad',
    entityId: adId,
    oldData: { status: ad.status },
    newData: { status: newStatus },
  });

  revalidatePath('/admin/ads');
  return { success: true };
}
