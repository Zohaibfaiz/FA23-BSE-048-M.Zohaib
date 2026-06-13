import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeLabels = {
  allopathic: 'Allopathic',
  homeopathic: 'Homeopathic',
  herbal: 'Herbal',
};

export function PublicDoctorCard({ doctor, index = 0 }) {
  const user = doctor.userId;
  const city = doctor.clinics?.[0]?.city;
  const fee = doctor.consultationFee ?? doctor.fee ?? 1500;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="premium-card p-6 h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <img
          src={
            user?.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr')}&background=2563EB&color=fff&bold=true`
          }
          alt={user?.name}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-[#2563eb]/10"
        />
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#2563eb]/10 text-[#2563eb]">
          {doctor.isApproved !== false ? 'Verified' : 'Pending'}
        </span>
      </div>

      <Link to={`/doctors/${doctor._id}`} className="hover:text-[#2563eb] transition-colors">
        <h3 className="font-bold text-lg">{user?.name}</h3>
      </Link>
      <p className="text-sm text-muted-fg mt-1">{doctor.specialization}</p>

      {typeLabels[doctor.treatmentType] && (
        <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full border border-[#e2e8f0]">
          {typeLabels[doctor.treatmentType]}
        </span>
      )}

      <div className="mt-3 flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="font-bold">{doctor.rating?.toFixed(1) || '4.5'}</span>
        <span className="text-muted-fg">({doctor.reviewCount || 0})</span>
      </div>

      {city && (
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-fg">
          <MapPin className="h-3.5 w-3.5" /> {city}
        </p>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#e2e8f0]">
        <span className="font-bold text-[#2563eb]">Rs. {fee.toLocaleString()}</span>
        <Link to={`/doctors/${doctor._id}`} className="btn-primary-public text-xs py-2 px-3">
          View
        </Link>
      </div>
    </motion.article>
  );
}
