export const dynamic = 'force-dynamic';

import { Building2, MapPinned, Package2, Users2, ScrollText, HeartPulse } from 'lucide-react';
import { MetricCard } from '@/components/metric-card';
import { Card, CardContent } from '@/components/ui/card';
import { getSuperAdminDashboardData } from '@/lib/dashboard';
import { SuperAdminControlPanel } from '@/components/super-admin-control-panel';
import { formatDistanceToNow } from 'date-fns';

export default async function SuperAdminPage() {
  const data = await getSuperAdminDashboardData();

  return (
    <>
      <div className="page-title-bar">
        <h1>Governance</h1>
        <p>Control packages, marketplace taxonomy, and privileged operations.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <MetricCard label="Packages" value={data.packages.length} icon={<Package2 className="h-5 w-5 text-orange-500" />} />
        <MetricCard label="Categories" value={data.categories.length} icon={<Building2 className="h-5 w-5 text-sky-500" />} />
        <MetricCard label="Cities" value={data.cities.length} icon={<MapPinned className="h-5 w-5 text-emerald-500" />} />
        <MetricCard label="Privileged Staff" value={data.staff.length} icon={<Users2 className="h-5 w-5 text-slate-500" />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Packages</p>
            <div className="mt-5 space-y-3">
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="font-medium text-slate-900">{pkg.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{pkg.duration_days} days • Weight {pkg.featured_weight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Categories</p>
            <div className="mt-5 space-y-3">
              {data.categories.map((category: any) => (
                <div key={category.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{category.slug}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Marketplace Staff</p>
            <div className="mt-5 space-y-3">
              {data.staff.map((member: any) => (
                <div key={member.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="font-medium text-slate-900">{member.full_name || member.email}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">{member.role}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <SuperAdminControlPanel
        packages={data.packages as any}
        categories={data.categories as any}
        cities={data.cities as any}
      />

      {/* Audit Logs */}
      <section className="mt-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Audit Logs</h2>
        </div>
        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-0">
            {data.auditLogs.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No audit logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60">
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Time</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">User</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Action</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Target</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.auditLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-5 py-3 text-slate-800 font-medium">
                          {log.user?.full_name || log.user?.email || log.user_id?.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-mono text-xs">
                          {log.target_type} {log.target_id ? `#${log.target_id.slice(0, 8)}` : ''}
                        </td>
                        <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details).slice(0, 80) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* System Health Logs */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
        </div>
        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-0">
            {data.healthLogs.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No health checks recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60">
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Time</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Check</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Status</th>
                      <th className="px-5 py-3 text-left font-medium text-slate-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.healthLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-5 py-3 text-slate-800 font-medium">{log.check_name ?? log.event_type ?? 'health_check'}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            log.status === 'healthy' || log.status === 'ok'
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.status === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                          {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details).slice(0, 100)) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
