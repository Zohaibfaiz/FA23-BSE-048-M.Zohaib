import { Activity, DollarSign, Layers3, ShieldAlert } from 'lucide-react';
import { ConsoleShell, LogoutAction } from '@/components/console-shell';
import { MetricCard } from '@/components/metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminDashboardData } from '@/lib/dashboard';
import { formatCurrency } from '@/lib/utils';
import { AdminScheduleForm } from '@/components/admin-schedule-form';

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <ConsoleShell
      brandTag="Admin Control"
      title="Verify payments, schedule launches, and watch marketplace health from one operations layer."
      subtitle="Revenue, verification queues, publishing controls, and system health all feed the same production workflow."
      userLabel={data.user.full_name || data.user.email}
      navItems={[
        { href: '/moderator', label: 'Moderator Desk' },
        { href: '/super-admin', label: 'Super Admin' },
        { href: '/dashboard', label: 'Client Dashboard' },
      ]}
      actions={<LogoutAction />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Verified Revenue" value={formatCurrency(data.summary.verifiedRevenue)} icon={<DollarSign className="h-5 w-5 text-emerald-500" />} />
        <MetricCard label="Total Ads" value={data.summary.totalAds} icon={<Layers3 className="h-5 w-5 text-slate-400" />} />
        <MetricCard label="Active Ads" value={data.summary.activeAds} icon={<Activity className="h-5 w-5 text-sky-500" />} />
        <MetricCard label="Pending Payments" value={data.pendingPayments.length} icon={<ShieldAlert className="h-5 w-5 text-orange-500" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Payment Queue</p>
            <div className="mt-5 space-y-4">
              {data.pendingPayments.length > 0 ? (
                data.pendingPayments.map((payment: any) => (
                  <div key={payment.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{payment.ad?.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {payment.user?.full_name || payment.user?.email} • {payment.transaction_ref}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <form action="/api/admin/verify-payment" method="POST">
                          <input type="hidden" name="payment_id" value={payment.id} />
                          <input type="hidden" name="action" value="verify" />
                          <Button type="submit" className="rounded-full bg-emerald-500 hover:bg-emerald-600">
                            Verify
                          </Button>
                        </form>
                        <form action="/api/admin/verify-payment" method="POST">
                          <input type="hidden" name="payment_id" value={payment.id} />
                          <input type="hidden" name="action" value="reject" />
                          <Button type="submit" variant="destructive" className="rounded-full">
                            Reject
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center text-slate-600">
                  No payments are pending verification.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Scheduling Queue</p>
              <div className="mt-5 space-y-4">
                {data.verifiedAds.length > 0 ? (
                  data.verifiedAds.map((ad: any) => (
                    <div key={ad.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                      <p className="font-medium text-slate-900">{ad.title}</p>
                      <p className="mt-1 mb-4 text-sm text-slate-600">
                        {ad.package?.name} • {ad.package?.duration_days} days
                      </p>
                      <AdminScheduleForm adId={ad.id} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No verified ads are waiting to be scheduled.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">System Health</p>
              <div className="mt-5 space-y-3">
                {data.healthLogs.map((log: any) => (
                  <div key={log.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{log.check_type}</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{log.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{log.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </ConsoleShell>
  );
}
