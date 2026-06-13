import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function SystemConfig() {
  const { data, loading, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/admin/system-config');
    return res.config;
  });

  const [draft, setDraft] = useState(null);
  const form = draft || {
    maintenanceMode: data?.maintenanceMode || false,
    platformName: data?.platformName || 'Doctor Hub',
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/system-config', form);
      toast.success('System config updated');
      setDraft(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  if (loading) return <ListSkeleton count={2} />;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-heading text-3xl font-bold">System Config</h1>

      <form onSubmit={save} className="glass p-6 space-y-4">
        <div>
          <label className="text-sm text-white/60">Platform Name</label>
          <input
            className="input-field mt-1"
            value={form.platformName}
            onChange={(e) => setDraft({ ...form, platformName: e.target.value })}
          />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-white/10 p-4 cursor-pointer">
          <div>
            <p className="font-medium">Maintenance Mode</p>
            <p className="text-xs text-white/50">Blocks all users except super admins</p>
          </div>
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setDraft({ ...form, maintenanceMode: e.target.checked })}
            className="h-5 w-5 accent-teal"
          />
        </label>

        <button type="submit" className="btn-primary w-full">Save Configuration</button>
      </form>
    </div>
  );
}
