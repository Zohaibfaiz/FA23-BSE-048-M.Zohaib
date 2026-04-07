'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsChartsProps {
  revenueByPackage: { package: string; revenue: number }[];
  approvalRate: number;
  rejectionRate: number;
  adsByCategory: { category: string; count: number }[];
  adsByCity: { city: string; count: number }[];
}

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#6366f1'];

export function AnalyticsCharts({
  revenueByPackage,
  approvalRate,
  rejectionRate,
  adsByCategory,
  adsByCity,
}: AnalyticsChartsProps) {
  const approvalData = [
    { name: 'Approved', value: Math.round(approvalRate * 100) },
    { name: 'Rejected', value: Math.round(rejectionRate * 100) },
    { name: 'Pending', value: Math.max(0, 100 - Math.round(approvalRate * 100) - Math.round(rejectionRate * 100)) },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8'];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue by Package */}
      <div className="surface-card rounded-[2rem] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
          Revenue by Package
        </h3>
        {revenueByPackage.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">No revenue data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByPackage} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="package" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value: any) => [`Rs ${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {revenueByPackage.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Approval / Rejection Pie */}
      <div className="surface-card rounded-[2rem] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
          Approval vs Rejection
        </h3>
        {approvalData.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">No review data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={approvalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
              >
                {approvalData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" />
              <Tooltip formatter={(value: any) => [`${value}%`]} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Ads by Category */}
      <div className="surface-card rounded-[2rem] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
          Ads by Category
        </h3>
        {adsByCategory.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">No category data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={adsByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {adsByCategory.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Ads by City */}
      <div className="surface-card rounded-[2rem] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
          Ads by City
        </h3>
        {adsByCity.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">No city data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={adsByCity} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis dataKey="city" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {adsByCity.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
