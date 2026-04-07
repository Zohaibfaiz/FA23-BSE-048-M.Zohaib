export const dynamic = 'force-dynamic';

import { Users, ShieldCheck, Shield, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminUsersData } from '@/lib/dashboard';
import { UserRoleManager } from './user-role-manager';

export default async function AdminUsersPage() {
  const users = await getAdminUsersData();

  const clientCount = users.filter((u: any) => u.role === 'client').length;
  const modCount = users.filter((u: any) => u.role === 'moderator').length;
  const adminCount = users.filter((u: any) => u.role === 'admin').length;
  const superCount = users.filter((u: any) => u.role === 'super_admin').length;

  return (
    <>
      <div className="page-title-bar">
        <h1>User Management</h1>
        <p>View all users and manage their roles.</p>
      </div>

      <div className="stat-card-grid mb-6">
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{users.length}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Moderators</p>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{modCount}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <Shield className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{adminCount}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Super Admins</p>
            <Crown className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{superCount}</p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="p-0 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified Seller</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600">
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">
                        {user.full_name || 'No name'}
                      </span>
                    </div>
                  </td>
                  <td className="text-slate-600">{user.email}</td>
                  <td>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'admin' ? 'bg-orange-100 text-orange-700' :
                      user.role === 'moderator' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.is_verified_seller ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="text-slate-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <UserRoleManager userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
