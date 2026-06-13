import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { MedicalHistoryTimeline } from '../../components/MedicalHistoryTimeline';
import { Modal } from '../../components/shared/Modal';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function DoctorPatients() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [form, setForm] = useState({ diagnosis: '', notes: '' });

  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/appointments');
    return res.appointments || [];
  });

  const patients = useMemo(() => {
    const map = new Map();
    (data || []).forEach((apt) => {
      const p = apt.patientId;
      if (p?._id && !map.has(p._id)) map.set(p._id, p);
    });
    return [...map.values()];
  }, [data]);

  const openPatient = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    try {
      const { data: res } = await api.get(`/history/${patient._id}`);
      setHistory(res.history);
    } catch {
      setHistory({ records: [] });
    } finally {
      setHistoryLoading(false);
    }
  };

  const addRecord = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await api.post(`/history/${selectedPatient._id}`, form);
      setHistory(res.history);
      setForm({ diagnosis: '', notes: '' });
      toast.success('Medical record added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Patients</h1>

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => openPatient(p)}
              className="glass p-4 text-left transition hover:border-teal/40"
            >
              <p className="font-heading font-bold">{p.name}</p>
              <p className="text-sm text-white/50">{p.email}</p>
              <p className="text-xs text-teal mt-2">View history →</p>
            </button>
          ))}
          {!patients.length && <p className="text-white/50 col-span-full py-8 text-center">No patients yet.</p>}
        </div>
      )}

      <Modal
        open={!!selectedPatient}
        onClose={() => { setSelectedPatient(null); setHistory(null); }}
        title={selectedPatient?.name}
        size="lg"
      >
        {historyLoading ? (
          <ListSkeleton count={2} />
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <MedicalHistoryTimeline records={history?.records} />

            <form onSubmit={addRecord} className="border-t border-white/10 pt-4 space-y-3">
              <h3 className="font-heading font-bold text-sm">Add Record</h3>
              <input
                className="input-field"
                placeholder="Diagnosis"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                required
              />
              <textarea
                className="input-field"
                placeholder="Notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <button type="submit" className="btn-primary">Add to History</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
