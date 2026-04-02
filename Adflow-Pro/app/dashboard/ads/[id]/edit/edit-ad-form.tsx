'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

type Category = { id: string; name: string };
type City = { id: string; name: string };
type Package = { id: string; name: string; price: number; duration_days: number; description?: string };

type EditAdFormProps = {
  adId: string;
  initialAd: any;
  initialMediaUrls: string[];
  categories: Category[];
  cities: City[];
  packages: Package[];
};

export default function EditAdForm({
  adId,
  initialAd,
  initialMediaUrls,
  categories,
  cities,
  packages,
}: EditAdFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState(
    initialMediaUrls.length > 0 ? initialMediaUrls.slice(0, 10) : ['']
  );
  const [formData, setFormData] = useState({
    title: initialAd.title || '',
    description: initialAd.description || '',
    category_id: initialAd.category_id || '',
    city_id: initialAd.city_id || '',
    package_id: initialAd.package_id || '',
    contact_email: initialAd.contact_email || '',
    contact_phone: initialAd.contact_phone || '',
    website_url: initialAd.website_url || '',
    price: initialAd.price != null ? String(initialAd.price) : '',
  });

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === formData.package_id),
    [packages, formData.package_id]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/client/ads/${adId}`, {
        method: 'PATCH',
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
        throw new Error(payload.error || 'Failed to save changes');
      }

      toast.success('Draft updated successfully');
      router.push(`/dashboard/ads/${adId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button onClick={() => router.push(`/dashboard/ads/${adId}`)} className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to ad
        </button>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="surface-dark hero-outline rounded-[2.25rem] p-8 text-white">
            <p className="section-kicker">Draft Editor</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Refine the campaign before it enters moderation.</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              You can update copy, category, pricing, and media while this listing is still in draft.
            </p>
          </div>

          <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker-light">Edit Draft</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">{initialAd.title}</h2>
                </div>
                <Sparkles className="h-6 w-6 text-orange-500" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Ad title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} minLength={10} maxLength={150} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={6} minLength={50} maxLength={5000} required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <select id="category_id" value={formData.category_id} onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))} className="flex h-11 w-full rounded-[1.1rem] px-4 text-sm" required>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city_id">City</Label>
                    <select id="city_id" value={formData.city_id} onChange={(e) => setFormData((prev) => ({ ...prev, city_id: e.target.value }))} className="flex h-11 w-full rounded-[1.1rem] px-4 text-sm" required>
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package_id">Package</Label>
                  <select id="package_id" value={formData.package_id} onChange={(e) => setFormData((prev) => ({ ...prev, package_id: e.target.value }))} className="flex h-11 w-full rounded-[1.1rem] px-4 text-sm" required>
                    <option value="">Select package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - Rs {Number(pkg.price).toLocaleString('en-PK')} ({pkg.duration_days} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact email</Label>
                    <Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact phone</Label>
                    <Input id="contact_phone" value={formData.contact_phone} onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input id="website_url" type="url" value={formData.website_url} onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))} placeholder="https://example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Displayed price</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Media URLs</Label>
                    <p className="mt-1 text-xs text-slate-500">Keep the strongest media first. Only https image URLs or YouTube links should be used.</p>
                  </div>
                  <div className="space-y-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={url} onChange={(e) => setMediaUrls((current) => current.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} required={index === 0} />
                        {mediaUrls.length > 1 ? (
                          <Button type="button" variant="outline" size="icon" className="rounded-xl" onClick={() => setMediaUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
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
                    Pending payment amount will track the selected <span className="font-semibold">{selectedPackage.name}</span> package.
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1 rounded-full py-6 text-base">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 rounded-full py-6" onClick={() => router.push(`/dashboard/ads/${adId}`)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
