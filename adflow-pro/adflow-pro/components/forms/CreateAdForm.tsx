'use client';
// components/forms/CreateAdForm.tsx
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAdSchema, type CreateAdInput } from '@/lib/validations/schemas';
import { normalizeMediaUrl } from '@/lib/utils/media';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Trash2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import type { Package, Category, City } from '@/types';

interface Props {
  packages: Package[]; categories: Category[]; cities: City[];
  onSuccess: () => void;
}

export default function CreateAdForm({ packages, categories, cities, onSuccess }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 3-step form

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CreateAdInput>({
    resolver: zodResolver(createAdSchema),
    defaultValues: { media_urls: [''] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'media_urls' as never });

  async function onSubmit(data: CreateAdInput) {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique slug
      const rawSlug = slugify(data.title, { lower: true, strict: true });
      const slug = `${rawSlug}-${nanoid(6)}`;

      // Insert ad
      const { data: ad, error: adError } = await supabase.from('ads').insert({
        slug,
        title: data.title,
        description: data.description,
        price: data.price,
        price_label: data.price_label,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        contact_whatsapp: data.contact_whatsapp,
        city_id: data.city_id,
        category_id: data.category_id,
        package_id: data.package_id,
        user_id: user.id,
        status: 'submitted',
      }).select().single();

      if (adError) throw adError;

      // Insert media URLs
      const mediaInserts = data.media_urls
        .filter(url => url.trim())
        .map((url, i) => {
          const normalized = normalizeMediaUrl(url);
          return {
            ad_id: ad.id,
            ...normalized,
            is_primary: i === 0,
            sort_order: i,
          };
        });

      if (mediaInserts.length > 0) {
        await supabase.from('ad_media').insert(mediaInserts);
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'ad.created',
        entity_type: 'ad',
        entity_id: ad.id,
        new_data: { title: data.title, status: 'submitted' },
      });

      toast.success('Ad submitted for review! Payment instructions will follow.');
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  }

  const selectedPackage = packages.find(p => p.id === watch('package_id'));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/40'}`}>
              {step > s ? <CheckCircle2 size={14} /> : s}
            </div>
            <span className={`text-xs ${step >= s ? 'text-white/70' : 'text-white/30'}`}>
              {s === 1 ? 'Details' : s === 2 ? 'Media' : 'Package'}
            </span>
            {s < 3 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      {/* STEP 1 — Ad Details */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs text-white/50 mb-1.5">Ad Title *</label>
              <input {...register('title')} className="input-field" placeholder="e.g. Honda Civic 2021 - Excellent Condition" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-white/50 mb-1.5">Description *</label>
              <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Describe your ad in detail..." />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Price Label</label>
              <input {...register('price_label')} className="input-field" placeholder="PKR 42 Lakh / PKR 5,000/mo" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Category *</label>
              <select {...register('category_id')} className="input-field">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111827]">{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">City *</label>
              <select {...register('city_id')} className="input-field">
                <option value="">Select city</option>
                {cities.map(c => <option key={c.id} value={c.id} className="bg-[#111827]">{c.name}</option>)}
              </select>
              {errors.city_id && <p className="text-red-400 text-xs mt-1">{errors.city_id.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Phone</label>
              <input {...register('contact_phone')} className="input-field" placeholder="03XX-XXXXXXX" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">WhatsApp</label>
              <input {...register('contact_whatsapp')} className="input-field" placeholder="92XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Email</label>
              <input {...register('contact_email')} className="input-field" placeholder="seller@email.com" />
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)} className="btn-primary">Next: Add Media →</button>
        </motion.div>
      )}

      {/* STEP 2 — Media URLs */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="glass rounded-xl p-4 border border-white/8 mb-4">
            <p className="text-xs text-white/50 flex items-center gap-1.5">
              <LinkIcon size={12} />
              Supported: Direct image URLs, YouTube links, GitHub raw URLs. No file uploads needed.
            </p>
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-white/50 mb-1.5">
                  {i === 0 ? 'Primary Image URL *' : `Image URL ${i + 1}`}
                </label>
                <input
                  {...register(`media_urls.${i}` as const)}
                  className="input-field"
                  placeholder="https://example.com/image.jpg or YouTube URL"
                />
              </div>
              {i > 0 && (
                <button type="button" onClick={() => remove(i)} className="mt-6 text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {fields.length < 5 && (
            <button type="button" onClick={() => append('')} className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300">
              <Plus size={15} /> Add another media URL
            </button>
          )}
          {errors.media_urls && <p className="text-red-400 text-xs">{errors.media_urls.message ?? (errors.media_urls as unknown as { root?: { message?: string } })?.root?.message}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost">← Back</button>
            <button type="button" onClick={() => setStep(3)} className="btn-primary">Next: Select Package →</button>
          </div>
        </motion.div>
      )}

      {/* STEP 3 — Package */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <label key={pkg.id} className="cursor-pointer">
                <input type="radio" {...register('package_id')} value={pkg.id} className="sr-only" />
                <div className={`p-4 rounded-xl border-2 transition-all ${watch('package_id') === pkg.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <p className="font-display font-bold text-white">{pkg.name}</p>
                  <p className="text-violet-400 font-bold mt-1">PKR {pkg.price.toLocaleString()}</p>
                  <p className="text-xs text-white/40 mt-1">{pkg.duration_days} days</p>
                </div>
              </label>
            ))}
          </div>
          {errors.package_id && <p className="text-red-400 text-xs">{errors.package_id.message}</p>}

          {selectedPackage && (
            <div className="glass rounded-xl p-4 border border-violet-500/20 text-sm text-white/60">
              <p>💳 After submission, you'll need to pay <strong className="text-white">PKR {selectedPackage.price.toLocaleString()}</strong> to activate your listing.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost">← Back</button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Submitting...' : '🚀 Submit Ad'}
            </button>
          </div>
        </motion.div>
      )}
    </form>
  );
}
