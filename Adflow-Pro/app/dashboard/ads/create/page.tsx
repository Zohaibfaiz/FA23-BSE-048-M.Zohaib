'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

type Option = { id: string; name: string; slug?: string; price?: number; duration_days?: number; description?: string };

export default function CreateAdPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [packages, setPackages] = useState<Option[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    city_id: '',
    package_id: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    price: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const [categoriesRes, citiesRes, packagesRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('name'),
        supabase.from('cities').select('*').eq('is_active', true).order('name'),
        supabase.from('packages').select('*').eq('is_active', true).order('price'),
      ]);

      setCategories((categoriesRes.data ?? []) as Option[]);
      setCities((citiesRes.data ?? []) as Option[]);
      setPackages((packagesRes.data ?? []) as Option[]);
    };

    loadData();
  }, [supabase]);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === formData.package_id),
    [packages, formData.package_id]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/client/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number(formData.price) : undefined,
          website_url: formData.website_url || undefined,
          contact_phone: formData.contact_phone || undefined,
          media_urls: mediaUrls.map((url) => url.trim()).filter(Boolean),
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to create ad');
      }

      toast.success('Draft campaign created');
      router.push(`/dashboard/ads/${payload.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_26%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_40%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Campaign Builder</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Create a listing that is ready for moderation, payment, and launch.</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              Build the ad once, then move it through the marketplace workflow. Your draft will stay private until you explicitly submit it.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Step 1', 'Save draft'],
                ['Step 2', 'Submit for review'],
                ['Step 3', 'Verify payment and publish'],
              ].map(([step, title]) => (
                <div key={step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{step}</p>
                  <p className="mt-2 text-lg font-medium">{title}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">New Ad</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Draft setup</h2>
                </div>
                <Sparkles className="h-6 w-6 text-orange-500" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Ad title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} minLength={10} maxLength={150} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={6} minLength={50} maxLength={5000} required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <select id="category_id" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" required>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city_id">City</Label>
                    <select id="city_id" value={formData.city_id} onChange={(e) => setFormData({ ...formData, city_id: e.target.value })} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" required>
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="package_id">Package</Label>
                  <div className="grid gap-3">
                    {packages.map((pkg) => (
                      <label key={pkg.id} className={`flex cursor-pointer items-start justify-between rounded-[1.25rem] border p-4 transition ${formData.package_id === pkg.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50/80'}`}>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className={`mt-1 text-sm ${formData.package_id === pkg.id ? 'text-slate-300' : 'text-slate-600'}`}>
                            {pkg.duration_days} days • {pkg.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Rs {Number(pkg.price ?? 0).toLocaleString('en-PK')}</div>
                          <input type="radio" name="package_id" value={pkg.id} checked={formData.package_id === pkg.id} onChange={(e) => setFormData({ ...formData, package_id: e.target.value })} className="sr-only" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact email</Label>
                    <Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact phone</Label>
                    <Input id="contact_phone" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input id="website_url" type="url" placeholder="https://example.com" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Displayed price</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Media URLs</Label>
                    <p className="mt-1 text-xs text-slate-500">Use https JPG/PNG image URLs or YouTube links only.</p>
                  </div>
                  <div className="space-y-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={url} onChange={(e) => setMediaUrls((current) => current.map((item, currentIndex) => currentIndex === index ? e.target.value : item))} placeholder="https://..." required={index === 0} />
                        {mediaUrls.length > 1 ? (
                          <Button type="button" variant="outline" size="icon" className="rounded-xl" onClick={() => setMediaUrls((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                            <X className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {mediaUrls.length < 10 ? (
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setMediaUrls((current) => [...current, ''])}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add media URL
                    </Button>
                  ) : null}
                </div>

                {selectedPackage ? (
                  <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Pending payment record will be created automatically for the <span className="font-semibold">{selectedPackage.name}</span> package.
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1 rounded-full bg-slate-950 py-6 text-base hover:bg-slate-800">
                    {loading ? 'Creating draft...' : 'Create Draft'}
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button type="button" variant="outline" className="w-full rounded-full py-6">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
