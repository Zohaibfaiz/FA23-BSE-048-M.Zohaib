'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Settings,
  Shield,
  ShieldCheck,
  Store,
  Users,
  X,
  XCircle,
  Clock3,
  Headphones,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { UserRole } from '@/lib/types';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
};

type NavSection = {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
  roles: UserRole[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Client',
    icon: <Store className="h-4 w-4" />,
    roles: ['client', 'moderator', 'admin', 'super_admin'],
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/dashboard/ads/create', label: 'Create Ad', icon: <Plus className="h-4 w-4" /> },
      { href: '/explore', label: 'Marketplace', icon: <Store className="h-4 w-4" /> },
      { href: '/packages', label: 'Packages', icon: <Package className="h-4 w-4" /> },
      { href: '/contact', label: 'Support', icon: <Headphones className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Moderator',
    icon: <ShieldCheck className="h-4 w-4" />,
    roles: ['moderator', 'admin', 'super_admin'],
    items: [
      { href: '/moderator', label: 'Pending Ads', icon: <Clock3 className="h-4 w-4" /> },
      { href: '/moderator/approved', label: 'Approved Ads', icon: <CheckCircle2 className="h-4 w-4" /> },
      { href: '/moderator/rejected', label: 'Rejected Ads', icon: <XCircle className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Admin',
    icon: <Shield className="h-4 w-4" />,
    roles: ['admin', 'super_admin'],
    items: [
      { href: '/admin', label: 'Overview', icon: <Home className="h-4 w-4" /> },
      { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
      { href: '/admin/ads', label: 'Ads Management', icon: <FileText className="h-4 w-4" /> },
      { href: '/admin/payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
      { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Super Admin',
    icon: <Settings className="h-4 w-4" />,
    roles: ['super_admin'],
    items: [
      { href: '/super-admin', label: 'Governance', icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  moderator: 'Moderator',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const ROLE_COLORS: Record<UserRole, string> = {
  client: 'bg-sky-500/15 text-sky-700 border-sky-200',
  moderator: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  admin: 'bg-orange-500/15 text-orange-700 border-orange-200',
  super_admin: 'bg-purple-500/15 text-purple-700 border-purple-200',
};

export function UnifiedSidebar({
  user,
  children,
}: {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    role: UserRole;
  };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const visibleSections = NAV_SECTIONS.filter((section) =>
    section.roles.includes(user.role)
  );

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/auth/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out');
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href === '/moderator' && pathname === '/moderator') return true;
    if (href === '/admin' && pathname === '/admin') return true;
    if (href === '/super-admin' && pathname === '/super-admin') return true;
    if (href !== '/dashboard' && href !== '/moderator' && href !== '/admin' && href !== '/super-admin') {
      return pathname.startsWith(href);
    }
    return false;
  };

  return (
    <div className="sidebar-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25">
              AF
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-950">
              AdFlow Pro
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-btn lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white text-sm font-semibold shadow-md">
            {(user.full_name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.full_name || user.email.split('@')[0]}
            </p>
            <Badge className={`mt-1 rounded-full border px-2 py-0 text-[10px] font-medium tracking-wide ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {visibleSections.map((section) => {
            const isCollapsed = collapsedSections[section.title] ?? false;
            const hasActiveItem = section.items.some((item) => isActive(item.href));

            return (
              <div key={section.title} className="sidebar-section">
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`sidebar-section-header ${hasActiveItem ? 'sidebar-section-active' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="sidebar-section-items">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`sidebar-nav-item ${isActive(item.href) ? 'sidebar-nav-item-active' : ''}`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <Badge className="ml-auto rounded-full bg-orange-100 px-2 py-0 text-[10px] text-orange-700">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="sidebar-main">
        {/* Mobile topbar */}
        <header className="sidebar-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="sidebar-menu-btn lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-xs">
              AF
            </div>
            <span className="text-sm font-semibold text-slate-950">AdFlow Pro</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.full_name || user.email}
            </span>
            <Badge className={`hidden rounded-full border px-2 py-0 text-[10px] font-medium tracking-wide sm:inline-flex ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="sidebar-content">
          {children}
        </main>
      </div>
    </div>
  );
}
