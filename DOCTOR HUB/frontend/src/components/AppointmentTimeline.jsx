import { motion } from 'framer-motion';
import { Check, CreditCard, ShieldCheck, CalendarCheck } from 'lucide-react';
import { formatDateTime } from '../utils/formatDate';

const STEPS = [
  { key: 'booked', label: 'Booked', icon: CalendarCheck },
  { key: 'payment_uploaded', label: 'Payment Uploaded', icon: CreditCard },
  { key: 'payment_verified', label: 'Payment Verified', icon: ShieldCheck },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'completed', label: 'Completed', icon: Check },
];

export const AppointmentTimeline = ({ timeline = [], status }) => {
  const completedKeys = new Set(timeline.map((t) => t.step));
  if (status === 'confirmed') completedKeys.add('confirmed');
  if (status === 'completed') completedKeys.add('completed');

  const activeIndex = STEPS.findIndex((s) => !completedKeys.has(s.key));

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const record = timeline.find((t) => t.step === step.key);
        const done = completedKeys.has(step.key);
        const active = i === activeIndex || (activeIndex === -1 && i === STEPS.length - 1);
        const Icon = done ? Check : step.icon;

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                animate={active && !done ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: active && !done ? Infinity : 0, duration: 1.5 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  done ? 'bg-success text-navy' : active ? 'bg-teal text-navy' : 'bg-white/10 text-white/40'
                }`}
              >
                <Icon size={18} />
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-[32px] ${done ? 'bg-success' : 'bg-white/10'}`} />
              )}
            </div>
            <div className="pb-8">
              <p className={`font-medium ${done || active ? 'text-white' : 'text-white/40'}`}>
                {step.label}
                {status === 'pending' && step.key === 'booked' && (
                  <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                )}
              </p>
              {record && (
                <p className="text-xs text-white/40">{formatDateTime(record.timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
