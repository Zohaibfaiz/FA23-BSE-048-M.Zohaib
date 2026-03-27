'use client';
// components/forms/SubmitPaymentForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitPaymentSchema, type SubmitPaymentInput } from '@/lib/validations/schemas';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { CreditCard, Upload, Link as LinkIcon, Info } from 'lucide-react';
import type { Ad } from '@/types';

interface Props {
  ads: Ad[];
  preselectedAdId?: string;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  'Bank Transfer (HBL)',
  'Bank Transfer (Meezan)',
  'JazzCash',
  'EasyPaisa',
  'Other',
];

export default function SubmitPaymentForm({ ads, preselectedAdId, onSuccess }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SubmitPaymentInput>({
    resolver: zodResolver(submitPaymentSchema),
    defaultValues: { ad_id: preselectedAdId ?? '', payment_method: 'JazzCash' },
  });

  const selectedAd = ads.find(a => a.id === watch('ad_id'));

  async function onSubmit(data: SubmitPaymentInput) {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check for duplicate transaction ref
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('transaction_ref', data.transaction_ref)
        .single();

      if (existing) throw new Error('This transaction reference already exists. Please check again.');

      // Insert payment
      const { error } = await supabase.from('payments').insert({
        ad_id: data.ad_id,
        user_id: user.id,
        package_id: selectedAd?.package_id,
        amount: data.amount,
        transaction_ref: data.transaction_ref,
        payment_method: data.payment_method,
        proof_url: data.proof_url,
        notes: data.notes,
        status: 'pending',
      });

      if (error) throw error;

      // Update ad status to payment_submitted
      await supabase.from('ads').update({ status: 'payment_submitted' }).eq('id', data.ad_id);

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'payment.submitted',
        entity_type: 'payment',
        new_data: { ad_id: data.ad_id, amount: data.amount, method: data.payment_method },
      });

      toast.success('Payment proof submitted! Admin will verify within 24 hours.');
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  }

  if (ads.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center border border-white/8 max-w-xl">
        <CreditCard size={32} className="mx-auto mb-3 text-white/20" />
        <h3 className="font-display font-bold text-white mb-2">No Pending Payments</h3>
        <p className="text-white/40 text-sm">All your ads are up to date. Create a new ad to get started.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      {/* Instructions banner */}
      <div className="glass rounded-xl p-4 border border-blue-500/20 flex gap-3">
        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-white/60">
          <p className="font-semibold text-white mb-1">Payment Instructions</p>
          <p>Transfer the package amount to our account, then upload a screenshot/image of your payment proof as an external URL (e.g., upload to Google Drive, ImgBB, etc.) and paste the link below.</p>
        </div>
      </div>

      {/* Select Ad */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5">Select Ad *</label>
        <select {...register('ad_id')} className="input-field">
          <option value="">Choose an ad...</option>
          {ads.map(ad => <option key={ad.id} value={ad.id} className="bg-[#111827]">{ad.title}</option>)}
        </select>
        {errors.ad_id && <p className="text-red-400 text-xs mt-1">{errors.ad_id.message}</p>}
      </div>

      {selectedAd?.package && (
        <div className="glass rounded-xl p-3 border border-white/8 text-sm">
          <span className="text-white/40">Amount to pay: </span>
          <span className="font-bold text-violet-400">PKR {(selectedAd.package as { price?: number })?.price?.toLocaleString()}</span>
        </div>
      )}

      <div>
        <label className="block text-xs text-white/50 mb-1.5">Amount Paid (PKR) *</label>
        <input type="number" {...register('amount', { valueAsNumber: true })} className="input-field" placeholder="e.g. 2499" />
        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5">Payment Method *</label>
        <select {...register('payment_method')} className="input-field">
          {PAYMENT_METHODS.map(m => <option key={m} value={m} className="bg-[#111827]">{m}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5">Transaction Reference *</label>
        <input {...register('transaction_ref')} className="input-field" placeholder="e.g. TXN123456789" />
        {errors.transaction_ref && <p className="text-red-400 text-xs mt-1">{errors.transaction_ref.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5 flex items-center gap-1">
          <LinkIcon size={11} /> Payment Proof URL *
        </label>
        <input {...register('proof_url')} className="input-field" placeholder="https://drive.google.com/file/... or imgbb.com/..." />
        <p className="text-xs text-white/30 mt-1">Upload screenshot to ImgBB, Google Drive, or any image host and paste the URL</p>
        {errors.proof_url && <p className="text-red-400 text-xs mt-1">{errors.proof_url.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5">Additional Notes (optional)</label>
        <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="Any additional info..." />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
        <CreditCard size={16} />
        {loading ? 'Submitting...' : 'Submit Payment Proof'}
      </button>
    </form>
  );
}
