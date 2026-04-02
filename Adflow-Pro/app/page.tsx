import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, Clock3, Globe2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublicMarketplaceData } from '@/lib/dashboard';
import { formatCurrency, truncate } from '@/lib/utils';

export default async function HomePage() {
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  if (!isSupabaseConfigured) {
    return (
      <div className="page-shell flex items-center justify-center px-6 text-white">
        <div className="surface-dark hero-outline max-w-2xl space-y-4 rounded-[2.25rem] px-10 py-12 text-center">
          <p className="section-kicker">Setup Required</p>
          <h1 className="text-4xl font-semibold">Connect Supabase to unlock the full AdFlow Pro marketplace.</h1>
          <p className="text-slate-300">
            Add your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and service key in
            `.env.local`, then refresh the app.
          </p>
        </div>
      </div>
    );
  }

  const data = await getPublicMarketplaceData();

  return (
    <div className="page-shell text-slate-950">
      <header className="shell-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="brand-mark text-xl font-semibold tracking-tight">AdFlow Pro</Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/explore" className="hover:text-slate-950">Explore</Link>
            <Link href="/packages" className="hover:text-slate-950">Packages</Link>
            <Link href="/faq" className="hover:text-slate-950">Workflow</Link>
            <Link href="/contact" className="hover:text-slate-950">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="rounded-full">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="rounded-full px-5">Launch Campaign</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-dark hero-outline space-y-8 rounded-[2.35rem] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="space-y-5">
              <Badge className="rounded-full border-white/10 bg-white/10 px-4 py-1 text-[11px] tracking-[0.26em] text-orange-100 hover:bg-white/10">
                Sponsored Marketplace OS
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Run sponsored listings with real approvals, verified payments, and timed publishing.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                AdFlow Pro is built for teams that need more than CRUD. Clients submit listings,
                moderators review content, admins verify payments, and only approved campaigns go live.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register">
                <Button className="rounded-full px-6">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="rounded-full border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                  View Live Listings
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Workflow States', value: '10' },
                { label: 'Package Tiers', value: '3' },
                { label: 'Protected Roles', value: '4' },
              ].map((stat) => (
                <div key={stat.label} className="surface-dark-tile rounded-[1.5rem] p-4">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="mesh-panel rounded-[2.25rem] border border-white/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
              <p className="section-kicker-light mb-4">Workflow Engine</p>
              <div className="grid gap-3">
                {[
                  'Draft',
                  'Submitted',
                  'Under Review',
                  'Payment Pending',
                  'Payment Submitted',
                  'Payment Verified',
                  'Scheduled',
                  'Published',
                  'Expired',
                  'Archived',
                ].map((item, index) => (
                  <div key={item} className="surface-card-muted flex items-center justify-between rounded-[1.35rem] px-4 py-3">
                    <span className="font-medium text-slate-700">{item}</span>
                    <span className="text-xs text-slate-400">Step {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <ShieldCheck className="h-5 w-5 text-orange-500" />,
              title: 'Moderated quality',
              description: 'Every listing passes through a review queue before payments or publishing.',
            },
            {
              icon: <Clock3 className="h-5 w-5 text-sky-500" />,
              title: 'Automation built in',
              description: 'Scheduled publishing, expiry jobs, reminders, and health logging are ready.',
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
              title: 'Ranking logic',
              description: 'Featured, package weight, freshness, admin boost, and seller trust drive placement.',
            },
            {
              icon: <Globe2 className="h-5 w-5 text-violet-500" />,
              title: 'Media normalization',
              description: 'HTTPS image URLs and YouTube thumbnails are validated and normalized automatically.',
            },
          ].map((feature) => (
            <div key={feature.title} className="surface-card rounded-[1.9rem] p-6">
              <div className="mb-4 inline-flex rounded-[1.15rem] bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">{feature.icon}</div>
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card rounded-[2.2rem] p-6">
            <p className="section-kicker-light">Launch Packages</p>
            <div className="mt-6 space-y-4">
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="surface-card-muted rounded-[1.55rem] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{pkg.name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                    </div>
                    {pkg.homepage_visibility ? (
                      <Badge className="rounded-full border-emerald-100 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Featured</Badge>
                    ) : null}
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-sm text-slate-500">{pkg.duration_days} day visibility window</p>
                    <p className="text-2xl font-semibold">{formatCurrency(Number(pkg.price))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2.2rem] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-kicker-light">Live Marketplace</p>
                <h2 className="mt-2 text-2xl font-semibold">Published listings only, ranked by marketplace score.</h2>
              </div>
              <Link href="/explore">
                <Button variant="outline" className="rounded-full">Browse all</Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.liveAds.slice(0, 4).map((ad: any) => (
                <Link
                  key={ad.id}
                  href={`/ads/${ad.slug}`}
                  className="surface-card-muted rounded-[1.55rem] p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Badge className="rounded-full border-slate-900 bg-slate-900 text-white hover:bg-slate-900">
                      {ad.package_name}
                    </Badge>
                    {ad.is_verified_seller ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : null}
                  </div>
                  <h3 className="text-lg font-semibold">{ad.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{truncate(ad.description, 110)}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{ad.city_name}</span>
                    <span>Rank {Math.round(Number(ad.rank_score ?? 0))}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Categories', value: data.categories.length, icon: <Sparkles className="h-5 w-5 text-orange-500" /> },
            { label: 'Cities', value: data.cities.length, icon: <Building2 className="h-5 w-5 text-sky-500" /> },
            { label: 'Featured Ads', value: data.featuredAds.length, icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
          ].map((item) => (
            <div key={item.label} className="surface-card rounded-[1.9rem] p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{item.label}</p>
                {item.icon}
              </div>
              <p className="mt-4 text-4xl font-semibold">{item.value}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
