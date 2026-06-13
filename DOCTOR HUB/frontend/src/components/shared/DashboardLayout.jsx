import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from './ErrorBoundary';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const DashboardLayout = ({ navItems, role }) => (
  <div className="dashboard-main flex min-h-screen">
    <Sidebar navItems={navItems} role={role} />
    <main className="relative flex-1 overflow-auto p-4 pt-16 lg:p-10 lg:pt-10">
      <ErrorBoundary>
        <motion.div variants={pageVariants} initial="hidden" animate="visible" className="relative z-10">
          <Outlet />
        </motion.div>
      </ErrorBoundary>
    </main>
  </div>
);
