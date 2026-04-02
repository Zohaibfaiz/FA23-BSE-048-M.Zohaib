'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PackageRow = {
  id: string;
  name: string;
  tier: 'basic' | 'standard' | 'premium';
  duration_days: number;
  price: number;
  homepage_visibility: boolean;
  featured_weight: number;
  refresh_rule: 'none' | 'manual' | 'auto_3_days';
  description?: string | null;
  is_active: boolean;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type CityRow = {
  id: string;
  name: string;
  slug: string;
  state?: string | null;
  country: string;
  is_active: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

export function SuperAdminControlPanel(props: {
  packages: PackageRow[];
  categories: CategoryRow[];
  cities: CityRow[];
}) {
  const router = useRouter();
  const [creatingPackage, setCreatingPackage] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingCity, setCreatingCity] = useState(false);

  const [packageForm, setPackageForm] = useState({
    name: '',
    tier: 'basic',
    duration_days: '7',
    price: '2999',
    homepage_visibility: false,
    featured_weight: '1',
    refresh_rule: 'none',
    description: '',
    is_active: true,
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', is_active: true });
  const [cityForm, setCityForm] = useState({ name: '', slug: '', state: '', country: 'US', is_active: true });

  async function submitJson(url: string, method: 'POST' | 'PATCH', body: Record<string, unknown>) {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Request failed');
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Package Controls</p>
        <div className="mt-5 space-y-3">
          {props.packages.map((pkg) => (
            <div key={pkg.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{pkg.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{pkg.tier}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={async () => {
                    try {
                      await submitJson(`/api/super-admin/packages/${pkg.id}`, 'PATCH', { is_active: !pkg.is_active });
                      toast.success('Package updated');
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : 'Update failed');
                    }
                  }}
                >
                  {pkg.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
              <p className="mt-3 text-sm text-slate-600">{pkg.duration_days} days • Rs {Number(pkg.price).toLocaleString('en-PK')}</p>
            </div>
          ))}
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setCreatingPackage(true);
            try {
              await submitJson('/api/super-admin/packages', 'POST', {
                ...packageForm,
                duration_days: Number(packageForm.duration_days),
                price: Number(packageForm.price),
                featured_weight: Number(packageForm.featured_weight),
              });
              toast.success('Package created');
              setPackageForm({
                name: '',
                tier: 'basic',
                duration_days: '7',
                price: '2999',
                homepage_visibility: false,
                featured_weight: '1',
                refresh_rule: 'none',
                description: '',
                is_active: true,
              });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Create failed');
            } finally {
              setCreatingPackage(false);
            }
          }}
        >
          <Label htmlFor="pkg-name">Create package</Label>
          <Input id="pkg-name" value={packageForm.name} onChange={(e) => setPackageForm((current) => ({ ...current, name: e.target.value }))} placeholder="Package name" required />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={packageForm.tier} onChange={(e) => setPackageForm((current) => ({ ...current, tier: e.target.value }))}>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <Input type="number" value={packageForm.price} onChange={(e) => setPackageForm((current) => ({ ...current, price: e.target.value }))} placeholder="Price" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" value={packageForm.duration_days} onChange={(e) => setPackageForm((current) => ({ ...current, duration_days: e.target.value }))} placeholder="Duration days" required />
            <Input type="number" value={packageForm.featured_weight} onChange={(e) => setPackageForm((current) => ({ ...current, featured_weight: e.target.value }))} placeholder="Weight" required />
          </div>
          <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={packageForm.refresh_rule} onChange={(e) => setPackageForm((current) => ({ ...current, refresh_rule: e.target.value }))}>
            <option value="none">No refresh</option>
            <option value="manual">Manual refresh</option>
            <option value="auto_3_days">Auto every 3 days</option>
          </select>
          <Input value={packageForm.description} onChange={(e) => setPackageForm((current) => ({ ...current, description: e.target.value }))} placeholder="Short description" />
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={packageForm.homepage_visibility} onChange={(e) => setPackageForm((current) => ({ ...current, homepage_visibility: e.target.checked }))} />
            Homepage visibility
          </label>
          <Button type="submit" disabled={creatingPackage} className="w-full rounded-full">
            {creatingPackage ? 'Creating...' : 'Create Package'}
          </Button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Category Controls</p>
        <div className="mt-5 space-y-3">
          {props.categories.map((category) => (
            <div key={category.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{category.slug}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={async () => {
                    try {
                      await submitJson(`/api/super-admin/categories/${category.id}`, 'PATCH', { is_active: !category.is_active });
                      toast.success('Category updated');
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : 'Update failed');
                    }
                  }}
                >
                  {category.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setCreatingCategory(true);
            try {
              await submitJson('/api/super-admin/categories', 'POST', categoryForm);
              toast.success('Category created');
              setCategoryForm({ name: '', slug: '', is_active: true });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Create failed');
            } finally {
              setCreatingCategory(false);
            }
          }}
        >
          <Label htmlFor="category-name">Create category</Label>
          <Input id="category-name" value={categoryForm.name} onChange={(e) => setCategoryForm((current) => ({ ...current, name: e.target.value, slug: current.slug || slugify(e.target.value) }))} placeholder="Category name" required />
          <Input value={categoryForm.slug} onChange={(e) => setCategoryForm((current) => ({ ...current, slug: slugify(e.target.value) }))} placeholder="category-slug" required />
          <Button type="submit" disabled={creatingCategory} className="w-full rounded-full">
            {creatingCategory ? 'Creating...' : 'Create Category'}
          </Button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">City Controls</p>
        <div className="mt-5 space-y-3">
          {props.cities.map((city) => (
            <div key={city.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{city.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{city.slug} • {city.state || city.country}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={async () => {
                    try {
                      await submitJson(`/api/super-admin/cities/${city.id}`, 'PATCH', { is_active: !city.is_active });
                      toast.success('City updated');
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : 'Update failed');
                    }
                  }}
                >
                  {city.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setCreatingCity(true);
            try {
              await submitJson('/api/super-admin/cities', 'POST', cityForm);
              toast.success('City created');
              setCityForm({ name: '', slug: '', state: '', country: 'US', is_active: true });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Create failed');
            } finally {
              setCreatingCity(false);
            }
          }}
        >
          <Label htmlFor="city-name">Create city</Label>
          <Input id="city-name" value={cityForm.name} onChange={(e) => setCityForm((current) => ({ ...current, name: e.target.value, slug: current.slug || slugify(e.target.value) }))} placeholder="City name" required />
          <Input value={cityForm.slug} onChange={(e) => setCityForm((current) => ({ ...current, slug: slugify(e.target.value) }))} placeholder="city-slug" required />
          <div className="grid grid-cols-2 gap-3">
            <Input value={cityForm.state} onChange={(e) => setCityForm((current) => ({ ...current, state: e.target.value }))} placeholder="State" />
            <Input value={cityForm.country} onChange={(e) => setCityForm((current) => ({ ...current, country: e.target.value.toUpperCase() }))} placeholder="Country" required />
          </div>
          <Button type="submit" disabled={creatingCity} className="w-full rounded-full">
            {creatingCity ? 'Creating...' : 'Create City'}
          </Button>
        </form>
      </section>
    </div>
  );
}
