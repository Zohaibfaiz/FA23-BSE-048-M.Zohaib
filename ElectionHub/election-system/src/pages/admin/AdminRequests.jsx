import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Users, Activity, ShieldAlert, CheckCircle, 
  Trash2, Search, Filter, Mail, Phone, 
  ExternalLink, Building, Briefcase 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('election_creator_requests')
        .select('*, profiles(full_name, email, phone)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status) => {
    if (status === 'rejected' && !rejectionReason) return toast.error("Please provide a rejection reason");
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('election_creator_requests')
        .update({ status, rejection_reason: status === 'rejected' ? rejectionReason : null })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // If approved, upgrade user role
      if (status === 'approved') {
        await supabase
          .from('profiles')
          .update({ role: 'election_creator' })
          .eq('id', selectedRequest.user_id);
        
        await supabase.from('notifications').insert({
          user_id: selectedRequest.user_id,
          type: 'creator_request',
          title: 'Creator Access Approved!',
          message: 'Your request to become an election creator has been approved. You can now host elections.',
          link: '/creator/dashboard'
        });
      } else {
        await supabase.from('notifications').insert({
          user_id: selectedRequest.user_id,
          type: 'creator_request',
          title: 'Creator Access Rejected',
          message: `Your request was rejected. Reason: ${rejectionReason}`,
          link: '/request-creator-access'
        });
      }

      await supabase.from('audit_logs').insert({
        action: `creator_request_${status}`,
        entity_type: 'user_role',
        entity_id: selectedRequest.user_id,
        details: { status, reason: rejectionReason }
      });

      toast.success(`Request ${status} successfully`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-textPrimary">Access Requests</h1>
        <p className="text-textSecondary">Review and verify organizational creator identities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request List */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-borderColor flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-textPrimary">Pending Queue</h2>
            <span className="bg-primaryGold/10 text-primaryGold text-xs font-bold px-3 py-1 rounded-full border border-primaryGold/20">
              {requests.filter(r => r.status === 'pending').length} Active
            </span>
          </div>
          <div className="divide-y divide-borderColor">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="p-12 animate-pulse bg-secondaryBg/20" />)
            ) : requests.length > 0 ? requests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={`p-6 cursor-pointer transition-all ${selectedRequest?.id === req.id ? 'bg-primaryGold/5 border-l-4 border-l-primaryGold' : 'hover:bg-secondaryBg/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondaryBg border border-borderColor flex items-center justify-center font-bold text-primaryGold">
                      {req.organization_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-textPrimary">{req.organization_name}</h4>
                      <p className="text-xs text-textSecondary">{req.profiles?.full_name}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${req.status === 'pending' ? 'text-warningOrange border-warningOrange/30' : req.status === 'approved' ? 'text-successGreen border-successGreen/30' : 'text-dangerRed border-dangerRed/30'}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-textMuted line-clamp-2 mt-3">{req.reason}</p>
                <div className="flex items-center gap-4 mt-4 text-[10px] text-textSecondary font-medium uppercase tracking-widest">
                  <span>{format(new Date(req.created_at), 'dd MMM yyyy')}</span>
                  <span>•</span>
                  <span>{req.profiles?.email}</span>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center">
                <CheckCircle className="mx-auto text-textMuted mb-4" size={48} />
                <p className="text-textSecondary">No pending creator requests found</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 space-y-8 sticky top-24"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold text-textPrimary">Verification Details</h3>
                <div className="space-y-2">
                  <DetailItem label="Full Name" value={selectedRequest.profiles?.full_name} icon={<Users size={14} />} />
                  <DetailItem label="Email" value={selectedRequest.profiles?.email} icon={<Mail size={14} />} />
                  <DetailItem label="Phone" value={selectedRequest.profiles?.phone || 'Not Provided'} icon={<Phone size={14} />} />
                  <DetailItem label="Organization" value={selectedRequest.organization_name} icon={<Building size={14} />} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Statement of Purpose</h4>
                <div className="p-4 bg-secondaryBg rounded-xl border border-borderColor italic text-sm text-textSecondary leading-relaxed">
                  "{selectedRequest.reason}"
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t border-borderColor">
                  <textarea 
                    placeholder="Enter rejection reason if applicable..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input-field min-h-[100px] text-xs"
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleDecision('rejected')} 
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-dangerRed/10 border border-dangerRed/20 text-dangerRed font-bold text-xs rounded-xl hover:bg-dangerRed hover:text-white transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleDecision('approved')} 
                      disabled={isProcessing}
                      className="flex-1 btn-primary py-3 text-xs"
                    >
                      Approve Access
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center border-dashed border-borderColor h-fit sticky top-24">
              <Activity className="mx-auto text-textMuted mb-4 opacity-20" size={64} />
              <p className="text-sm text-textMuted">Select a request from the queue to view details and perform verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between text-xs py-2 border-b border-borderColor last:border-0">
      <div className="flex items-center gap-2 text-textMuted uppercase font-bold tracking-tighter">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-textPrimary font-medium">{value}</span>
    </div>
  );
}
