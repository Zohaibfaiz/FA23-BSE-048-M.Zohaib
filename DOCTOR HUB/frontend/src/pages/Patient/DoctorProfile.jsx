import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Award } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { TREATMENT_COLORS } from '../../utils/constants';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function DoctorProfile() {
  const { id } = useParams();

  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get(`/doctors/${id}`);
    return res;
  }, [id]);

  if (loading) return <ListSkeleton count={1} />;

  const { doctor, clinics } = data || {};
  const user = doctor?.userId;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="glass p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <img
            src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr')}&background=00B4D8&color=0A1628&size=128`}
            alt={user?.name}
            className="h-32 w-32 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-bold">{user?.name}</h1>
            <p className="text-teal text-lg">{doctor?.specialization}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <span className={`rounded-lg border px-3 py-1 text-sm capitalize ${TREATMENT_COLORS[doctor?.treatmentType]}`}>
                {doctor?.treatmentType}
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Star fill="currentColor" size={18} /> {doctor?.rating} ({doctor?.reviewCount} reviews)
              </span>
            </div>
            <p className="mt-4 text-white/70">{doctor?.bio}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/50">
              <Award size={16} /> {doctor?.qualification} · {doctor?.experience} years experience
            </p>
          </div>
        </div>
        <Link to={`/patient/book/${id}`} className="btn-primary mt-6 inline-flex">
          Book Appointment
        </Link>
      </div>

      <div className="glass p-6">
        <h2 className="font-heading text-xl font-bold mb-4">Clinics</h2>
        <div className="space-y-4">
          {clinics?.map((c) => (
            <div key={c._id} className="rounded-xl border border-white/10 p-4">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-white/50 flex items-center gap-1 mt-1">
                <MapPin size={14} /> {c.address}, {c.city}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
