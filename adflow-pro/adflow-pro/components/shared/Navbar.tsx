'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/',          label: 'Home' },
  { href: '/ads',       label: 'Explore Ads' },
  { href: '/packages',  label: 'Packages' },
  { href: '/categories', label: 'Categories' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass-card mx-4 mt-3 rounded-2xl border border-white/10'
          : 'bg-transparent border-b border-white/5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-neon-purple flex items-center justify-center group-hover:animate-glow transition-all">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">AdFlow Pro</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard/client" className="relative p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors">
                  <Bell className="w-4 h-4" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-neon-purple flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/dashboard/client" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-sm text-rose-400 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="btn-neon text-sm">
                  Post an Ad
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                {user ? (
                  <Link href="/dashboard/client" className="px-4 py-2.5 rounded-lg text-sm text-center bg-brand-500/20 text-brand-400">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2.5 rounded-lg text-sm text-center border border-white/10 hover:bg-white/5">Sign In</Link>
                    <Link href="/register" className="btn-neon text-sm text-center">Post an Ad</Link>
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
