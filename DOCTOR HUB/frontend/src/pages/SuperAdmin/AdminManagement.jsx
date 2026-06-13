import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { Modal } from '../../components/shared/Modal';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function AdminManagement() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const { data, loading, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/admin/users?role=admin');
    return res.users;
  });

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/admins', form);
      toast.success('Admin created');
      setShowForm(false);
      setForm({ name: '', email: '', password: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteAdmin = async (id) => {
    if (!confirm('Delete this admin account?')) return;
    try {
      await api.delete(`/admin/admins/${id}`);
      toast.success('Admin deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Admin Management</h1>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={18} /> Create Admin
        </button>
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : (
        <div className="space-y-3">
          {data?.map((admin) => (
            <div key={admin._id} className="glass flex items-center justify-between p-4">
              <div>
                <p className="font-heading font-bold">{admin.name}</p>
                <p className="text-sm text-white/50">{admin.email}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteAdmin(admin._id)}
                className="rounded-lg p-2 text-alert hover:bg-alert/10"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Admin">
        <form onSubmit={createAdmin} className="space-y-3">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </div>
  );
}
