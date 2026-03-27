'use client';
// app/(dashboard)/admin/AdminDashboardClient.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Send, Star, Clock, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { formatDistanceToNow, addDays } from 'date-fns';
import type { User as UserType, AnalyticsOverview } from '@/types';

type Tab = 'overview' | 'payment-queue' | 'publish-queue' | 'analytics' | 'manage-ads';
const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

interface Props {
  admin: UserType | null;
  paymentQueue: Record<string, unknown>[];
  publishQueue: Record<string, unknown>[];
  analytics: AnalyticsOverview;
  categoryData: { name: string; count: number }[];
  revenueByPackage: { name: string; total: number }[];
}

function PublishItem({ ad, onPublish }: { ad: Record<string, unknown>; onPublish: (id: string, at?: string, featured?: boolean) => void }) {
  const [scheduleAt, setScheduleAt] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  return (
    <div className="glass rounded-xl p-5 border border-violet-500/15 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <p className="font-display font-bold text-white">{ad.title as string}</p>
        <p className="text-xs text-white/40 mt-1">
          {(ad.category as {name?:string})?.name} · {(ad.city as {name?:string})?.name} · {(ad.package as {name?:string})?.name}
        </p>
        <p className="text-xs text-white/30">{(ad.user as {full_name?:string})?.full_name} · {(ad.package as {duration_days?:number})?.duration_days}d</p>
      </div>
      <div className="flex flex-col gap-2 min-w-[200px]">
        <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} className="input-field text-xs py-1.5" />
        <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-amber-400" />
          <Star size={12} className="text-amber-400" /> Mark Featured
        </label>
        <div className="flex gap-2">
          <button onClick={() => onPublish(ad.id as string, undefined, isFeatured)} className="flex-1 btn-primary text-xs py-2">🚀 Now</button>
          {scheduleAt && <button onClick={() => onPublish(ad.id as string, scheduleAt, isFeatured)} className="flex-1 btn-ghost text-xs py-2">📅 Schedule</button>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardClient({ admin, paymentQueue, publishQueue, analytics, categoryData, revenueByPackage }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const supabase = createClient();
  const router = useRouter();

  async function verifyPayment(paymentId: string, adId: string, action: 'verify' | 'reject') {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('payments').update({ status: action === 'verify' ? 'verified' : 'rejected', verified_by: user?.id, verified_at: new Date().toISOString() }).eq('id', paymentId);
    await supabase.from('ads').update({ status: action === 'verify' ? 'payment_verified' : 'submitted' }).eq('id', adId);
    await supabase.from('audit_logs').insert({ actor_id: user?.id, action: `payment.${action}d`, entity_type: 'payment', entity_id: paymentId });
    toast.success(`Payment ${action === 'verify' ? 'verified ✅' : 'rejected ❌'}`);
    router.refresh();
  }

  async function publishAd(adId: string, scheduledAt?: string, featured?: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: ad } = await supabase.from('ads').select('package:packages(duration_days)').eq('id', adId).single();
    const days = (ad?.package as {duration_days?: number})?.duration_days ?? 7;
    const pub = scheduledAt ? new Date(scheduledAt) : new Date();
    const exp = addDays(pub, days);
    const st = scheduledAt && new Date(scheduledAt) > new Date() ? 'scheduled' : 'published';
    await supabase.from('ads').update({ status: st, publish_at: pub.toISOString(), expire_at: exp.toISOString(), published_at: st === 'published' ? pub.toISOString() : null, is_featured: featured ?? false }).eq('id', adId);
    await supabase.from('audit_logs').insert({ actor_id: user?.id, action: `ad.${st}`, entity_type: 'ad', entity_id: adId });
    toast.success(st === 'scheduled' ? '📅 Scheduled!' : '🚀 Published!');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080B14] flex">
      <DashboardSidebar role="admin" user={admin} activeTab={activeTab} onTabChange={t => setActiveTab(t as Tab)} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">Payments · Publish · Analytics</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    ['Total Ads', analytics.totalAds,   '#8B5CF6', FileText],
                    ['Active',    analytics.activeAds,  '#10B981', CheckCircle2],
                    ['Pending',   analytics.pendingAds, '#F59E0B', Clock],
                    ['Expired',   analytics.expiredAds, '#EF4444', XCircle],
                  ].map(([label, value, color, Icon]: unknown[]) => {
                    const I = Icon as React.ElementType;
                    return (
                      <div key={label as string} className="glass rounded-xl p-4 border border-white/8">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                            <I size={16} style={{ color }} />
                          </div>
                          <span className="text-2xl font-display font-bold text-white">{(value as number)}</span>
                        </div>
                        <p className="text-xs text-white/40">{label as string}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-5 border border-white/8">
                    <p className="text-xs text-white/40 mb-1">Total Revenue</p>
                    <p className="text-3xl font-display font-bold text-white">PKR {analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="glass rounded-xl p-5 border border-white/8">
                    <p className="text-xs text-white/40 mb-1">This Month</p>
                    <p className="text-3xl font-display font-bold text-cyan-400">PKR {analytics.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl border border-white/8">
                    <div className="flex items-center justify-between p-4 border-b border-white/8">
                      <h3 className="font-display font-bold text-sm text-white">Payment Queue ({paymentQueue.length})</h3>
                      <button onClick={() => setActiveTab('payment-queue')} className="text-xs text-violet-400">View all →</button>
                    </div>
                    {paymentQueue.slice(0, 3).map(p => (
                      <div key={p.id as string} className="p-3 flex items-center justify-between border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-xs font-semibold text-white line-clamp-1">{((p.ad as Record<string,unknown>)?.title as string)}</p>
                          <p className="text-[10px] text-white/40">PKR {(p.amount as number)?.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => verifyPayment(p.id as string, (p.ad as Record<string,unknown>)?.id as string, 'verify')} className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg">✅</button>
                          <button onClick={() => verifyPayment(p.id as string, (p.ad as Record<string,unknown>)?.id as string, 'reject')} className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg">❌</button>
                        </div>
                      </div>
                    ))}
                    {paymentQueue.length === 0 && <p className="p-4 text-center text-xs text-white/30">No pending payments</p>}
                  </div>
                  <div className="glass rounded-xl border border-white/8">
                    <div className="flex items-center justify-between p-4 border-b border-white/8">
                      <h3 className="font-display font-bold text-sm text-white">Publish Queue ({publishQueue.length})</h3>
                      <button onClick={() => setActiveTab('publish-queue')} className="text-xs text-cyan-400">View all →</button>
                    </div>
                    {publishQueue.slice(0, 3).map(ad => (
                      <div key={ad.id as string} className="p-3 flex items-center justify-between border-b border-white/5 last:border-0">
                        <p className="text-xs font-semibold text-white line-clamp-1">{ad.title as string}</p>
                        <button onClick={() => publishAd(ad.id as string)} className="text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-1 rounded-lg">🚀</button>
                      </div>
                    ))}
                    {publishQueue.length === 0 && <p className="p-4 text-center text-xs text-white/30">Queue empty</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment-queue' && (
              <motion.div key="pq" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {paymentQueue.map(p => (
                  <div key={p.id as string} className="glass rounded-xl p-5 border border-white/8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="font-display font-bold text-white">{((p.ad as Record<string,unknown>)?.title as string)}</p>
                        <p className="text-xs text-white/40 mt-0.5">By {((p.user as Record<string,unknown>)?.full_name as string)} · PKR {(p.amount as number)?.toLocaleString()} · {p.payment_method as string}</p>
                        <p className="text-xs text-white/30">Ref: {p.transaction_ref as string} · {formatDistanceToNow(new Date(p.created_at as string), { addSuffix: true })}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a href={p.proof_url as string} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400">🔗 View Proof</a>
                        <div className="flex gap-2">
                          <button onClick={() => verifyPayment(p.id as string, (p.ad as Record<string,unknown>)?.id as string, 'verify')} className="flex-1 text-sm bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg font-semibold">✅ Verify</button>
                          <button onClick={() => verifyPayment(p.id as string, (p.ad as Record<string,unknown>)?.id as string, 'reject')} className="flex-1 text-sm bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-semibold">❌ Reject</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {paymentQueue.length === 0 && <div className="glass rounded-xl p-12 text-center border border-white/8"><CheckCircle2 size={32} className="mx-auto mb-3 text-green-400/40" /><p className="text-white/40">All verified!</p></div>}
              </motion.div>
            )}

            {activeTab === 'publish-queue' && (
              <motion.div key="pub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {publishQueue.map(ad => <PublishItem key={ad.id as string} ad={ad} onPublish={publishAd} />)}
                {publishQueue.length === 0 && <div className="glass rounded-xl p-12 text-center border border-white/8"><Send size={32} className="mx-auto mb-3 text-violet-400/40" /><p className="text-white/40">Queue empty</p></div>}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div key="ana" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="chart-container">
                    <h3 className="font-display font-bold text-white mb-4">Ads by Category</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={categoryData}>
                        <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-container">
                    <h3 className="font-display font-bold text-white mb-4">Revenue by Package</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={revenueByPackage} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {revenueByPackage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass rounded-xl p-6 border border-white/8">
                  <h3 className="font-display font-bold text-white mb-4">Moderation Rates</h3>
                  {[['Approval Rate', analytics.approvalRate, '#10B981'], ['Rejection Rate', analytics.rejectionRate, '#EF4444']].map(([label, pct, color]) => (
                    <div key={label as string} className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white/50">{label as string}</span>
                        <span className="font-bold" style={{ color: color as string }}>{pct as number}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ background: color as string }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
