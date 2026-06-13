import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import api from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import { ListSkeleton } from '../../components/shared/Skeleton';
import { TREATMENT_COLORS } from '../../utils/constants';

export default function ManageDoctors() {
  const { data, loading, refetch } = useFetch(async () => {
    const { data: res } = await api.get('/admin/doctors');
    return res.doctors;
  });

  const updateDoctor = async (userId, isVerified, isActive = true) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isVerified, isActive });
      toast.success(isVerified ? 'Doctor approved' : 'Doctor suspended');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Manage Doctors</h1>

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-3">
          {data?.map((doc) => {
            const user = doc.userId;
            return (
              <div key={doc._id} className="glass flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'D')}&background=06D6A0&color=0A1628`}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-heading font-bold flex items-center gap-2">
                      {user?.name}
                      {doc.isApproved && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Shield size={14} /> Verified
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-white/50">{doc.specialization}</p>
                    <span className={`mt-1 inline-block rounded-lg border px-2 py-0.5 text-xs capitalize ${TREATMENT_COLORS[doc.treatmentType]}`}>
                      {doc.treatmentType}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!doc.isApproved && (
                    <button
                      type="button"
                      onClick={() => updateDoctor(user._id, true)}
                      className="flex items-center gap-1 rounded-xl bg-success/20 px-3 py-2 text-sm text-success hover:bg-success/30"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateDoctor(user._id, doc.isApproved, !user.isActive)}
                    className="flex items-center gap-1 rounded-xl bg-alert/20 px-3 py-2 text-sm text-alert hover:bg-alert/30"
                  >
                    <XCircle size={16} /> {user.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
