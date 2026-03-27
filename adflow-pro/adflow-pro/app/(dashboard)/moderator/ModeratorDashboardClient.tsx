'use client';
// app/(dashboard)/moderator/ModeratorDashboardClient.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ClipboardList, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moderatorReviewSchema, type ModeratorReviewInput } from '@/lib/validations/schemas';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { formatDistanceToNow } from 'date-fns';
import type { Ad, User as UserType } from '@/types';

type Tab = 'overview' | 'review-queue' | 'reviewed';

function ReviewModal({ ad, onClose }: { ad: Ad; onClose: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ModeratorReviewInput>({
    resolver: zodResolver(moderatorReviewSchema),
    defaultValues: { ad_id: ad.id, action: 'approve', note: '' },
  });

  async function onSubmit(data: ModeratorReviewInput) {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newStatus = data.action === 'approve' ? 'payment_pending' : 'archived';

      await supabase.from('ads').update({
        status: newStatus,
        moderation_note: data.note,
        rejection_reason: data.action === 'reject' ? data.note : null,
      }).eq('id', ad.id);

      await supabase.from('notifications').insert({
        user_id: ad.user_id,
        title: data.action === 'approve' ? '✅ Ad Approved!' : '❌ Ad Rejected',
        message: data.action === 'approve'
          ? `Your ad "${ad.title}" has been approved. Please submit payment to activate.`
          : `Your ad "${ad.title}" was rejected. Reason: ${data.note}`,
        type: data.action === 'approve' ? 'success' : 'error',
        link: '/client',
      });

      await supabase.from('audit_logs').insert({
        actor_id: user?.id,
        action: `ad.${data.action}d`,
        entity_type: 'ad',
        entity_id: ad.id,
        new_data: { status: newStatus, note: data.note },
      });

      toast.success(`Ad ${data.action === 'approve' ? 'approved ✅' : 'rejected ❌'}`);
      onClose();
      router.refresh();
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="glass-strong rounded-2xl p-6 w-full max-w-lg border border-white/10"
      >
        <h3 className="font-display font-bold text-xl text-white mb-1">Review Ad</h3>
        <p className="text-white/40 text-sm mb-5 line-clamp-1">{ad.title}</p>

        <div className="glass rounded-xl p-4 mb-5 space-y-2 text-sm border border-white/8">
          {[
            ['Seller',   (ad.user as {full_name?:string})?.full_name ?? '—'],
            ['Category', (ad.category as {name?:string})?.name ?? '—'],
            ['City',     (ad.city as {name?:string})?.name ?? '—'],
            ['Package',  (ad.package as {name?:string})?.name ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-white/40">{k}</span>
              <span className="text-white">{v}</span>
            </div>
          ))}
          <p className="text-white/50 pt-2 border-t border-white/8 line-clamp-3 text-xs">{ad.description}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['approve', 'reject'] as const).map(action => (
              <label key={action} className="cursor-pointer">
                <input type="radio" {...register('action')} value={action} className="sr-only" />
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  watch('action') === action
                    ? action === 'approve'
                      ? 'border-green-500 bg-green-500/15 text-green-400'
                      : 'border-red-500 bg-red-500/15 text-red-400'
                    : 'border-white/10 text-white/40 hover:border-white/20'
                }`}>
                  {action === 'approve' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </div>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Review Note *</label>
            <textarea {...register('note')} rows={3} className="input-field resize-none text-sm"
              placeholder={watch('action') === 'approve' ? 'Looks good, approved.' : 'Reason for rejection...'} />
            {errors.note && <p className="text-red-400 text-xs mt-1">{errors.note.message}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
              {loading ? 'Saving...' : `${watch('action') === 'approve' ? '✅ Approve' : '❌ Reject'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface Props {
  moderator: UserType | null; reviewQueue: Ad[];
  underReview: Ad[]; approvedToday: number; rejectedToday: number;
}

export default function ModeratorDashboardClient({ moderator, reviewQueue, underReview, approvedToday, rejectedToday }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  return (
    <div className="min-h-screen bg-[#080B14] flex">
      <DashboardSidebar role="moderator" user={moderator} activeTab={activeTab} onTabChange={t => setActiveTab(t as Tab)} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Moderator Dashboard</h1>
            <p className="text-white/40 text-sm mt-0.5">Review and moderate submitted listings</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Pending',        value: reviewQueue.length, color: '#F59E0B', Icon: ClipboardList },
                    { label: 'Under Review',   value: underReview.length, color: '#3B82F6', Icon: Clock },
                    { label: 'Approved Today', value: approvedToday,      color: '#10B981', Icon: CheckCircle2 },
                    { label: 'Rejected Today', value: rejectedToday,      color: '#EF4444', Icon: XCircle },
                  ].map(({ label, value, color, Icon }) => (
                    <div key={label} className="glass rounded-xl p-4 border border-white/8">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <span className="text-2xl font-display font-bold text-white">{value}</span>
                      </div>
                      <p className="text-xs text-white/40">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="glass rounded-xl border border-white/8">
                  <div className="flex items-center justify-between p-5 border-b border-white/8">
                    <h3 className="font-display font-bold text-white">Pending Review</h3>
                    <button onClick={() => setActiveTab('review-queue')} className="text-sm text-violet-400">View all →</button>
                  </div>
                  {reviewQueue.slice(0, 5).map(ad => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-white">{ad.title}</p>
                        <p className="text-xs text-white/40">{(ad.category as {name?:string})?.name} · {(ad.user as {full_name?:string})?.full_name}</p>
                      </div>
                      <button onClick={() => setSelectedAd(ad)} className="text-xs text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Eye size={12} /> Review
                      </button>
                    </div>
                  ))}
                  {reviewQueue.length === 0 && <p className="p-6 text-center text-white/30 text-sm">🎉 All caught up!</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'review-queue' && (
              <motion.div key="rq" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {reviewQueue.map(ad => (
                  <div key={ad.id} className="glass rounded-xl p-5 border border-amber-500/15 flex gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-white">{ad.title}</p>
                      <p className="text-xs text-white/40 mt-1">{(ad.category as {name?:string})?.name} · {(ad.city as {name?:string})?.name} · {(ad.package as {name?:string})?.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })} by{' '}
                        <span className="text-white/50">{(ad.user as {full_name?:string})?.full_name}</span>
                      </p>
                      <p className="text-sm text-white/50 mt-2 line-clamp-2">{ad.description}</p>
                    </div>
                    <button onClick={() => setSelectedAd(ad)} className="btn-primary text-sm px-4 py-2 whitespace-nowrap flex items-center gap-1.5">
                      <Eye size={14} /> Review
                    </button>
                  </div>
                ))}
                {reviewQueue.length === 0 && (
                  <div className="glass rounded-xl p-12 text-center border border-white/8">
                    <CheckCircle2 size={32} className="mx-auto mb-3 text-green-400/40" />
                    <p className="text-white/40">No pending reviews!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviewed' && (
              <motion.div key="rv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {underReview.map(ad => (
                  <div key={ad.id} className="glass rounded-xl p-4 border border-white/8 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">{ad.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{(ad.category as {name?:string})?.name}</p>
                    </div>
                    <span className="badge-review text-xs px-3 py-1 rounded-full">Under Review</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedAd && <ReviewModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
      </AnimatePresence>
    </div>
  );
}
