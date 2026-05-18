import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Plus, Calendar, Users, Activity, BarChart3, 
  Settings, ExternalLink, Trash2, Eye, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    turnout: 0
  });
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCreatorData();
  }, [user]);

  const fetchCreatorData = async () => {
    try {
      const { data: elData, error: elError } = await supabase
        .from('elections')
        .select(`
          *,
          candidates(vote_count),
          voter_registrations(count)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (elError) throw elError;

      setElections(elData);
      
      const total = elData.length;
      const active = elData.filter(e => e.status === 'active').length;
      const completed = elData.filter(e => e.status === 'completed').length;
      
      setStats({ total, active, completed, turnout: 0 });
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-successGreen/20 text-successGreen border-successGreen/30';
      case 'published': return 'bg-primaryGold/20 text-primaryGold border-primaryGold/30';
      case 'draft': return 'bg-secondaryBg text-textSecondary border-borderColor';
      case 'completed': return 'bg-textMuted/20 text-textMuted border-borderColor';
      default: return 'bg-secondaryBg text-textSecondary';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-textPrimary">Creator Console</h1>
          <p className="text-textSecondary">Manage your secure organizational elections</p>
        </div>
        <Link to="/creator/elections/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Create New Election</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Elections" value={stats.total} icon={<Activity className="text-textSecondary" />} />
        <StatCard title="Active Now" value={stats.active} icon={<Activity className="text-successGreen" />} />
        <StatCard title="Completed" value={stats.completed} icon={<Clock className="text-textMuted" />} />
        <StatCard title="Avg Turnout" value="--" icon={<BarChart3 className="text-primaryGold" />} />
      </div>

      {/* Recent Elections Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-borderColor flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-textPrimary">Your Elections</h2>
          <div className="flex gap-2">
            <button className="text-xs font-medium text-textSecondary hover:text-primaryGold px-3 py-1.5 border border-borderColor rounded-md transition-colors">Export Turnout CSV</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondaryBg/50 text-textSecondary border-b border-borderColor">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Election</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Voters</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {loading ? (
                [1,2,3].map(i => <SkeletonRow key={i} />)
              ) : elections.length > 0 ? (
                elections.map((el) => (
                  <motion.tr 
                    key={el.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-secondaryBg/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondaryBg flex items-center justify-center border border-borderColor overflow-hidden">
                          {el.banner_url ? (
                            <img src={el.banner_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Users className="text-textMuted" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-textPrimary">{el.title}</p>
                          <p className="text-xs text-textMuted">ID: {el.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-textSecondary">
                          <Calendar size={12} className="mr-1 text-primaryGold" />
                          {format(new Date(el.start_date), 'MMM dd')}
                        </div>
                        <div className="flex items-center text-xs text-textSecondary">
                          <Clock size={12} className="mr-1 text-textMuted" />
                          Ends {format(new Date(el.end_date), 'HH:mm')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(el.status)}`}>
                        {el.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-textPrimary font-medium">{el.total_votes} <span className="text-textMuted font-normal">/ {el.max_voters}</span></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/elections/${el.id}`} className="p-2 text-textSecondary hover:text-primaryGold transition-colors" title="View Results">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/creator/elections/${el.id}/edit`} className="p-2 text-textSecondary hover:text-primaryGold transition-colors">
                          <Settings size={18} />
                        </Link>
                        <button className="p-2 text-textSecondary hover:text-dangerRed transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-textMuted font-medium">
                    You haven't created any elections yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="glass-card p-6 border-b-2 border-b-transparent hover:border-b-primaryGold transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-textSecondary">{title}</span>
        <div className="p-2 bg-secondaryBg rounded-lg border border-borderColor">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-heading font-bold text-textPrimary">{value}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-10 bg-secondaryBg rounded-lg w-full"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-secondaryBg rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-secondaryBg rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-secondaryBg rounded w-12"></div></td>
      <td className="px-6 py-4"><div className="h-10 bg-secondaryBg rounded w-20 ml-auto"></div></td>
    </tr>
  );
}
