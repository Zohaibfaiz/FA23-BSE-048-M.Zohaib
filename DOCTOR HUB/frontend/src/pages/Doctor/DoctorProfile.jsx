import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDoctorProfile } from '../../hooks/useDoctorProfile';
import api from '../../utils/api';
import { TREATMENT_COLORS } from '../../utils/constants';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function DoctorProfile() {
  const { user, fetchUser } = useAuth();
  const { doctor, loading, refetch } = useDoctorProfile();
  const [pwLoading, setPwLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    values: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: doctor?.bio || '',
      qualification: doctor?.qualification || '',
      experience: doctor?.experience || 0,
    },
  });

  const onSave = async (data) => {
    try {
      await api.put('/auth/profile', { name: data.name, phone: data.phone });
      if (doctor?._id) {
        await api.put(`/doctors/${doctor._id}`, {
          bio: data.bio,
          qualification: data.qualification,
          experience: Number(data.experience),
        });
      }
      await fetchUser();
      refetch();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const onPassword = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: fd.get('currentPassword'),
        newPassword: fd.get('newPassword'),
      });
      toast.success('Password updated');
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <ListSkeleton count={2} />;

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-heading text-3xl font-bold">Profile</h1>

      {doctor && (
        <div className="glass p-4 flex flex-wrap gap-2">
          <span className={`rounded-lg border px-3 py-1 text-sm capitalize ${TREATMENT_COLORS[doctor.treatmentType]}`}>
            {doctor.treatmentType}
          </span>
          <span className="text-sm text-white/50">{doctor.specialization}</span>
          {!doctor.isApproved && (
            <span className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs text-amber-300">Pending approval</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSave)} className="glass p-6 space-y-4">
        <input className="input-field" {...register('name')} placeholder="Name" />
        <input className="input-field" {...register('phone')} placeholder="Phone" />
        <textarea className="input-field" {...register('bio')} placeholder="Bio" rows={3} />
        <input className="input-field" {...register('qualification')} placeholder="Qualification" />
        <input className="input-field" type="number" {...register('experience')} placeholder="Years of experience" />
        <p className="text-sm text-white/50">{user?.email}</p>
        <button type="submit" className="btn-primary">Save</button>
      </form>

      <form onSubmit={onPassword} className="glass p-6 space-y-4">
        <h2 className="font-heading font-bold">Change Password</h2>
        <input className="input-field" name="currentPassword" type="password" placeholder="Current" required />
        <input className="input-field" name="newPassword" type="password" placeholder="New" required />
        <button type="submit" disabled={pwLoading} className="btn-primary">
          {pwLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
