import type { UserRole } from '@/lib/types';
import { ROLE_DASHBOARD } from '@/lib/workflow';

export type AuthScope = 'client' | 'moderator' | 'admin';

export const AUTH_SCOPE_CONFIG: Record<
  AuthScope,
  {
    loginPath: string;
    label: string;
    roles: UserRole[];
  }
> = {
  client: {
    loginPath: '/auth/login',
    label: 'Client',
    roles: ['client', 'moderator', 'admin', 'super_admin'],
  },
  moderator: {
    loginPath: '/auth/login',
    label: 'Moderator',
    roles: ['moderator', 'admin', 'super_admin'],
  },
  admin: {
    loginPath: '/auth/login',
    label: 'Admin',
    roles: ['admin', 'super_admin'],
  },
};

const PATH_ROLE_RULES: Array<{ prefix: string; roles: UserRole[]; scope: AuthScope }> = [
  {
    prefix: '/super-admin',
    roles: ['super_admin'],
    scope: 'admin',
  },
  {
    prefix: '/admin',
    roles: ['admin', 'super_admin'],
    scope: 'admin',
  },
  {
    prefix: '/moderator',
    roles: ['moderator', 'admin', 'super_admin'],
    scope: 'moderator',
  },
];

export function getAuthScopeLoginPath(scope: AuthScope) {
  return AUTH_SCOPE_CONFIG[scope].loginPath;
}

export function getAuthScopeRoles(scope: AuthScope) {
  return AUTH_SCOPE_CONFIG[scope].roles;
}

export function isRoleAllowedForScope(role: UserRole, scope: AuthScope) {
  return getAuthScopeRoles(scope).includes(role);
}

export function normalizeRedirectPath(path: string | null | undefined, fallback: string) {
  if (!path) return fallback;
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}

export function getLoginPathForProtectedPath(pathname: string) {
  const match = PATH_ROLE_RULES.find((rule) => pathname.startsWith(rule.prefix));
  return match ? getAuthScopeLoginPath(match.scope) : getAuthScopeLoginPath('client');
}

export function canRoleAccessPath(role: UserRole, pathname: string) {
  const match = PATH_ROLE_RULES.find((rule) => pathname.startsWith(rule.prefix));
  if (!match) return true;
  return match.roles.includes(role);
}

export function resolveRedirectForRole(role: UserRole, requestedPath?: string | null) {
  const fallback = ROLE_DASHBOARD[role] ?? '/dashboard';
  const safePath = normalizeRedirectPath(requestedPath, fallback);

  return canRoleAccessPath(role, safePath) ? safePath : fallback;
}
