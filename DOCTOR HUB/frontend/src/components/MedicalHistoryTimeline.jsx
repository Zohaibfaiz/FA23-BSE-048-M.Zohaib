import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronDown } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export const MedicalHistoryTimeline = ({ records = [] }) => {
  const [expanded, setExpanded] = useState(null);
  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!sorted.length) {
    return <p className="text-center text-white/50 py-8">No medical records yet.</p>;
  }

  return (
    <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal/30">
      {sorted.map((record, i) => {
        const doctorName = record.doctorId?.userId?.name || 'Doctor';
        const isOpen = expanded === record._id;

        return (
          <motion.div
            key={record._id || i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative glass p-4"
          >
            <span className="absolute -left-6 top-5 h-3 w-3 rounded-full bg-teal ring-4 ring-navy" />
            <button
              type="button"
              className="flex w-full items-start justify-between text-left"
              onClick={() => setExpanded(isOpen ? null : record._id)}
            >
              <div>
                <p className="text-xs text-teal">{formatDate(record.date)}</p>
                <p className="font-heading font-semibold">{record.diagnosis}</p>
                <p className="text-sm text-white/50">Dr. {doctorName}</p>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Lock size={14} title="Immutable record" />
                <ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 border-t border-white/10 pt-3 text-sm text-white/70"
                >
                  {record.notes || 'No additional notes.'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
