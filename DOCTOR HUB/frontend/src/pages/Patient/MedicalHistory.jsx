import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { MedicalHistoryTimeline } from '../../components/MedicalHistoryTimeline';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function MedicalHistory() {
  const { user } = useAuth();

  const { data, loading, error } = useFetch(
    async () => {
      const { data: res } = await api.get(`/history/${user._id}`);
      return res.history;
    },
    [user?._id],
    { enabled: Boolean(user?._id) }
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold">Medical History</h1>
        <p className="text-white/50 text-sm mt-1">
          Records are permanent and cannot be edited or deleted.
        </p>
      </div>

      {error && <p className="text-alert text-sm">{error}</p>}
      {loading ? <ListSkeleton count={3} /> : <MedicalHistoryTimeline records={data?.records || []} />}

      {data?.labReports?.length > 0 && (
        <div className="glass p-6 mt-8">
          <h2 className="font-heading font-bold mb-4">Lab Reports</h2>
          <ul className="space-y-2">
            {data.labReports.map((r, i) => (
              <li key={i}>
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-teal hover:underline">
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
