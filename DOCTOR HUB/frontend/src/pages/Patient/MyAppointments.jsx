import { useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { AppointmentTimeline } from '../../components/AppointmentTimeline';
import { PaymentUploadForm } from '../../components/PaymentUploadForm';
import { Modal } from '../../components/shared/Modal';
import { PageHeader } from '../../components/shared/PageHeader';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

const needsPayment = (apt) => {
  if (apt.status !== 'pending') return false;
  if (!apt.paymentId) return true;
  if (typeof apt.paymentId === 'object') return !apt.paymentId._id;
  return false;
};

export default function MyAppointments() {
  const [selected, setSelected] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [payAppointment, setPayAppointment] = useState(null);

  const { data, loading, error, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/appointments');
    return res;
  });

  const handleCancel = async () => {
    try {
      await api.delete(`/appointments/${cancelId}`);
      toast.success('Appointment cancelled');
      setCancelId(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        label="Your visits"
        title="My Appointments"
        description="Pending visits need payment upload. Confirmation happens after assistant verification."
      />

      {error && (
        <p className="rounded-sm border border-[var(--color-alert)]/30 bg-[var(--color-alert)]/10 px-4 py-3 text-sm text-[var(--color-alert)]">
          {error}
        </p>
      )}

      {loading ? (
        <ListSkeleton count={3} />
      ) : (
        <div className="space-y-4">
          {data?.appointments?.map((apt) => {
            const statusInfo = APPOINTMENT_STATUS[apt.status];
            const awaitingPayment = needsPayment(apt);

            return (
              <div
                key={apt._id}
                className="glass p-5 transition hover:shadow-[0_12px_32px_rgba(201,169,98,0.1)]"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                  onClick={() => setSelected(apt)}
                >
                  <div>
                    <p className="font-display text-lg font-semibold">
                      Dr. {apt.doctorId?.userId?.name || 'Doctor'}
                    </p>
                    <p className="text-sm text-muted">
                      {formatDate(apt.date)} · {apt.timeSlot} · {apt.clinicId?.name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium ${statusInfo?.class} ${
                      statusInfo?.pulse ? 'animate-pulse' : ''
                    }`}
                  >
                    {awaitingPayment ? 'Awaiting payment' : statusInfo?.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {awaitingPayment && (
                    <button
                      type="button"
                      onClick={() => setPayAppointment(apt)}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      <CreditCard size={16} /> Upload payment
                    </button>
                  )}
                  {apt.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => setCancelId(apt._id)}
                      className="text-sm text-[var(--color-alert)] hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelected(apt)}
                    className="text-sm text-[var(--color-brass)] hover:underline"
                  >
                    View timeline
                  </button>
                </div>
              </div>
            );
          })}
          {!data?.appointments?.length && (
            <p className="text-center text-muted py-12">No appointments yet.</p>
          )}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment timeline" size="lg">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Status: <strong className="capitalize text-[var(--color-brass-light)]">{selected.status}</strong>
            </p>
            {selected.status === 'pending' && !selected.paymentId && (
              <p className="text-sm text-[var(--color-alert)]">
                Payment not uploaded yet — use &quot;Upload payment&quot; to complete booking.
              </p>
            )}
            {selected.status === 'pending' && selected.paymentId && (
              <p className="text-sm text-[var(--color-sage-glow)]">
                Payment submitted — waiting for assistant to verify and confirm.
              </p>
            )}
            <AppointmentTimeline timeline={selected.timeline} status={selected.status} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!payAppointment}
        onClose={() => setPayAppointment(null)}
        title="Upload payment"
        size="md"
      >
        {payAppointment && (
          <PaymentUploadForm
            appointmentId={payAppointment._id}
            onSuccess={() => {
              setPayAppointment(null);
              refetch();
            }}
          />
        )}
      </Modal>

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel appointment?">
        <p className="text-muted text-sm mb-4">This cannot be undone.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setCancelId(null)} className="btn-ghost flex-1">
            Keep
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-sm bg-[var(--color-alert)] py-2.5 font-semibold text-white"
            style={{ borderRadius: '2px 12px 2px 12px' }}
          >
            Cancel appointment
          </button>
        </div>
      </Modal>
    </div>
  );
}
