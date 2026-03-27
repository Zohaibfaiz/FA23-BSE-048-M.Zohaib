'use client';
// components/ads/AbuseReportModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { adId: string; onClose: () => void; }

const REASONS = [
  'Fake or misleading ad',
  'Inappropriate content',
  'Spam or duplicate listing',
  'Prohibited items',
  'Fraudulent seller',
  'Other',
];

export default function AbuseReportModal({ adId, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return toast.error('Please select a reason');
    setLoading(true);
    try {
      const res = await fetch('/api/ads/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: adId, reason, details }),
      });
      if (res.ok) {
        toast.success('Report submitted. Our team will review it shortly.');
        onClose();
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/10"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-red-400" />
              <h3 className="font-display font-bold text-white">Report Ad</h3>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-2">Reason *</label>
              <div className="space-y-2">
                {REASONS.map(r => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio" name="reason" value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-red-500"
                    />
                    <span className="text-sm text-white/70">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2">Additional details (optional)</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
                className="input-field resize-none text-sm"
                placeholder="Describe the issue..."
                maxLength={500}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={15} /> {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
