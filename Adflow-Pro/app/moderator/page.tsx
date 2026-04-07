export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Clock3, Eye, ShieldCheck, XCircle, Inbox } from 'lucide-react';
import { MetricCard } from '@/components/metric-card';
import { StatusPill } from '@/components/status-pill';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getModeratorDashboardData } from '@/lib/dashboard';
import { getPlaceholderImage } from '@/lib/media';
import { truncate } from '@/lib/utils';

export default async function ModeratorDashboardPage() {
  const data = await getModeratorDashboardData();

  return (
    <>
      <div className="page-title-bar">
        <h1>Review Queue</h1>
        <p>Moderate incoming campaigns with clear context and fast decisions.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <MetricCard label="Pending Review" value={data.stats.pendingCount} icon={<Clock3 className="h-5 w-5 text-orange-500" />} />
        <MetricCard label="Approved Today" value={data.stats.approvedToday} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
        <MetricCard label="Rejected Today" value={data.stats.rejectedToday} icon={<XCircle className="h-5 w-5 text-rose-500" />} />
      </section>

      <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Queue</p>
            <h2 className="mt-2 text-2xl font-semibold">Listings waiting for moderation</h2>
          </div>
          <div className="space-y-5">
            {data.reviewQueue.length > 0 ? (
              data.reviewQueue.map((ad: any) => (
                <div key={ad.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">{ad.title}</h3>
                        <StatusPill status={ad.status} />
                        {ad.user?.is_verified_seller ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified seller
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-600">
                        {ad.user?.full_name || ad.user?.email} • {ad.category?.name} • {ad.city?.name} • {ad.package?.name}
                      </p>
                      <p className="text-sm leading-7 text-slate-600">{truncate(ad.description, 220)}</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(ad.media ?? []).slice(0, 3).map((media: any) => (
                          <Image
                            key={media.id}
                            src={media.normalized_thumbnail_url || media.original_url || getPlaceholderImage()}
                            alt={ad.title}
                            width={320}
                            height={192}
                            className="h-28 w-full rounded-2xl object-cover"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <form action="/api/moderator/review" method="POST" className="space-y-3">
                        <input type="hidden" name="ad_id" value={ad.id} />
                        <input type="hidden" name="action" value="approve" />
                        <textarea
                          name="notes"
                          placeholder="Approval notes (optional)"
                          rows={2}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                        />
                        <Button type="submit" className="w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600">
                          Approve
                        </Button>
                      </form>
                      <form action="/api/moderator/review" method="POST" className="space-y-3">
                        <input type="hidden" name="ad_id" value={ad.id} />
                        <input type="hidden" name="action" value="reject" />
                        <textarea
                          name="rejection_reason"
                          placeholder="Rejection reason (required)"
                          rows={2}
                          required
                          className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                        />
                        <Button type="submit" variant="destructive" className="w-full rounded-full">
                          Reject
                        </Button>
                      </form>
                      <Link href={`/ads/${ad.slug}`} target="_blank">
                        <Button variant="outline" className="w-full rounded-full mt-1">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Inbox className="h-10 w-10 text-slate-400" />
                <h3>Queue is clear</h3>
                <p>No ads are waiting for moderation right now.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
