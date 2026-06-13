import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export const PaymentUploadForm = ({ appointmentId, defaultAmount = 1500, onSuccess }) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!appointmentId) {
      toast.error('Appointment not found. Please book again.');
      return;
    }
    if (!screenshot) {
      toast.error('Please select a payment screenshot (JPEG or PNG)');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('appointmentId', String(appointmentId));
      fd.append('amount', String(amount));
      fd.append('screenshot', screenshot);

      await api.post('/payments', fd);
      toast.success('Payment submitted! Assistant will verify shortly.');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">
        Transfer the fee below, then upload your payment screenshot (JPEG/PNG, max 5MB).
      </p>
      <div>
        <label className="section-label mb-2 block">Amount (Rs.)</label>
        <input
          type="number"
          className="input-field"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="section-label mb-2 block">Payment screenshot</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="input-field"
          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Uploading...' : 'Submit Payment'}
      </button>
    </form>
  );
};
