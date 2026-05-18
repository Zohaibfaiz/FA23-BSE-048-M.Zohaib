import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X, LayoutDashboard, PlusCircle, Users, Activity, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavItems = () => {
    if (profile?.role === 'super_admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: Activity },
      ];
    } else if (profile?.role === 'election_creator') {
      return [
        { name: 'Dashboard', path: '/creator/dashboard', icon: LayoutDashboard },
        { name: 'New Election', path: '/creator/elections/new', icon: PlusCircle },
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/voter/dashboard', icon: LayoutDashboard },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-primaryBg flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 w-64 bg-secondaryBg border-r border-borderColor z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-borderColor">
            <Link to="/" className="text-xl font-heading font-bold text-primaryGold">SecureVote<span className="text-textPrimary">Pro</span></Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primaryGold/10 text-primaryGold border border-primaryGold/20' 
                        : 'text-textSecondary hover:bg-cardBg hover:text-textPrimary'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primaryGold' : 'text-textMuted'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-borderColor">
            <div className="flex items-center px-4 py-3 mb-2 rounded-lg bg-cardBg border border-borderColor">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-textPrimary truncate">{profile?.full_name}</p>
                <p className="text-xs text-textSecondary truncate capitalize">{profile?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-dangerRed hover:bg-dangerRed/10 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-secondaryBg/80 backdrop-blur-md border-b border-borderColor flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-textSecondary hover:bg-cardBg"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-end items-center">
            <button className="p-2 text-textSecondary hover:text-primaryGold transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
