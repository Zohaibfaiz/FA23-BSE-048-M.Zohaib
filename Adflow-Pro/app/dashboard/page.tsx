export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Activity, Bell, CreditCard, FileText, Plus, Rocket, Sparkles } from 'lucide-react';
import { ConsoleShell, LogoutAction } from '@/components/console-shell';
import { MetricCard } from '@/components/metric-card';
import { StatusPill } from '@/components/status-pill';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getClientDashboardData } from '@/lib/dashboard';
import { formatCurrency, truncate } from '@/lib/utils';

export default async function DashboardPage() {
  const data = await getClientDashboardData();

  return (
    <ConsoleShell
      brandTag="Client Console"
      title="Launch, track, and optimize every sponsored listing from one operating dashboard."
      subtitle="Follow each listing through moderation, payment verification, scheduling, and publishing with live status visibility."
      userLabel={data.user.full_name || data.user.email}
      navItems={[
        { href: '/dashboard/ads/create', label: 'Create Ad' },
        { href: '/explore', label: 'Marketplace' },
        { href: '/packages', label: 'Packages' },
        { href: '/contact', label: 'Support' },
      ]}
      actions={<LogoutAction />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Ads" value={data.stats.totalAds} icon={<FileText className="h-5 w-5 text-slate-400" />} />
        <MetricCard label="Published" value={data.stats.publishedAds} icon={<Rocket className="h-5 w-5 text-emerald-500" />} />
        <MetricCard label="In Progress" value={data.stats.pendingAds} icon={<Activity className="h-5 w-5 text-orange-500" />} />
        <MetricCard label="Verified Spend" value={formatCurrency(data.stats.totalSpend)} icon={<CreditCard className="h-5 w-5 text-sky-500" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Your Listings</p>
                <h2 className="mt-2 text-2xl font-semibold">Campaign pipeline</h2>
              </div>
              <Link href="/dashboard/ads/create">
                <Button className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Ad
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {data.ads.length > 0 ? (
                data.ads.map((ad: any) => (
                  <div key={ad.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold">{ad.title}</h3>
                          <StatusPill status={ad.status} />
                        </div>
                        <p className="text-sm text-slate-600">
                          {ad.category?.name} in {ad.city?.name} • {ad.package?.name ?? 'No package'}
                        </p>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">{truncate(ad.description, 150)}</p>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/dashboard/ads/${ad.id}`}>
                          <Button variant="outline" className="rounded-full">View</Button>
                        </Link>
                        <Link href={`/dashboard/ads/${ad.id}/edit`}>
                          <Button className="rounded-full bg-orange-500 text-slate-950 hover:bg-orange-400">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-orange-500" />
                  <h3 className="mt-4 text-xl font-semibold">No campaigns yet</h3>
                  <p className="mt-2 text-sm text-slate-600">Create your first listing and push it through the approval workflow.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Alerts</p>
              <h2 className="mt-2 text-2xl font-semibold">Recent notifications</h2>
              <div className="mt-5 space-y-3">
                {data.notifications.length > 0 ? (
                  data.notifications.map((notification: any) => (
                    <div key={notification.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <Bell className="mt-1 h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium text-slate-900">{notification.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No unread notifications right now.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Activity Timeline</p>
              <div className="mt-5 space-y-4">
                {data.timeline.map((item: any) => (
                  <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-900">{item.ad?.title ?? 'Ad update'}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Status moved to <span className="font-medium">{item.to_status}</span>
                    </p>
                    {item.notes ? <p className="mt-2 text-sm text-slate-500">{item.notes}</p> : null}
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
