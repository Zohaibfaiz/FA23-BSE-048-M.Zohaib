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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-2xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300">Setup Required</p>
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_#fffdf8_0%,_#ffffff_45%,_#f8fafc_100%)] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight">AdFlow Pro</Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/explore">Explore</Link>
            <Link href="/packages">Packages</Link>
            <Link href="/faq">Workflow</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="rounded-full">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="rounded-full bg-slate-950 px-5 hover:bg-slate-800">Launch Campaign</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 rounded-[2rem] border border-slate-200/70 bg-slate-950 px-6 py-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
            <div className="space-y-5">
              <Badge className="rounded-full bg-orange-500/15 px-4 py-1 text-xs uppercase tracking-[0.3em] text-orange-200 hover:bg-orange-500/15">
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
                <Button className="rounded-full bg-orange-500 px-6 text-slate-950 hover:bg-orange-400">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
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
                <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="mesh-panel rounded-[2rem] border border-slate-200/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-500">Workflow Engine</p>
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
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
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
            <div key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">{feature.icon}</div>
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Launch Packages</p>
            <div className="mt-6 space-y-4">
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{pkg.name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                    </div>
                    {pkg.homepage_visibility ? (
                      <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Featured</Badge>
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

          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live Marketplace</p>
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
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Badge className="rounded-full bg-slate-950 text-white hover:bg-slate-950">
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
            <div key={item.label} className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
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
