'use client';

import { useState, useTransition } from 'react';
import { changeUserRole } from '@/app/admin/actions';
import toast from 'react-hot-toast';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function UserRoleManager({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(currentRole);

  const handleChange = (newRole: UserRole) => {
    if (newRole === role) return;
    const prev = role;
    setRole(newRole);

    startTransition(async () => {
      try {
        await changeUserRole(userId, newRole);
        toast.success(`Role changed to ${newRole}`);
      } catch (err) {
        setRole(prev);
        toast.error(err instanceof Error ? err.message : 'Failed to change role');
      }
    });
  };

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      disabled={isPending}
      className="!min-h-[2rem] !rounded-lg !px-2 !py-1 text-xs !shadow-none"
    >
      {ROLES.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </select>
  );
}
