import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useDoctorProfile } from '../../hooks/useDoctorProfile';
import { useFetch } from '../../hooks/useFetch';
import { ScheduleBuilder } from '../../components/ScheduleBuilder';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function DoctorSchedule() {
  const { doctor, loading: docLoading } = useDoctorProfile();
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: clinics, loading } = useFetch(async () => {
    if (!doctor?._id) return [];
    const { data } = await api.get(`/clinics/${doctor._id}`);
    return data.clinics;
  }, [doctor?._id]);

  const selectedClinic = clinics?.find((c) => c._id === selectedClinicId) || clinics?.[0];

  const handleSave = async (schedule) => {
    if (!selectedClinic) return;
    setSaving(true);
    try {
      await api.put(`/clinics/${selectedClinic._id}/schedule`, { schedule });
      toast.success('Schedule saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (docLoading || loading) return <ListSkeleton count={2} />;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Schedule</h1>

      {clinics?.length > 0 ? (
        <>
          <select
            className="input-field max-w-xs"
            value={selectedClinicId || selectedClinic?._id || ''}
            onChange={(e) => setSelectedClinicId(e.target.value)}
          >
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>{c.name} — {c.city}</option>
            ))}
          </select>

          <div className="glass p-6">
            <ScheduleBuilder clinic={selectedClinic} onSave={handleSave} saving={saving} />
          </div>
        </>
      ) : (
        <p className="text-white/50">Create a clinic first to set your schedule.</p>
      )}
    </div>
  );
}
