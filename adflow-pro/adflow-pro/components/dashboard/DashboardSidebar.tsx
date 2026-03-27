'use client';
// components/dashboard/DashboardSidebar.tsx
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Plus, CreditCard, Bell, User,
  ClipboardList, CheckSquare, BarChart2, Settings, Shield,
  Package, Map, Tags, LogOut, Zap, ChevronLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as UserType } from '@/types';

type UserRole = 'client' | 'moderator' | 'admin' | 'super_admin';

interface Props {
  role: UserRole;
  user: UserType | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CLIENT_TABS = [
  { id: 'overview',       icon: LayoutDashboard, label: 'Overview' },
  { id: 'my-ads',         icon: FileText,        label: 'My Listings' },
  { id: 'create-ad',      icon: Plus,            label: 'Post New Ad' },
  { id: 'payment',        icon: CreditCard,      label: 'Submit Payment' },
  { id: 'notifications',  icon: Bell,            label: 'Notifications' },
];

const MODERATOR_TABS = [
  { id: 'overview',       icon: LayoutDashboard, label: 'Overview' },
  { id: 'review-queue',   icon: ClipboardList,   label: 'Review Queue' },
  { id: 'reviewed',       icon: CheckSquare,     label: 'Reviewed' },
];

const ADMIN_TABS = [
  { id: 'overview',       icon: LayoutDashboard, label: 'Overview' },
  { id: 'payment-queue',  icon: CreditCard,      label: 'Payment Queue' },
  { id: 'publish-queue',  icon: CheckSquare,     label: 'Publish Queue' },
  { id: 'analytics',      icon: BarChart2,       label: 'Analytics' },
  { id: 'manage-ads',     icon: FileText,        label: 'All Ads' },
];

const SUPERADMIN_TABS = [
  { id: 'overview',       icon: LayoutDashboard, label: 'Overview' },
  { id: 'packages',       icon: Package,         label: 'Packages' },
  { id: 'categories',     icon: Tags,            label: 'Categories' },
  { id: 'cities',         icon: Map,             label: 'Cities' },
  { id: 'users',          icon: Shield,          label: 'Users' },
  { id: 'reports',        icon: BarChart2,       label: 'Reports' },
];

const ROLE_TABS = {
  client:       CLIENT_TABS,
  moderator:    MODERATOR_TABS,
  admin:        ADMIN_TABS,
  super_admin:  SUPERADMIN_TABS,
};

export default function DashboardSidebar({ role, user, activeTab, onTabChange }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const tabs = ROLE_TABS[role] ?? CLIENT_TABS;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <motion.aside
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="sidebar w-60 shrink-0 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-base text-white">AdFlow<span className="gradient-text">Pro</span></span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center text-violet-300 text-sm font-bold">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name ?? 'User'}</p>
            <p className="text-[10px] text-white/40 capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/8 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <ChevronLeft size={16} /> Back to site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </motion.aside>
  );
}
