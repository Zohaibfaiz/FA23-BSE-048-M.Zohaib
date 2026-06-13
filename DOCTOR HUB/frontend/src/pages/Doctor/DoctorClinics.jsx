import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api from '../../utils/api';
import { useDoctorProfile } from '../../hooks/useDoctorProfile';
import { useFetch } from '../../hooks/useFetch';
import { Modal } from '../../components/shared/Modal';
import { ListSkeleton } from '../../components/shared/Skeleton';

const emptyClinic = { name: '', address: '', city: '', phone: '', mapLink: '' };

export default function DoctorClinics() {
  const { doctor, loading: docLoading } = useDoctorProfile();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyClinic);
  const [assistantForm, setAssistantForm] = useState({ clinicId: '', email: '', name: '' });

  const { data: clinics, loading, refetch } = useFetch(async () => {
    if (!doctor?._id) return [];
    const { data } = await api.get(`/clinics/${doctor._id}`);
    return data.clinics;
  }, [doctor?._id]);

  const createClinic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clinics', form);
      toast.success('Clinic created');
      setShowForm(false);
      setForm(emptyClinic);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const addAssistant = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clinics/${assistantForm.clinicId}/assistants`, {
        email: assistantForm.email,
        name: assistantForm.name,
      });
      toast.success('Assistant added');
      setAssistantForm({ clinicId: '', email: '', name: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (docLoading || loading) return <ListSkeleton count={2} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Clinics</h1>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={18} /> Add Clinic
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {clinics?.map((c) => (
          <div key={c._id} className="glass p-5">
            <h3 className="font-heading font-bold">{c.name}</h3>
            <p className="text-sm text-white/50 mt-1">{c.address}, {c.city}</p>
            <p className="text-sm text-white/50">{c.phone}</p>
            {c.mapLink && (
              <a href={c.mapLink} target="_blank" rel="noreferrer" className="text-xs text-teal mt-2 inline-block hover:underline">
                View on map
              </a>
            )}
          </div>
        ))}
      </div>

      {clinics?.length > 0 && (
        <form onSubmit={addAssistant} className="glass p-6 space-y-3">
          <h2 className="font-heading font-bold">Add Assistant</h2>
          <select
            className="input-field"
            value={assistantForm.clinicId}
            onChange={(e) => setAssistantForm({ ...assistantForm, clinicId: e.target.value })}
            required
          >
            <option value="">Select clinic</option>
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input className="input-field" placeholder="Assistant email" type="email" value={assistantForm.email} onChange={(e) => setAssistantForm({ ...assistantForm, email: e.target.value })} required />
          <input className="input-field" placeholder="Name (optional)" value={assistantForm.name} onChange={(e) => setAssistantForm({ ...assistantForm, name: e.target.value })} />
          <button type="submit" className="btn-primary">Add Assistant</button>
        </form>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Clinic">
        <form onSubmit={createClinic} className="space-y-3">
          {Object.keys(emptyClinic).map((key) => (
            <input
              key={key}
              className="input-field capitalize"
              placeholder={key.replace(/([A-Z])/g, ' $1')}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== 'mapLink'}
            />
          ))}
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </div>
  );
}
