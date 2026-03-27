// components/layout/Footer.tsx
import Link from 'next/link';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

const LINKS = {
  Platform: [
    { href: '/explore',   label: 'Explore Ads' },
    { href: '/packages',  label: 'Pricing' },
    { href: '/categories',label: 'Categories' },
    { href: '/cities',    label: 'Cities' },
  ],
  Company: [
    { href: '/faq',    label: 'FAQ' },
    { href: '/contact',label: 'Contact' },
    { href: '/terms',  label: 'Terms of Service' },
  ],
  Account: [
    { href: '/auth/login',    label: 'Sign In' },
    { href: '/auth/register', label: 'Post an Ad' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060912]">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                AdFlow<span className="gradient-text">Pro</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Pakistan's premier sponsored listing marketplace with AI-powered ranking, verified payments & strict moderation.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-display font-bold text-sm text-white/80 mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <p>© {new Date().getFullYear()} AdFlow Pro. All rights reserved.</p>
          <p>Built with Next.js 14 · Supabase · Vercel</p>
        </div>
      </div>
    </footer>
  );
}
