'use client';
// components/layout/Navbar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, LogOut, Menu, X, Zap,
  Search, Bell, ChevronDown, User
} from 'lucide-react';
import type { User as SupaUser } from '@supabase/supabase-js';

const navLinks = [
  { href: '/explore',   label: 'Explore Ads' },
  { href: '/packages',  label: 'Packages' },
  { href: '/categories',label: 'Categories' },
  { href: '/faq',       label: 'FAQ' },
  { href: '/contact',   label: 'Contact' },
];

export default function Navbar() {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [role, setRole] = useState<string>('client');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('users').select('role').eq('id', user.id).single()
          .then(({ data }) => { if (data) setRole(data.role); });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll); };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function getDashboardHref() {
    if (role === 'super_admin') return '/superadmin';
    if (role === 'admin') return '/admin';
    if (role === 'moderator') return '/moderator';
    return '/client';
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-white/10 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-800 text-xl text-white">
              AdFlow<span className="gradient-text">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-violet-400'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search shortcut */}
            <Link href="/explore" className="p-2 text-white/40 hover:text-white transition-colors">
              <Search size={18} />
            </Link>

            {user ? (
              <>
                {/* Dashboard */}
                <Link
                  href={getDashboardHref()}
                  className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-red-400 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2">
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">
                  Post an Ad
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/60"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/10 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href={getDashboardHref()} onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center py-2">
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="text-sm text-red-400 py-2">Sign out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center py-2">Sign in</Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center py-2">Post an Ad</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
