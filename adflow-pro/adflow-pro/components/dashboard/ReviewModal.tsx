'use client';
// components/dashboard/ReviewModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Eye, FileText, User, MapPin, Tag, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Ad } from '@/types';

interface Props {
  ad: Ad;
  onClose: () => void;
  onReviewed: (adId: string) => void;
}

export default function ReviewModal({ ad, onClose, onReviewed }: Props) {
  const supabase = createClient();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!action) return toast.error('Select approve or reject');
    if (!note.trim()) return toast.error('Please provide a review note');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const newStatus = action === 'approve' ? 'payment_pending' : 'archived';

      await supabase.from('ads').update({
        status: newStatus,
        moderation_note: note,
        rejection_reason: action === 'reject' ? note : null,
      }).eq('id', ad.id);

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: user?.id,
        action: `ad.${action}d`,
        entity_type: 'ad',
        entity_id: ad.id,
        old_data: { status: ad.status },
        new_data: { status: newStatus, note },
      });

      // Notify the client
      await supabase.from('notifications').insert({
        user_id: ad.user_id,
        title: action === 'approve' ? '✅ Ad Approved!' : '❌ Ad Rejected',
        message: action === 'approve'
          ? `Your ad "${ad.title}" has been approved. Please submit payment to proceed.`
          : `Your ad "${ad.title}" was rejected. Reason: ${note}`,
        type: action === 'approve' ? 'success' : 'error',
        link: '/client',
      });

      toast.success(`Ad ${action}d successfully`);
      onReviewed(ad.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-strong rounded-2xl w-full max-w-2xl border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="font-display font-bold text-white">Review Ad</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          <div className="p-5 max-h-[70vh] overflow-y-auto">
            {/* Ad Info */}
            <div className="glass rounded-xl p-4 border border-white/8 mb-5 space-y-3">
              <div>
                <p className="text-xs text-white/40 mb-0.5 flex items-center gap-1"><FileText size={11} /> Title</p>
                <p className="font-semibold text-white">{ad.title}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Description</p>
                <p className="text-sm text-white/70 leading-relaxed line-clamp-4">{ad.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-white/40 flex items-center gap-1"><Tag size={10} /> Category</p>
                  <p className="text-white/80">{(ad as unknown as { category?: { name?: string } }).category?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 flex items-center gap-1"><MapPin size={10} /> City</p>
                  <p className="text-white/80">{(ad as unknown as { city?: { name?: string } }).city?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 flex items-center gap-1"><Package size={10} /> Package</p>
                  <p className="text-white/80">{(ad as unknown as { package?: { name?: string } }).package?.name ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-white/40 flex items-center gap-1 mb-0.5"><User size={10} /> Seller</p>
                <p className="text-sm text-white/80">{(ad as unknown as { user?: { full_name?: string; email?: string } }).user?.full_name} · {(ad as unknown as { user?: { email?: string } }).user?.email}</p>
              </div>
              {/* Contact */}
              {(ad.contact_phone || ad.contact_whatsapp) && (
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Contact</p>
                  <p className="text-sm text-white/70">{ad.contact_phone} {ad.contact_whatsapp && `· WA: ${ad.contact_whatsapp}`}</p>
                </div>
              )}
            </div>

            {/* Media URLs */}
            {ad.ad_media && ad.ad_media.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-white/40 mb-2">Media URLs ({ad.ad_media.length})</p>
                <div className="space-y-2">
                  {ad.ad_media.map(m => (
                    <a key={m.id} href={m.original_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 break-all">
                      <Eye size={11} className="shrink-0" />
                      {m.original_url.slice(0, 70)}{m.original_url.length > 70 ? '...' : ''}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  action === 'approve'
                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                    : 'border-white/10 text-white/50 hover:border-green-500/30 hover:text-green-400'
                }`}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  action === 'reject'
                    ? 'bg-red-500/20 border-red-500/50 text-red-300'
                    : 'border-white/10 text-white/50 hover:border-red-500/30 hover:text-red-400'
                }`}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-xs text-white/50 mb-1.5">
                {action === 'reject' ? 'Rejection Reason *' : 'Moderation Note *'}
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="input-field resize-none text-sm"
                placeholder={action === 'reject' ? 'Explain why this ad is being rejected...' : 'Add a note for the record...'}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !action}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all ${
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : action === 'reject'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : action === 'reject' ? 'Rejection' : 'Action'}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
