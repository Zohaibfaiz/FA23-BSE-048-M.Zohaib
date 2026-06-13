import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../shared/Logo';

export function PublicHeader() {
  const { user, dashboardPath } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md">
      <div className="page-shell flex items-center justify-between py-4">
        <Link to="/">
          <Logo size="md" subtitle="" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-fg">
          <Link to="/doctors" className="hover:text-[#2563eb] transition-colors cursor-pointer">Find Doctors</Link>
          <Link to="/#search" className="hover:text-[#2563eb] transition-colors cursor-pointer">Book Appointment</Link>
          <Link to="/#how-it-works" className="hover:text-[#2563eb] transition-colors cursor-pointer">How It Works</Link>
          <Link to="/#faq" className="hover:text-[#2563eb] transition-colors cursor-pointer">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to={dashboardPath} className="btn-primary-public text-sm py-2 px-4">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary-public text-sm py-2 px-4 hidden sm:inline-flex">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary-public text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
