import { Link } from 'react-router-dom';
import { Calendar, Search, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function PatientHome() {
  const { user } = useAuth();

  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/appointments?limit=5');
    return res;
  });

  const appointments = data?.appointments || [];
  const pending = appointments.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-8">
      <PageHeader
        label="Patient Salon"
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Guest'}`}
        description="Your personal chamber for appointments, records, and prescriptions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard icon={Calendar} label="Upcoming" value={appointments.length} trend={12} />
        <StatsCard icon={Search} label="Pending" value={pending} />
        <StatsCard icon={FileText} label="Records" value={3} trend={5} trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/patient/doctors', label: 'Find a Doctor', icon: Search },
              { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
              { to: '/patient/history', label: 'Medical History', icon: FileText },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between border border-[var(--color-brass)]/15 p-4 transition hover:border-[var(--color-brass)]/40 hover:bg-[var(--color-brass)]/5"
                style={{ borderRadius: '2px 12px 2px 12px' }}
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} className="text-[var(--color-brass)]" />
                  {label}
                </span>
                <ArrowRight size={18} className="text-muted" />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent Appointments</h2>
          {loading ? (
            <ListSkeleton count={2} />
          ) : appointments.length === 0 ? (
            <p className="text-muted text-sm">No appointments yet. Book your first visit!</p>
          ) : (
            <ul className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <li
                  key={apt._id}
                  className="flex justify-between border border-[var(--color-brass)]/10 bg-[var(--color-brass)]/5 p-3 text-sm"
                  style={{ borderRadius: '2px 10px 2px 10px' }}
                >
                  <span>{apt.doctorId?.userId?.name || 'Doctor'}</span>
                  <span className="capitalize text-[var(--color-brass-light)]">{apt.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
