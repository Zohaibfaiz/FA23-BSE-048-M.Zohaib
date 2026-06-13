import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { formatDateTime } from '../../utils/formatDate';

export default function AuditLogs() {
  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/admin/audit-logs');
    return res;
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Audit Logs</h1>
      <p className="text-white/50 text-sm">System-wide activity trail</p>

      {loading ? (
        <ListSkeleton count={6} />
      ) : (
        <div className="overflow-x-auto glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50">
                <th className="p-4">When</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
              </tr>
            </thead>
            <tbody>
              {data?.logs?.map((log) => (
                <tr key={log._id} className="border-b border-white/5">
                  <td className="p-4 text-white/60 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="p-4">
                    <p className="font-medium">{log.userId?.name}</p>
                    <p className="text-xs text-white/40 capitalize">{log.userId?.role}</p>
                  </td>
                  <td className="p-4">{log.action}</td>
                  <td className="p-4 text-white/60">{log.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.logs?.length && (
            <p className="p-8 text-center text-white/50">No audit logs yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
