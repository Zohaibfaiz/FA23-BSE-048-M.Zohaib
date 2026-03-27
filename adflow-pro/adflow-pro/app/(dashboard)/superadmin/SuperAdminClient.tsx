'use client';
// app/(dashboard)/superadmin/SuperAdminClient.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Package, Tags, Map, Shield, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import type { User as UserType, Package as PackageType, Category, City } from '@/types';

type Tab = 'overview' | 'packages' | 'categories' | 'cities' | 'users' | 'reports';

interface Props {
  admin: UserType | null;
  packages: PackageType[];
  categories: Category[];
  cities: City[];
  users: Record<string, unknown>[];
  reports: Record<string, unknown>[];
}

export default function SuperAdminClient({ admin, packages, categories, cities, users, reports }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const supabase = createClient();
  const router = useRouter();

  async function updateUserRole(userId: string, role: string) {
    await supabase.from('users').update({ role }).eq('id', userId);
    toast.success(`Role → ${role}`);
    router.refresh();
  }

  async function toggleVerified(userId: string, current: boolean) {
    await supabase.from('users').update({ is_verified: !current }).eq('id', userId);
    toast.success(!current ? 'Verified ✅' : 'Unverified');
    router.refresh();
  }

  async function dismissReport(reportId: string) {
    await supabase.from('abuse_reports').update({ status: 'dismissed' }).eq('id', reportId);
    toast.success('Report dismissed');
    router.refresh();
  }

  async function toggleActive(table: 'categories' | 'cities', id: string, current: boolean) {
    await supabase.from(table).update({ is_active: !current }).eq('id', id);
    toast.success(`${!current ? 'Enabled' : 'Disabled'}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080B14] flex">
      <DashboardSidebar role="super_admin" user={admin} activeTab={activeTab} onTabChange={t => setActiveTab(t as Tab)} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Super Admin</h1>
            <p className="text-white/40 text-sm">Platform settings, users & content management</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    ['Packages', packages.length, '#8B5CF6', Package],
                    ['Categories', categories.length, '#06B6D4', Tags],
                    ['Cities', cities.length, '#10B981', Map],
                    ['Users', users.length, '#F59E0B', Shield],
                  ].map(([label, value, color, Icon]: unknown[]) => {
                    const I = Icon as React.ElementType;
                    return (
                      <div key={label as string} className="glass rounded-xl p-4 border border-white/8">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                            <I size={16} style={{ color }} />
                          </div>
                          <span className="text-2xl font-display font-bold text-white">{value as number}</span>
                        </div>
                        <p className="text-xs text-white/40">{label as string}</p>
                      </div>
                    );
                  })}
                </div>
                {reports.length > 0 && (
                  <div className="glass rounded-xl border border-red-500/20 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <h3 className="font-display font-bold text-white">{reports.length} Open Abuse Reports</h3>
                    </div>
                    <button onClick={() => setActiveTab('reports')} className="text-sm text-red-400 hover:text-red-300">Review now →</button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'packages' && (
              <motion.div key="pkg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {packages.map(pkg => (
                  <div key={pkg.id} className="glass rounded-xl p-5 border border-white/8 flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold text-white">{pkg.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">PKR {pkg.price.toLocaleString()} · {pkg.duration_days}d · {pkg.featured_weight}x weight · {pkg.refresh_rule}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${pkg.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{pkg.is_active ? 'Active' : 'Inactive'}</span>
                        {pkg.homepage_visibility && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">Homepage</span>}
                      </div>
                    </div>
                    <button
                      onClick={async () => { await supabase.from('packages').update({ is_active: !pkg.is_active }).eq('id', pkg.id); toast.success('Updated'); router.refresh(); }}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${pkg.is_active ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-green-500/30 text-green-400 bg-green-500/10'}`}
                    >
                      {pkg.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div key="cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="glass rounded-xl border border-white/8 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/8">{['Category','Slug','Status','Action'].map(h => <th key={h} className="p-4 text-left text-xs text-white/40">{h}</th>)}</tr></thead>
                    <tbody>
                      {categories.map(c => (
                        <tr key={c.id} className="border-b border-white/5 last:border-0">
                          <td className="p-4 text-white font-medium">{c.name}</td>
                          <td className="p-4 text-white/40 font-mono text-xs">{c.slug}</td>
                          <td className="p-4"><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td className="p-4"><button onClick={() => toggleActive('categories', c.id, c.is_active)} className="text-xs text-violet-400 hover:text-violet-300">{c.is_active ? 'Disable' : 'Enable'}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'cities' && (
              <motion.div key="cit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="glass rounded-xl border border-white/8 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/8">{['City','Province','Status','Action'].map(h => <th key={h} className="p-4 text-left text-xs text-white/40">{h}</th>)}</tr></thead>
                    <tbody>
                      {cities.map(c => (
                        <tr key={c.id} className="border-b border-white/5 last:border-0">
                          <td className="p-4 text-white font-medium">{c.name}</td>
                          <td className="p-4 text-white/40">{c.province ?? '—'}</td>
                          <td className="p-4"><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td className="p-4"><button onClick={() => toggleActive('cities', c.id, c.is_active)} className="text-xs text-violet-400 hover:text-violet-300">{c.is_active ? 'Disable' : 'Enable'}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="usr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="glass rounded-xl border border-white/8 overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead><tr className="border-b border-white/8">{['Name','Email','Role','Verified','Joined'].map(h => <th key={h} className="p-4 text-left text-xs text-white/40">{h}</th>)}</tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id as string} className="border-b border-white/5 last:border-0">
                          <td className="p-4 text-white font-medium">{u.full_name as string ?? '—'}</td>
                          <td className="p-4 text-white/40 text-xs">{u.email as string}</td>
                          <td className="p-4">
                            <select defaultValue={u.role as string} onChange={e => updateUserRole(u.id as string, e.target.value)} className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none">
                              {['client','moderator','admin','super_admin'].map(r => <option key={r} value={r} className="bg-[#111827]">{r}</option>)}
                            </select>
                          </td>
                          <td className="p-4">
                            <button onClick={() => toggleVerified(u.id as string, u.is_verified as boolean)} className={`text-[10px] px-2 py-0.5 rounded-full border ${u.is_verified ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' : 'border-white/10 text-white/30'}`}>
                              {u.is_verified ? '✓ Verified' : 'Unverified'}
                            </button>
                          </td>
                          <td className="p-4 text-xs text-white/30">{new Date(u.created_at as string).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="rep" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {reports.map(r => (
                  <div key={r.id as string} className="glass rounded-xl p-5 border border-red-500/15">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">Ad: {((r.ad as Record<string,unknown>)?.title as string) ?? '—'}</p>
                        <p className="text-xs text-white/40 mt-0.5">By: {((r.reporter as Record<string,unknown>)?.full_name as string) ?? 'Anonymous'}</p>
                        <p className="text-sm text-white/60 mt-2">{r.reason as string}</p>
                        {r.details && <p className="text-xs text-white/40 mt-1">{r.details as string}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => dismissReport(r.id as string)} className="text-xs bg-white/5 text-white/50 border border-white/10 px-3 py-1.5 rounded-lg">Dismiss</button>
                        <button
                          onClick={async () => {
                            await supabase.from('ads').update({ status: 'archived' }).eq('id', (r.ad as Record<string,unknown>)?.id as string);
                            await supabase.from('abuse_reports').update({ status: 'reviewed' }).eq('id', r.id as string);
                            toast.success('Ad archived'); router.refresh();
                          }}
                          className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg"
                        >
                          Archive Ad
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="glass rounded-xl p-12 text-center border border-white/8">
                    <CheckCircle2 size={32} className="mx-auto mb-3 text-green-400/40" />
                    <p className="text-white/40">No open reports 🎉</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
