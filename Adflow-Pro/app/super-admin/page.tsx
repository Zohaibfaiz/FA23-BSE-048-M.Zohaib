export const dynamic = 'force-dynamic';

import { Building2, MapPinned, Package2, Users2 } from 'lucide-react';
import { ConsoleShell, LogoutAction } from '@/components/console-shell';
import { MetricCard } from '@/components/metric-card';
import { Card, CardContent } from '@/components/ui/card';
import { getSuperAdminDashboardData } from '@/lib/dashboard';
import { SuperAdminControlPanel } from '@/components/super-admin-control-panel';

export default async function SuperAdminPage() {
  const data = await getSuperAdminDashboardData();

  return (
    <ConsoleShell
      brandTag="Super Admin"
      title="Control packages, marketplace taxonomy, and privileged operations from a single governance view."
      subtitle="Use this layer to manage the commercial model and the people operating the marketplace."
      userLabel={data.user.full_name || data.user.email}
      navItems={[
        { href: '/admin', label: 'Admin Console' },
        { href: '/moderator', label: 'Moderator Desk' },
        { href: '/dashboard', label: 'Client Dashboard' },
      ]}
      actions={<LogoutAction />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Packages" value={data.packages.length} icon={<Package2 className="h-5 w-5 text-orange-500" />} />
        <MetricCard label="Categories" value={data.categories.length} icon={<Building2 className="h-5 w-5 text-sky-500" />} />
        <MetricCard label="Cities" value={data.cities.length} icon={<MapPinned className="h-5 w-5 text-emerald-500" />} />
        <MetricCard label="Privileged Staff" value={data.staff.length} icon={<Users2 className="h-5 w-5 text-slate-500" />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
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
    </ConsoleShell>
  );
}
