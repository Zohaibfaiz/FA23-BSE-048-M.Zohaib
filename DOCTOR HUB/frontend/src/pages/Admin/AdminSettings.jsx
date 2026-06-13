import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';

export default function AdminSettings() {
  const [form, setForm] = useState({ title: '', message: '', role: '' });

  const { data, loading } = useFetch(async () => {
    try {
      const { data: res } = await api.get('/admin/users?limit=1');
      return res;
    } catch {
      return null;
    }
  });

  const broadcast = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications', {
        title: form.title,
        message: form.message,
        role: form.role || undefined,
      });
      toast.success('Notification broadcast sent');
      setForm({ title: '', message: '', role: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-heading text-3xl font-bold">Settings</h1>

      <form onSubmit={broadcast} className="glass p-6 space-y-4">
        <h2 className="font-heading font-bold">Broadcast Notification</h2>
        <input
          className="input-field"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="input-field"
          placeholder="Message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <select
          className="input-field"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="">All users</option>
          <option value="patient">Patients only</option>
          <option value="doctor">Doctors only</option>
          <option value="assistant">Assistants only</option>
        </select>
        <button type="submit" className="btn-primary w-full">Send Broadcast</button>
      </form>

      {!loading && data && (
        <p className="text-sm text-white/40">Platform has {data.total} registered users.</p>
      )}
    </div>
  );
}
