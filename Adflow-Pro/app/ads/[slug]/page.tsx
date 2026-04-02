import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BadgeCheck, Globe, Mail, MapPin, Phone, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { getPlaceholderImage } from '@/lib/media';
import { formatCurrency } from '@/lib/utils';

export default async function AdDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: ad } = await supabase.from('v_public_ads').select('*').eq('slug', params.slug).single();

  if (!ad) notFound();

  const { data: media } = await supabase.from('ad_media').select('*').eq('ad_id', ad.id).order('sort_order');
  supabase.from('ads').update({ view_count: ad.view_count + 1 }).eq('id', ad.id).then();

  const heroMedia = media?.[0];

  return (
    <div className="page-shell">
      <header className="shell-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="brand-mark text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button variant="ghost" className="rounded-full">Back to Explore</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="rounded-full">Launch Your Ad</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="surface-card rounded-[2rem] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-3">
              {ad.is_featured ? <Badge className="rounded-full border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100">Featured</Badge> : null}
              <Badge className="rounded-full border-slate-900 bg-slate-900 text-white hover:bg-slate-900">{ad.package_name}</Badge>
              {ad.is_verified_seller ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified seller
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{ad.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {ad.city_name}
              </span>
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Rank {Math.round(Number(ad.rank_score ?? 0))}
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
              <Image
                src={heroMedia?.normalized_thumbnail_url || heroMedia?.original_url || getPlaceholderImage()}
                alt={ad.title}
                width={1600}
                height={900}
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="surface-card-muted rounded-[1.25rem] p-4">
                <p className="text-sm text-slate-500">Category</p>
                <p className="mt-2 font-medium text-slate-900">{ad.category_name}</p>
              </div>
              <div className="surface-card-muted rounded-[1.25rem] p-4">
                <p className="text-sm text-slate-500">Seller</p>
                <p className="mt-2 font-medium text-slate-900">{ad.seller_name || 'Marketplace Seller'}</p>
              </div>
              <div className="surface-card-muted rounded-[1.25rem] p-4">
                <p className="text-sm text-slate-500">Pricing</p>
                <p className="mt-2 font-medium text-slate-900">{ad.price ? formatCurrency(Number(ad.price)) : 'Contact for price'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Description</p>
              <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">{ad.description}</p>
            </div>

            {media && media.length > 1 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {media.slice(1).map((item: any) => (
                  <Image
                    key={item.id}
                    src={item.normalized_thumbnail_url || item.original_url || getPlaceholderImage()}
                    alt={ad.title}
                    width={640}
                    height={320}
                    className="h-40 w-full rounded-[1.25rem] object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <CardContent className="p-6">
                <p className="section-kicker-light">Contact Seller</p>
                <div className="mt-5 space-y-4">
                  {ad.contact_email ? (
                    <a href={`mailto:${ad.contact_email}`} className="surface-card-muted flex items-center gap-3 rounded-[1.25rem] p-4 text-slate-900">
                      <Mail className="h-4 w-4 text-orange-500" />
                      {ad.contact_email}
                    </a>
                  ) : null}
                  {ad.contact_phone ? (
                    <a href={`tel:${ad.contact_phone}`} className="surface-card-muted flex items-center gap-3 rounded-[1.25rem] p-4 text-slate-900">
                      <Phone className="h-4 w-4 text-orange-500" />
                      {ad.contact_phone}
                    </a>
                  ) : null}
                  {ad.website_url ? (
                    <a href={ad.website_url} target="_blank" rel="noreferrer" className="surface-card-muted flex items-center gap-3 rounded-[1.25rem] p-4 text-slate-900">
                      <Globe className="h-4 w-4 text-orange-500" />
                      Visit website
                    </a>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <CardContent className="p-6">
                <p className="section-kicker-light">Listing Trust</p>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  <p>Only published and non-expired ads appear in the marketplace.</p>
                  <p>Content has already passed moderation and payment verification.</p>
                  <p>Package weighting and seller trust affect ranking order.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
