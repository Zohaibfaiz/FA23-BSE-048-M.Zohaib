import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { PageHeader } from '../../components/shared/PageHeader';
import { PaymentUploadForm } from '../../components/PaymentUploadForm';

const STEPS = ['Clinic', 'Date & Slot', 'Payment', 'Done'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    clinicId: '',
    date: '',
    timeSlot: '',
  });
  const [appointmentId, setAppointmentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data, loading: doctorLoading, error: doctorError } = useFetch(
    async () => {
      const { data: res } = await api.get(`/doctors/${doctorId}`);
      return res;
    },
    [doctorId]
  );

  const doctor = data?.doctor;
  const clinics = data?.clinics || [];
  const doctorName = doctor?.userId?.name || 'Physician';

  const createAppointment = async () => {
    if (!form.clinicId || !form.date || !form.timeSlot) {
      toast.error('Please select clinic, date, and time slot');
      return;
    }

    setLoading(true);
    try {
      const { data: res } = await api.post('/appointments', {
        doctorId,
        clinicId: form.clinicId,
        date: form.date,
        timeSlot: form.timeSlot,
      });

      const id = res.appointment?._id;
      if (!id) {
        throw new Error('Appointment created but ID missing — please contact support');
      }

      setAppointmentId(id);
      setStep(2);
      toast.success('Appointment reserved — now submit payment');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Booking failed';
      toast.error(msg);
      if (msg.includes('not available') || msg.includes('not approved')) {
        toast.error('This doctor is awaiting admin approval. Try another doctor.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (doctorLoading) {
    return <p className="text-muted">Loading doctor details...</p>;
  }

  if (doctorError || !doctor) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-[var(--color-alert)]">{doctorError || 'Doctor not found'}</p>
        <button type="button" onClick={() => navigate('/patient/doctors')} className="btn-primary mt-4">
          Back to doctors
        </button>
      </div>
    );
  }

  if (!doctor.isApproved) {
    return (
      <div className="glass p-8 text-center">
        <p className="font-display text-xl font-semibold">Doctor not yet verified</p>
        <p className="mt-2 text-muted">
          Dr. {doctorName} is pending admin approval. Please choose another physician.
        </p>
        <button type="button" onClick={() => navigate('/patient/doctors')} className="btn-primary mt-6">
          Find other doctors
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        label="Reservation"
        title={`Book with Dr. ${doctorName}`}
        description="Complete all steps. After payment upload, an assistant will verify and confirm your visit."
      />

      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 py-2 text-center text-xs font-medium tracking-wide ${
              i <= step
                ? 'bg-[var(--color-brass)] text-[var(--color-ink)]'
                : 'border border-[var(--color-brass)]/20 text-muted'
            }`}
            style={{ borderRadius: '2px 10px 2px 10px' }}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="glass p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-muted">Select a clinic</p>
              {clinics.length === 0 ? (
                <p className="text-[var(--color-alert)] text-sm">
                  No clinics registered for this doctor yet.
                </p>
              ) : (
                clinics.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setForm({ ...form, clinicId: c._id })}
                    className={`w-full border p-4 text-left transition ${
                      form.clinicId === c._id
                        ? 'border-[var(--color-brass)] bg-[var(--color-brass)]/10'
                        : 'border-[var(--color-brass)]/20 hover:border-[var(--color-brass)]/40'
                    }`}
                    style={{ borderRadius: '2px 12px 2px 12px' }}
                  >
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted">{c.city}</p>
                  </button>
                ))
              )}
              <button
                type="button"
                disabled={!form.clinicId}
                onClick={() => setStep(1)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="section-label mb-2 block">Appointment date</label>
                <input
                  type="date"
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="section-label mb-2 block">Time slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm({ ...form, timeSlot: slot })}
                      className={`py-2.5 text-sm font-medium transition ${
                        form.timeSlot === slot
                          ? 'bg-[var(--color-brass)] text-[var(--color-ink)]'
                          : 'border border-[var(--color-brass)]/20 text-muted hover:border-[var(--color-brass)]/50'
                      }`}
                      style={{ borderRadius: '2px 10px 2px 10px' }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={!form.date || !form.timeSlot || loading}
                onClick={createAppointment}
                className="btn-primary w-full"
              >
                {loading ? 'Reserving slot...' : 'Reserve & continue to payment'}
              </button>
            </motion.div>
          )}

          {step === 2 && appointmentId && (
            <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mb-4 rounded-sm border border-[var(--color-sage)]/30 bg-[var(--color-sage)]/10 px-3 py-2 text-sm text-[var(--color-sage-glow)]">
                Reference: <span className="font-mono text-xs">{appointmentId}</span>
              </p>
              <PaymentUploadForm
                appointmentId={appointmentId}
                onSuccess={() => setStep(3)}
              />
            </motion.div>
          )}

          {step === 2 && !appointmentId && (
            <motion.div key="2err" className="text-center py-6">
              <p className="text-[var(--color-alert)]">No appointment ID. Please go back and reserve a slot.</p>
              <button type="button" onClick={() => setStep(1)} className="btn-ghost mt-4">
                Back to date & slot
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <p className="text-5xl mb-4">✓</p>
              <h2 className="font-display text-2xl font-semibold">Payment submitted</h2>
              <p className="mt-3 text-muted max-w-sm mx-auto">
                Your appointment is <strong className="text-[var(--color-brass-light)]">pending verification</strong>.
                Once the clinic assistant approves payment, status will change to{' '}
                <strong className="text-[var(--color-sage-glow)]">confirmed</strong>.
              </p>
              <button
                type="button"
                onClick={() => navigate('/patient/appointments')}
                className="btn-primary mt-8"
              >
                View my appointments
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
