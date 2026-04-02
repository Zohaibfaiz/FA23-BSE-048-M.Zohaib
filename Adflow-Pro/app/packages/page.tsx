import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export default async function PackagesPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase.from('packages').select('*').eq('is_active', true).order('price', { ascending: true });

  return (
    <div className="page-shell">
      <header className="shell-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="brand-mark text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <div className="flex items-center gap-3">
            <Link href="/explore"><Button variant="ghost" className="rounded-full">Explore</Button></Link>
            <Link href="/auth/register"><Button className="rounded-full">Start Campaign</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="surface-dark hero-outline rounded-[2.25rem] px-6 py-8 text-white lg:px-10">
          <p className="section-kicker">Package Engine</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Choose the visibility tier that matches your growth goal.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            Every package passes through moderation, payment verification, analytics tracking, and timed publishing. The difference is reach, weight, and featured treatment.
          </p>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {packages?.map((pkg: any) => (
            <Card key={pkg.id} className={`surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${pkg.tier === 'premium' ? 'ring-2 ring-orange-300' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    {pkg.tier === 'premium' ? <Badge className="rounded-full border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100">Top Visibility</Badge> : null}
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight">{pkg.name}</h2>
                  </div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{pkg.tier}</p>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">{pkg.description}</p>
                <div className="mt-6 text-4xl font-semibold">{formatCurrency(Number(pkg.price))}</div>
                <p className="mt-2 text-sm text-slate-500">{pkg.duration_days} day campaign window</p>

                <div className="mt-6 space-y-3">
                  {[
                    `${pkg.duration_days} days of visibility`,
                    pkg.homepage_visibility ? 'Homepage boost included' : 'Marketplace placement included',
                    `${pkg.featured_weight}x package ranking weight`,
                    pkg.refresh_rule === 'auto_3_days' ? 'Auto-refresh every 3 days' : pkg.refresh_rule === 'manual' ? 'Manual refresh support' : 'Standard freshness flow',
                    'Moderation and payment verification',
                    'Dashboard analytics and workflow tracking',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/auth/register" className="mt-8 block">
                  <Button className="w-full rounded-full" variant={pkg.tier === 'premium' ? 'default' : 'outline'}>
                    Choose {pkg.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
