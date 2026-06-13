import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';

const ROLES = ['', 'patient', 'doctor', 'assistant', 'admin', 'superadmin'];

export default function ManageUsers({ defaultRole = '' }) {
  const [roleFilter, setRoleFilter] = useState(defaultRole);

  const { data, loading, refetch } = useFetch(async () => {
    const params = roleFilter ? `?role=${roleFilter}` : '';
    const { data: res } = await api.get(`/admin/users${params}`);
    return res;
  }, [roleFilter]);

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User suspended' : 'User activated');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold">Manage Users</h1>
        <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-white/60">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    <span className={u.isActive ? 'text-success' : 'text-alert'}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.role !== 'superadmin' && (
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        className="text-sm text-teal hover:underline"
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
