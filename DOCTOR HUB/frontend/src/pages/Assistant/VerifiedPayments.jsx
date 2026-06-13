import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { formatDateTime } from '../../utils/formatDate';

export default function VerifiedPayments() {
  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/payments/pending?status=verified');
    return res.payments;
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Verified Payments</h1>

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-3">
          {data?.map((p) => (
            <div key={p._id} className="glass p-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium">{p.appointmentId?.patientId?.name}</p>
                <p className="text-sm text-white/50">
                  Rs. {p.amount} · {p.appointmentId?.clinicId?.name}
                </p>
              </div>
              <p className="text-xs text-success">{formatDateTime(p.updatedAt)}</p>
            </div>
          ))}
          {!data?.length && <p className="text-center text-white/50 py-12">No verified payments yet.</p>}
        </div>
      )}
    </div>
  );
}
