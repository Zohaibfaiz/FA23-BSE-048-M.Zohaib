import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { Modal } from '../../components/shared/Modal';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { formatDate } from '../../utils/formatDate';

const emptyMed = () => ({ name: '', dosage: '', frequency: '', duration: '' });

export default function DoctorPrescriptions() {
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    appointmentId: '',
    medicines: [emptyMed()],
    notes: '',
  });

  const { data, loading, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/appointments?status=confirmed');
    setAppointments(res.appointments || []);
    return res.appointments || [];
  });

  const createRx = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', form);
      toast.success('Prescription created');
      setShowForm(false);
      setForm({ appointmentId: '', medicines: [emptyMed()], notes: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    }
  };

  const addMed = () => setForm({ ...form, medicines: [...form.medicines, emptyMed()] });
  const removeMed = (i) =>
    setForm({ ...form, medicines: form.medicines.filter((_, idx) => idx !== i) });
  const updateMed = (i, field, val) => {
    const meds = [...form.medicines];
    meds[i] = { ...meds[i], [field]: val };
    setForm({ ...form, medicines: meds });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Prescriptions</h1>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={18} /> New Prescription
        </button>
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : (
        <div className="space-y-3">
          {data?.map((apt) => (
            <div key={apt._id} className="glass p-4">
              <p className="font-medium">{apt.patientId?.name}</p>
              <p className="text-sm text-white/50">
                {formatDate(apt.date)} · {apt.timeSlot}
              </p>
            </div>
          ))}
          {!data?.length && <p className="text-white/50 py-8 text-center">No confirmed appointments for prescriptions.</p>}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Prescription" size="lg">
        <form onSubmit={createRx} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <select
            className="input-field"
            value={form.appointmentId}
            onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
            required
          >
            <option value="">Select appointment</option>
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.patientId?.name} — {formatDate(a.date)} {a.timeSlot}
              </option>
            ))}
          </select>

          {form.medicines.map((med, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2 rounded-xl border border-white/10 p-3">
              <input className="input-field" placeholder="Medicine" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} required />
              <input className="input-field" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} required />
              <input className="input-field" placeholder="Frequency" value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} required />
              <div className="flex gap-2">
                <input className="input-field flex-1" placeholder="Duration" value={med.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} required />
                {form.medicines.length > 1 && (
                  <button type="button" onClick={() => removeMed(i)} className="rounded-lg p-2 text-alert hover:bg-alert/10">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="button" onClick={addMed} className="text-sm text-teal hover:underline">
            + Add medicine
          </button>

          <textarea className="input-field" placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <button type="submit" className="btn-primary w-full">Create Prescription</button>
        </form>
      </Modal>
    </div>
  );
}
