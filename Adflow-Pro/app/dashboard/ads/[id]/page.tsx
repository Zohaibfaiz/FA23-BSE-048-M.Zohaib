import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Activity, ArrowLeft, CreditCard, Eye, MousePointerClick, Pencil } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ConsoleShell, LogoutAction } from '@/components/console-shell';
import { MetricCard } from '@/components/metric-card';
import { StatusPill } from '@/components/status-pill';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitForReviewButton } from '@/components/submit-for-review-button';
import { PaymentSubmissionForm } from '@/components/payment-submission-form';
import { getPlaceholderImage } from '@/lib/media';
import { formatCurrency } from '@/lib/utils';

export default async function AdDetailDashboardPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const supabase = await createClient();
  const { data: ad } = await supabase
    .from('ads')
    .select(`
      *,
      package:packages(*),
      category:categories(*),
      city:cities(*),
      media:ad_media(*),
      payment:payments(*)
    `)
    .eq('id', params.id)
    .single();

  if (!ad) notFound();
  if (ad.user_id !== user.id && !['moderator', 'admin', 'super_admin'].includes(user.role)) {
    redirect('/dashboard');
  }

  const { data: statusHistory } = await supabase
    .from('ad_status_history')
    .select('*')
    .eq('ad_id', ad.id)
    .order('created_at', { ascending: false });

  const payment = Array.isArray(ad.payment) ? ad.payment[0] : ad.payment;

  return (
    <ConsoleShell
      brandTag="Campaign Detail"
      title={ad.title}
      subtitle="Review the campaign state, payment readiness, media quality, and audit trail from one place."
      userLabel={user.full_name || user.email}
      navItems={[
        { href: '/dashboard', label: 'Back to Dashboard' },
        { href: '/dashboard/ads/create', label: 'Create Another Ad' },
        { href: '/explore', label: 'Marketplace' },
      ]}
      actions={<LogoutAction />}
    >
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Views" value={ad.view_count} icon={<Eye className="h-5 w-5 text-slate-400" />} />
        <MetricCard label="Clicks" value={ad.click_count} icon={<MousePointerClick className="h-5 w-5 text-sky-500" />} />
        <MetricCard label="Rank Score" value={Math.round(Number(ad.rank_score ?? 0))} icon={<Activity className="h-5 w-5 text-orange-500" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-tight">{ad.title}</h2>
                    <StatusPill status={ad.status} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {ad.category?.name} • {ad.city?.name} • {ad.package?.name}
                  </p>
                  <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">{ad.description}</p>
                </div>
                {['draft', 'submitted'].includes(ad.status) ? (
                  <Link href={`/dashboard/ads/${ad.id}/edit`}>
                    <Button className="rounded-full">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Listing
                    </Button>
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm text-slate-500">Contact</p>
                  <p className="mt-2 font-medium text-slate-900">{ad.contact_email}</p>
                  {ad.contact_phone ? <p className="mt-1 text-sm text-slate-600">{ad.contact_phone}</p> : null}
                  {ad.website_url ? <p className="mt-1 text-sm text-slate-600">{ad.website_url}</p> : null}
                </div>
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm text-slate-500">Commercial</p>
                  <p className="mt-2 font-medium text-slate-900">{ad.price ? formatCurrency(Number(ad.price)) : 'No display price'}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Package duration: {ad.package?.duration_days ?? 0} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {ad.media?.length > 0 ? (
            <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Media</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ad.media.map((media: any) => (
                    <div key={media.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-3">
                      <Image
                        src={media.normalized_thumbnail_url || media.original_url || getPlaceholderImage()}
                        alt={ad.title}
                        width={800}
                        height={480}
                        className="h-40 w-full rounded-xl object-cover"
                      />
                      <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                        <span>{media.source_type}</span>
                        <span>{media.validation_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Workflow History</p>
              <div className="mt-5 space-y-3">
                {(statusHistory ?? []).map((history: any) => (
                  <div key={history.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {history.from_status ? <span className="text-sm text-slate-500">{history.from_status}</span> : null}
                      <span className="text-sm text-slate-400">to</span>
                      <span className="text-sm font-medium text-slate-900">{history.to_status}</span>
                    </div>
                    {history.notes ? <p className="mt-2 text-sm text-slate-600">{history.notes}</p> : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {new Date(history.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Next Action</p>
              <div className="mt-5 space-y-4">
                {ad.status === 'draft' ? (
                  <SubmitForReviewButton adId={ad.id} />
                ) : null}
                {ad.status === 'payment_pending' ? (
                  <PaymentSubmissionForm adId={ad.id} />
                ) : null}
                {ad.status === 'published' ? (
                  <Link href={`/ads/${ad.slug}`} target="_blank">
                    <Button variant="outline" className="w-full rounded-full">View Public Listing</Button>
                  </Link>
                ) : null}
                {!['draft', 'payment_pending', 'published'].includes(ad.status) ? (
                  <p className="text-sm leading-7 text-slate-600">
                    This campaign is currently in the <span className="font-medium">{ad.status}</span> stage. No client action is required right now.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {payment ? (
            <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Payment Record</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(Number(payment.amount ?? 0))}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="font-medium text-slate-900">{payment.status}</span>
                  </div>
                  {payment.transaction_ref ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Reference</span>
                      <span className="font-mono text-xs text-slate-900">{payment.transaction_ref}</span>
                    </div>
                  ) : null}
                  {payment.payment_proof_url ? (
                    <a href={payment.payment_proof_url} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-orange-600 hover:text-orange-500">
                      Open payment proof
                    </a>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </ConsoleShell>
  );
}
