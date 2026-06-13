import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { PrescriptionCard } from '../../components/PrescriptionCard';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function Prescriptions() {
  const { data, loading, error } = useFetch(async () => {
    const { data: res } = await api.get('/prescriptions/me');
    return res.prescriptions;
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold">Prescriptions</h1>
      {error && <p className="text-alert text-sm">{error}</p>}
      {loading ? (
        <ListSkeleton count={2} />
      ) : data?.length ? (
        <div className="space-y-4">
          {data.map((rx) => (
            <PrescriptionCard key={rx._id} prescription={rx} />
          ))}
        </div>
      ) : (
        <p className="text-white/50 py-12 text-center">No prescriptions yet.</p>
      )}
    </div>
  );
}
