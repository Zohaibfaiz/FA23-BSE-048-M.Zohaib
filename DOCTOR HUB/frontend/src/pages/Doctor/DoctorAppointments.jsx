import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { Modal } from '../../components/shared/Modal';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

export default function DoctorAppointments() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, loading, refetch } = useFetch(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (dateFilter) params.set('date', dateFilter);
    const { data: res } = await api.get(`/appointments?${params}`);
    return res;
  }, [statusFilter, dateFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Appointments</h1>

      <div className="flex flex-wrap gap-3">
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          className="input-field w-auto"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-3">
          {data?.appointments?.map((apt) => {
            const st = APPOINTMENT_STATUS[apt.status];
            return (
              <div
                key={apt._id}
                className="glass flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:border-teal/30"
                onClick={() => setSelected(apt)}
              >
                <div>
                  <p className="font-heading font-bold">{apt.patientId?.name}</p>
                  <p className="text-sm text-white/50">
                    {formatDate(apt.date)} · {apt.timeSlot} · {apt.clinicId?.name}
                  </p>
                </div>
                <span className={`rounded-lg px-3 py-1 text-xs ${st?.class} ${st?.pulse ? 'animate-pulse' : ''}`}>
                  {st?.label}
                </span>
              </div>
            );
          })}
          {!data?.appointments?.length && (
            <p className="py-12 text-center text-white/50">No appointments match filters.</p>
          )}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Appointment">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              Patient: <strong>{selected.patientId?.name}</strong> · {selected.patientId?.phone}
            </p>
            <div className="flex flex-wrap gap-2">
              {['confirmed', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(selected._id, s)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm capitalize hover:bg-white/10"
                >
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
