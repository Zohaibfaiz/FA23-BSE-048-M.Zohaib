import { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from './shared/Modal';
import { formatDate } from '../utils/formatDate';

export const PaymentVerifier = ({ payment, onVerify }) => {
  const [zoom, setZoom] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [note, setNote] = useState('');

  const apt = payment?.appointmentId;

  const submit = (status) => {
    onVerify(payment._id, status, note);
    setConfirm(null);
    setNote('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass p-5 space-y-3">
        <h3 className="font-heading font-bold">Appointment Details</h3>
        <p><span className="text-white/50">Patient:</span> {apt?.patientId?.name}</p>
        <p><span className="text-white/50">Doctor:</span> {apt?.doctorId?.userId?.name}</p>
        <p><span className="text-white/50">Clinic:</span> {apt?.clinicId?.name}</p>
        <p><span className="text-white/50">Date:</span> {formatDate(apt?.date)} - {apt?.timeSlot}</p>
        <p><span className="text-white/50">Amount:</span> Rs. {payment?.amount}</p>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => setConfirm('verified')} className="btn-primary flex-1 bg-success text-navy">
            Verify Payment
          </button>
          <button type="button" onClick={() => setConfirm('rejected')} className="flex-1 rounded-xl border border-alert py-2.5 text-alert">
            Reject
          </button>
        </div>
      </div>

      <div className="glass p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading font-bold">Payment Screenshot</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="rounded-lg p-2 hover:bg-white/10">
              <ZoomOut size={18} />
            </button>
            <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="rounded-lg p-2 hover:bg-white/10">
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-auto rounded-xl bg-black/30 max-h-[400px]">
          <img
            src={payment?.screenshot}
            alt="Payment proof"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            className="max-w-full transition-transform"
          />
        </div>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm === 'verified' ? 'Verify Payment?' : 'Reject Payment?'}
      >
        <textarea
          className="input-field mb-4"
          placeholder="Optional note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirm(null)} className="btn-ghost flex-1">Cancel</button>
          <button
            type="button"
            onClick={() => submit(confirm)}
            className={`flex-1 rounded-xl py-2.5 font-semibold ${
              confirm === 'verified' ? 'bg-success text-navy' : 'bg-alert text-white'
            }`}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};
