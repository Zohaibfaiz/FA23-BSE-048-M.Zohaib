import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import type { UserRole } from './types';
import { ROLE_DASHBOARD } from './workflow';

/**
 * Get current authenticated user with role
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return userData;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require specific role (throws if not authorized)
 */
export async function requireRole(requiredRoles: UserRole[]) {
  const user = await requireAuth();
  if (!requiredRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

/**
 * Require authentication inside pages/layouts and redirect to a login portal.
 */
export async function requireAuthPage(loginPath = '/auth/login') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(loginPath);
  }
  return user;
}

/**
 * Require a role inside pages/layouts and redirect unauthorized users to their own workspace.
 */
export async function requireRolePage(requiredRoles: UserRole[], loginPath = '/auth/login') {
  const user = await getCurrentUser();

  if (!user) {
    redirect(loginPath);
  }

  if (!requiredRoles.includes(user.role)) {
    redirect(ROLE_DASHBOARD[user.role as UserRole] ?? '/dashboard');
  }

  return user;
}
