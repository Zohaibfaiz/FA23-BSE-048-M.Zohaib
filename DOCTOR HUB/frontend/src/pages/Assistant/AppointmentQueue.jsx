import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

export default function AppointmentQueue() {
  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/appointments?status=confirmed');
    return res.appointments;
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Appointment Queue</h1>
      <p className="text-white/50 text-sm">Confirmed appointments ready for consultation</p>

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="space-y-3">
          {data?.map((apt) => {
            const st = APPOINTMENT_STATUS[apt.status];
            return (
              <div key={apt._id} className="glass p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold">{apt.patientId?.name}</p>
                  <p className="text-sm text-white/50">
                    Dr. {apt.doctorId?.userId?.name} · {apt.clinicId?.name}
                  </p>
                  <p className="text-sm text-teal mt-1">
                    {formatDate(apt.date)} · {apt.timeSlot}
                  </p>
                </div>
                <span className={`rounded-lg px-3 py-1 text-xs ${st?.class}`}>{st?.label}</span>
              </div>
            );
          })}
          {!data?.length && <p className="text-center text-white/50 py-12">Queue is empty.</p>}
        </div>
      )}
    </div>
  );
}
