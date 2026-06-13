import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { PaymentVerifier } from '../../components/PaymentVerifier';
import { StatsCard } from '../../components/shared/StatsCard';
import { CreditCard, Clock } from 'lucide-react';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function PendingPayments() {
  const [selected, setSelected] = useState(null);

  const { data, loading, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/payments/pending?status=pending');
    return res;
  });

  const handleVerify = async (id, status, verificationNote) => {
    try {
      await api.patch(`/payments/${id}/verify`, { status, verificationNote });
      toast.success(status === 'verified' ? 'Payment verified — appointment confirmed!' : 'Payment rejected');
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const payments = data?.payments || [];
  const selectedPayment = payments.find((p) => p._id === selected) || payments[0];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Pending Payments</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard icon={Clock} label="Pending" value={data?.stats?.pendingCount || 0} />
        <StatsCard icon={CreditCard} label="Verified Today" value={data?.stats?.verifiedToday || 0} />
      </div>

      {loading ? (
        <ListSkeleton count={2} />
      ) : payments.length === 0 ? (
        <p className="text-white/50 py-12 text-center">No pending payments.</p>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {payments.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelected(p._id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm ${
                  (selected || payments[0]?._id) === p._id ? 'bg-teal text-navy' : 'glass'
                }`}
              >
                {p.appointmentId?.patientId?.name}
              </button>
            ))}
          </div>
          {selectedPayment && (
            <PaymentVerifier
              payment={selectedPayment}
              onVerify={handleVerify}
            />
          )}
        </>
      )}
    </div>
  );
}
