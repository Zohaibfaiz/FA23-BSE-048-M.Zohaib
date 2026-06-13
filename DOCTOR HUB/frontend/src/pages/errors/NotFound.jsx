import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../../components/shared/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass max-w-md p-12">
        <Logo size="md" />
        <p className="font-display mt-10 text-7xl font-bold text-[var(--color-brass)]">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Passage Not Found</h1>
        <p className="mt-2 font-accent text-lg italic text-muted">
          The chamber you seek does not exist in our halls.
        </p>
        <Link to="/" className="btn-primary mt-10 inline-flex">
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
