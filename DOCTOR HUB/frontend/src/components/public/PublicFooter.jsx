import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../shared/Logo';
import { PLATFORM_CONTACT } from '../../utils/constants';

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="gradient-cta relative">
        <div className="page-shell py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Ready to take control of your health?
              </h3>
              <p className="mt-4 text-lg text-white/85 leading-relaxed">
                Join thousands of patients across Pakistan booking trusted doctors online.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/doctors" className="btn-secondary-public bg-white text-[#2563eb] hover:bg-white/90 shadow-xl text-center">
                Find Doctors
              </Link>
              <Link to="/#search" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/40 text-white hover:bg-white/10 transition">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] text-slate-300">
        <div className="page-shell py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-white mb-5">
                <Logo size="md" subtitle="" />
              </Link>
              <p className="text-sm leading-relaxed text-slate-400">
                Your trusted healthcare consultation platform. Connect with top doctors, manage
                records, and take control of your health.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-5">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Book Appointment</Link></li>
                <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-5">For Doctors</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Join as Doctor</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-5">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                    <Mail className="h-4 w-4 text-[#0d9488]" />
                  </div>
                  {PLATFORM_CONTACT.email}
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                    <Phone className="h-4 w-4 text-[#0d9488]" />
                  </div>
                  {PLATFORM_CONTACT.phone}
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                    <MapPin className="h-4 w-4 text-[#0d9488]" />
                  </div>
                  {PLATFORM_CONTACT.headquarters}
                </li>
              </ul>
            </div>
          </div>
          <div className="my-10 border-t border-slate-700/50" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Doctor Hub. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
