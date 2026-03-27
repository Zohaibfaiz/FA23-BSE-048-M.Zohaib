'use client';
// app/(dashboard)/client/ClientDashboardClient.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileText, CreditCard, Bell, User, Zap, LayoutDashboard, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import CreateAdForm from '@/components/forms/CreateAdForm';
import SubmitPaymentForm from '@/components/forms/SubmitPaymentForm';
import AdStatusBadge from '@/components/ads/AdStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import type { Ad, Package, Category, City, Notification, User as UserType } from '@/types';

interface Props {
  user: UserType | null; ads: Ad[]; packages: Package[];
  categories: Category[]; cities: City[]; notifications: Notification[];
}

type Tab = 'overview' | 'my-ads' | 'create-ad' | 'payment' | 'notifications';

export default function ClientDashboardClient({ user, ads, packages, categories, cities, notifications }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [paymentAdId, setPaymentAdId] = useState<string | null>(null);

  const stats = {
    total:     ads.length,
    published: ads.filter(a => a.status === 'published').length,
    pending:   ads.filter(a => ['submitted','under_review','payment_pending','payment_submitted','payment_verified','scheduled'].includes(a.status)).length,
    expired:   ads.filter(a => a.status === 'expired').length,
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#080B14] flex">
      {/* Sidebar */}
      <DashboardSidebar role="client" user={user} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as Tab)} />

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'my-ads' && 'My Listings'}
                {activeTab === 'create-ad' && 'Post New Ad'}
                {activeTab === 'payment' && 'Submit Payment'}
                {activeTab === 'notifications' && 'Notifications'}
              </h1>
              <p className="text-white/40 text-sm mt-0.5">
                Welcome back, {user?.full_name ?? 'User'} 👋
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create-ad')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Post New Ad
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Ads',   value: stats.total,     color: '#8B5CF6', icon: FileText },
                    { label: 'Published',   value: stats.published, color: '#10B981', icon: CheckCircle2 },
                    { label: 'In Progress', value: stats.pending,   color: '#F59E0B', icon: Clock },
                    { label: 'Expired',     value: stats.expired,   color: '#EF4444', icon: XCircle },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <motion.div key={s.label} whileHover={{ y: -4 }} className="glass rounded-xl p-4 border border-white/8">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                            <Icon size={16} style={{ color: s.color }} />
                          </div>
                          <span className="text-2xl font-display font-bold text-white">{s.value}</span>
                        </div>
                        <p className="text-xs text-white/40">{s.label}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Recent Ads */}
                <div className="glass rounded-xl border border-white/8">
                  <div className="flex items-center justify-between p-5 border-b border-white/8">
                    <h3 className="font-display font-bold text-white">Recent Ads</h3>
                    <button onClick={() => setActiveTab('my-ads')} className="text-sm text-violet-400 hover:text-violet-300">
                      View all →
                    </button>
                  </div>
                  {ads.slice(0, 5).map(ad => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{ad.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">{ad.category?.name} · {ad.city?.name}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <AdStatusBadge status={ad.status} />
                        {ad.status === 'payment_pending' && (
                          <button
                            onClick={() => { setPaymentAdId(ad.id); setActiveTab('payment'); }}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <CreditCard size={12} /> Pay
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {ads.length === 0 && (
                    <div className="p-8 text-center text-white/30 text-sm">
                      No ads yet. <button onClick={() => setActiveTab('create-ad')} className="text-violet-400 hover:underline">Post your first ad →</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* MY ADS TAB */}
            {activeTab === 'my-ads' && (
              <motion.div key="my-ads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-3">
                  {ads.map(ad => (
                    <motion.div key={ad.id} whileHover={{ x: 4 }} className="glass rounded-xl p-4 border border-white/8 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{ad.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {ad.category?.name} · {ad.city?.name} · {ad.package?.name} Package
                        </p>
                        <p className="text-xs text-white/25 mt-0.5">
                          {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdStatusBadge status={ad.status} />
                        {ad.status === 'published' && (
                          <Link href={`/ads/${ad.slug}`} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                            View <ChevronRight size={12} />
                          </Link>
                        )}
                        {ad.status === 'payment_pending' && (
                          <button onClick={() => { setPaymentAdId(ad.id); setActiveTab('payment'); }} className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                            Submit Payment
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {ads.length === 0 && (
                    <div className="glass rounded-xl p-12 text-center border border-white/8">
                      <FileText size={32} className="mx-auto mb-3 text-white/20" />
                      <p className="text-white/40 mb-4">No listings yet</p>
                      <button onClick={() => setActiveTab('create-ad')} className="btn-primary">Post Your First Ad</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CREATE AD TAB */}
            {activeTab === 'create-ad' && (
              <motion.div key="create-ad" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CreateAdForm
                  packages={packages}
                  categories={categories}
                  cities={cities}
                  onSuccess={() => setActiveTab('my-ads')}
                />
              </motion.div>
            )}

            {/* PAYMENT TAB */}
            {activeTab === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SubmitPaymentForm
                  ads={ads.filter(a => a.status === 'payment_pending')}
                  preselectedAdId={paymentAdId ?? undefined}
                  onSuccess={() => setActiveTab('my-ads')}
                />
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className={`glass rounded-xl p-4 border ${n.is_read ? 'border-white/5 opacity-60' : 'border-violet-500/20'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-green-400' : n.type === 'error' ? 'bg-red-400' : n.type === 'warning' ? 'bg-amber-400' : 'bg-violet-400'}`} />
                        <div>
                          <p className="font-semibold text-sm text-white">{n.title}</p>
                          <p className="text-xs text-white/50 mt-0.5">{n.message}</p>
                          <p className="text-xs text-white/25 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="glass rounded-xl p-12 text-center border border-white/8">
                      <Bell size={32} className="mx-auto mb-3 text-white/20" />
                      <p className="text-white/40">No notifications yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
