import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function ManagePatients() {
  const { data, loading, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/admin/users?role=patient');
    return res.users;
  });

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Patient suspended' : 'Patient activated');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Manage Patients</h1>
      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((u) => (
            <div key={u._id} className="glass p-4">
              <p className="font-heading font-bold">{u.name}</p>
              <p className="text-sm text-white/50">{u.email}</p>
              <p className="text-xs mt-2">{u.phone || 'No phone'}</p>
              <button type="button" onClick={() => toggleActive(u)} className="mt-3 text-sm text-teal hover:underline">
                {u.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
