import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function PatientProfile() {
  const { user, fetchUser } = useAuth();
  const [pwLoading, setPwLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const onProfile = async (data) => {
    try {
      await api.put('/auth/profile', data);
      await fetchUser();
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
      toast.success('Password changed');
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  const onLabUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('report', file);
    fd.append('title', file.name);
    try {
      await api.post('/history/lab-reports/upload', fd);
      toast.success('Lab report uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-heading text-3xl font-bold">Profile</h1>

      <form onSubmit={handleSubmit(onProfile)} className="glass p-6 space-y-4">
        <h2 className="font-heading font-bold">Personal Info</h2>
        <input className="input-field" {...register('name')} placeholder="Name" />
        <input className="input-field" {...register('phone')} placeholder="Phone" />
        <p className="text-sm text-white/50">{user?.email}</p>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>

      <form onSubmit={onPassword} className="glass p-6 space-y-4">
        <h2 className="font-heading font-bold">Change Password</h2>
        <input className="input-field" name="currentPassword" type="password" placeholder="Current password" required />
        <input className="input-field" name="newPassword" type="password" placeholder="New password" required />
        <button type="submit" disabled={pwLoading} className="btn-primary">
          {pwLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className="glass p-6">
        <h2 className="font-heading font-bold mb-4">Upload Lab Report</h2>
        <input type="file" accept="image/jpeg,image/png" onChange={onLabUpload} className="input-field" />
      </div>
    </div>
  );
}
