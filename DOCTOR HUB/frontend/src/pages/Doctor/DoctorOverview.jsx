import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/shared/StatsCard';
import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { formatDate } from '../../utils/formatDate';
import { APPOINTMENT_STATUS } from '../../utils/constants';

export default function DoctorOverview() {
  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/appointments?limit=50');
    return res;
  });

  const appointments = data?.appointments || [];
  const today = new Date().toDateString();
  const todayCount = appointments.filter((a) => new Date(a.date).toDateString() === today).length;
  const pending = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const uniquePatients = new Set(appointments.map((a) => a.patientId?._id)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Overview</h1>
        <p className="text-white/50">Your practice at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={Calendar} label="Today" value={todayCount} />
        <StatsCard icon={Clock} label="Active" value={pending} />
        <StatsCard icon={CheckCircle} label="Completed" value={completed} />
        <StatsCard icon={Users} label="Patients" value={uniquePatients} />
      </div>

      <div className="glass p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Upcoming Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-teal hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <ListSkeleton count={3} />
        ) : appointments.length === 0 ? (
          <p className="text-white/50 text-sm">No appointments yet.</p>
        ) : (
          <ul className="space-y-3">
            {appointments.slice(0, 6).map((apt) => {
              const st = APPOINTMENT_STATUS[apt.status];
              return (
                <li key={apt._id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <div>
                    <p className="font-medium">{apt.patientId?.name}</p>
                    <p className="text-xs text-white/50">
                      {formatDate(apt.date)} · {apt.timeSlot}
                    </p>
                  </div>
                  <span className={`rounded-lg px-2 py-0.5 text-xs ${st?.class}`}>{st?.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
