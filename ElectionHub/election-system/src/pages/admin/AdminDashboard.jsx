import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, Activity, ShieldAlert, CheckCircle, 
  XCircle, Globe, Zap, Search, ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    elections: 0,
    votes: 0,
    pendingRequests: 0,
    securityEvents: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    
    // Subscribe to global activity
    const activitySub = supabase
      .channel('admin-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setActivity(prev => [payload.new, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => supabase.removeChannel(activitySub);
  }, []);

  const fetchAdminStats = async () => {
    try {
      const [uCount, eCount, rCount, logs] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('elections').select('*', { count: 'exact', head: true }),
        supabase.from('election_creator_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('audit_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(10)
      ]);

      setStats({
        users: uCount.count || 0,
        elections: eCount.count || 0,
        votes: 0, // In real world, sum of election.total_votes
        pendingRequests: rCount.count || 0,
        securityEvents: 0
      });
      setActivity(logs.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-bold text-textPrimary flex items-center gap-3">
            <Zap className="text-primaryGold fill-primaryGold" size={32} />
            Global Control
          </h1>
          <p className="text-textSecondary">Real-time platform monitoring and management</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary px-6">System Health</button>
          <button className="btn-primary px-6">Security Audit</button>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatCard label="Total Platform Users" value={stats.users} change="+12%" icon={<Users />} />
        <AdminStatCard label="Elections Hosted" value={stats.elections} change="+5" icon={<Globe />} />
        <AdminStatCard label="Total Votes Verified" value="--" change="0%" icon={<CheckCircle />} />
        <AdminStatCard label="Critical Alerts" value={stats.securityEvents} change="Stable" icon={<ShieldAlert className="text-dangerRed" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card overflow-hidden h-fit">
          <div className="p-6 border-b border-borderColor flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-textPrimary">Live Activity Feed</h2>
            <div className="flex items-center gap-2 text-successGreen text-xs font-bold animate-pulse">
              <span className="w-2 h-2 bg-successGreen rounded-full"></span>
              REALTIME
            </div>
          </div>
          <div className="divide-y divide-borderColor">
            {activity.map((log, i) => (
              <motion.div 
                key={log.id} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 hover:bg-secondaryBg/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondaryBg border border-borderColor flex items-center justify-center">
                    <Activity size={14} className="text-textMuted" />
                  </div>
                  <div>
                    <p className="text-sm text-textPrimary">
                      <span className="font-bold">{log.profiles?.full_name || 'System'}</span> 
                      <span className="text-textSecondary mx-1">{log.action.replace('_', ' ')}</span>
                      <span className="text-primaryGold font-medium">{log.entity_type}</span>
                    </p>
                    <p className="text-[10px] text-textMuted font-mono">{format(new Date(log.created_at), 'HH:mm:ss')} • {log.ip_address || 'Internal'}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-textMuted" />
              </motion.div>
            ))}
          </div>
          <button className="w-full py-4 bg-secondaryBg/50 text-textSecondary text-xs font-bold hover:text-primaryGold transition-colors border-t border-borderColor uppercase tracking-widest">
            View All Audit Logs
          </button>
        </div>

        {/* Request Side Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-textPrimary mb-6">Pending Creator Requests</h3>
            <div className="space-y-4">
              {stats.pendingRequests > 0 ? (
                <div className="p-4 bg-warningOrange/10 border border-warningOrange/20 rounded-xl">
                  <p className="text-sm font-bold text-warningOrange mb-1">{stats.pendingRequests} New Requests</p>
                  <p className="text-xs text-textSecondary mb-4">Organizations are waiting for identity verification.</p>
                  <button className="btn-primary w-full py-2 text-xs">Review Queue</button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-textMuted mb-2" size={32} />
                  <p className="text-xs text-textSecondary">No pending requests</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
              <ShieldAlert size={20} className="text-dangerRed" />
              Security Status
            </h3>
            <div className="space-y-4">
              <SecurityItem label="Identity Service" status="Operational" />
              <SecurityItem label="SHA256 Validator" status="Operational" />
              <SecurityItem label="Realtime Cluster" status="Optimal" />
              <SecurityItem label="Database Firewall" status="Locked" color="text-successGreen" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, change, icon }) {
  return (
    <div className="glass-card p-6 space-y-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-heading font-bold text-textPrimary">{value}</h4>
        <span className="text-[10px] font-bold text-successGreen px-2 py-1 bg-successGreen/10 rounded-md">
          {change}
        </span>
      </div>
    </div>
  );
}

function SecurityItem({ label, status, color = "text-textPrimary" }) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondaryBg/50 rounded-lg border border-borderColor">
      <span className="text-xs text-textSecondary">{label}</span>
      <span className={`text-[10px] font-bold uppercase ${color}`}>{status}</span>
    </div>
  );
}
