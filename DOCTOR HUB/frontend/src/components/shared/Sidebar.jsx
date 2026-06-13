import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Menu, LogOut, ChevronLeft, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLE_ACCENT } from '../../utils/constants';
import { Logo } from './Logo';

function NavContent({
  collapsed,
  navItems,
  accent,
  role,
  user,
  theme,
  toggleTheme,
  handleLogout,
  closeMobile,
}) {
  return (
    <>
      <div className={`mb-8 px-1 ${collapsed ? 'flex justify-center' : ''}`}>
        <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} subtitle={collapsed ? undefined : role} />
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon }) => {
          const Icon = Icons[icon] || Icons.Circle;
          return (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').filter(Boolean).length <= 1}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#0a1412]'
                    : 'text-muted hover:text-[var(--color-cream)] hover:bg-[var(--color-brass)]/8'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${accent}ee, ${accent}99)`,
                      borderRadius: '2px 12px 2px 12px',
                      boxShadow: `0 4px 16px ${accent}33`,
                    }
                  : { borderRadius: '2px 12px 2px 12px' }
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} strokeWidth={1.75} className="shrink-0" />
              {!collapsed && <span className="tracking-wide">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-[var(--color-brass)]/15 pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted transition hover:bg-[var(--color-brass)]/8 hover:text-[var(--color-cream)]"
          style={{ borderRadius: '2px 12px 2px 12px' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[var(--color-alert)] transition hover:bg-[var(--color-alert)]/10"
          style={{ borderRadius: '2px 12px 2px 12px' }}
        >
          <LogOut size={20} />
          {!collapsed && 'Logout'}
        </button>
        {!collapsed && user && (
          <p className="truncate px-3 pt-1 font-accent text-xs italic text-muted">{user.email}</p>
        )}
      </div>
    </>
  );
}

export const Sidebar = ({ navItems, role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.patient;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 glass p-2.5 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} className="text-[var(--color-brass)]" />
      </button>

      <aside
        className={`sidebar-panel relative z-20 hidden lg:flex flex-col p-4 transition-all duration-300 ${
          collapsed ? 'w-[80px]' : 'w-[270px]'
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="mb-4 self-end rounded-sm p-1.5 text-muted transition hover:bg-[var(--color-brass)]/10 hover:text-[var(--color-brass)]"
        >
          <ChevronLeft size={18} className={`transition ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        <NavContent
          collapsed={collapsed}
          navItems={navItems}
          accent={accent}
          role={role}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          closeMobile={() => setMobileOpen(false)}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28 }}
              className="sidebar-panel fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col p-4 lg:hidden"
            >
              <NavContent
                collapsed={false}
                navItems={navItems}
                accent={accent}
                role={role}
                user={user}
                theme={theme}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                closeMobile={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
