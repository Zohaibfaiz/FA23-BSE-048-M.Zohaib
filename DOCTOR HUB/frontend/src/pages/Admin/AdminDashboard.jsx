import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, Stethoscope, Calendar, AlertCircle } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function AdminDashboard() {
  const [period, setPeriod] = useState('weekly');

  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get(`/admin/stats?period=${period}`);
    return res.stats;
  }, [period]);

  if (loading) return <ListSkeleton count={4} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-white/50">Platform analytics and overview</p>
        </div>
        <select className="input-field w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">Daily (7 days)</option>
          <option value="weekly">Weekly (4 weeks)</option>
          <option value="monthly">Monthly (6 months)</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={Users} label="Total Users" value={data?.totalUsers || 0} />
        <StatsCard icon={Stethoscope} label="Doctors" value={data?.totalDoctors || 0} />
        <StatsCard icon={Calendar} label="Patients" value={data?.totalPatients || 0} />
        <StatsCard icon={AlertCircle} label="Pending Doctors" value={data?.pendingDoctors || 0} />
      </div>

      <div className="glass p-6">
        <h2 className="font-heading text-lg font-bold mb-6">Appointments</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#132337', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 12 }}
              />
              <Legend />
              <Bar dataKey="count" name="Total" fill="#00B4D8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="confirmed" name="Confirmed" fill="#06D6A0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#9B5DE5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
