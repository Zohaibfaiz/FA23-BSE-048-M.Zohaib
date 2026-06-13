import { Link, useParams } from 'react-router-dom';
import { Star, MapPin, Award } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function PublicDoctorProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get(`/doctors/${id}`);
    return res;
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell py-12">
        <div className="premium-card h-96 animate-pulse bg-slate-100" />
      </div>
    );
  }

  const { doctor, clinics } = data || {};
  const docUser = doctor?.userId;

  return (
    <div className="page-shell py-12 max-w-4xl">
      <div className="premium-card p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <img
            src={
              docUser?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(docUser?.name || 'Dr')}&background=2563EB&color=fff&size=128`
            }
            alt={docUser?.name}
            className="h-32 w-32 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{docUser?.name}</h1>
            <p className="text-[#0d9488] text-lg">{doctor?.specialization}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <span className="rounded-lg border px-3 py-1 text-sm capitalize">
                {doctor?.treatmentType}
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star fill="currentColor" size={18} /> {doctor?.rating} ({doctor?.reviewCount} reviews)
              </span>
            </div>
            <p className="mt-4 text-muted-fg">{doctor?.bio}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-fg">
              <Award size={16} /> {doctor?.qualification} · {doctor?.experience} years experience
            </p>
          </div>
        </div>
        <Link
          to={user?.role === 'patient' ? `/patient/book/${id}` : '/login'}
          state={user?.role !== 'patient' ? { from: { pathname: `/patient/book/${id}` } } : undefined}
          className="btn-primary-public mt-6 inline-flex"
        >
          Book Appointment
        </Link>
      </div>

      <div className="premium-card p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Clinics</h2>
        <div className="space-y-4">
          {clinics?.length ? clinics.map((c) => (
            <div key={c._id} className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-fg flex items-center gap-1 mt-1">
                <MapPin size={14} /> {c.address}, {c.city}
              </p>
              {c.consultationFee && (
                <p className="text-sm text-[#2563eb] mt-2 font-medium">
                  Fee: Rs. {c.consultationFee.toLocaleString()}
                </p>
              )}
            </div>
          )) : (
            <p className="text-muted-fg text-sm">No clinic information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
