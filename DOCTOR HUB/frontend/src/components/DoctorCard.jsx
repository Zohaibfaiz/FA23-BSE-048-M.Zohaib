import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TREATMENT_COLORS } from '../utils/constants';

export const DoctorCard = ({ doctor, index = 0, profileBase = '/patient/doctors' }) => {
  const user = doctor.userId;
  const city = doctor.clinics?.[0]?.city;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="glass group overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_48px_rgba(201,169,98,0.15)]"
    >
      <div className="relative h-1.5 bg-gradient-to-r from-transparent via-[var(--color-brass)] to-transparent opacity-50 group-hover:opacity-100 transition" />
      <div className="p-6">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <div
              className="absolute -inset-1 rounded-sm opacity-60"
              style={{
                background: 'linear-gradient(135deg, var(--color-brass), var(--color-sage))',
                borderRadius: '2px 16px 2px 16px',
              }}
            />
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr')}&background=C9A962&color=0A1412&bold=true`
              }
              alt={user?.name}
              loading="lazy"
              className="relative h-18 w-18 object-cover"
              style={{ width: 72, height: 72, borderRadius: '2px 14px 2px 14px' }}
            />
            <span
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-success)]"
              title="Available"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold truncate">{user?.name}</h3>
            <p className="font-accent text-base italic text-[var(--color-sage-glow)]">
              {doctor.specialization}
            </p>
            {city && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                <MapPin size={12} className="text-[var(--color-brass)]" /> {city}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={TREATMENT_COLORS[doctor.treatmentType]}>{doctor.treatmentType}</span>
          <span className="flex items-center gap-1 text-sm text-[var(--color-brass-light)]">
            <Star size={14} fill="currentColor" className="text-[var(--color-brass)]" />
            {doctor.rating?.toFixed(1)}
            <span className="text-muted text-xs">({doctor.reviewCount})</span>
          </span>
        </div>

        <Link
          to={`${profileBase}/${doctor._id}`}
          className="btn-primary mt-5 w-full text-center text-xs tracking-widest"
        >
          Reserve Consultation
        </Link>
      </div>
    </motion.article>
  );
};
