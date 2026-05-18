import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Vote, Calendar, Clock, ChevronRight, 
  Search, Bell, Filter, Grid, List 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function VoterDashboard() {
  const { user, profile, notifications, unreadCount } = useAuth();
  const [elections, setElections] = useState({ active: [], joined: [], recommended: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchVoterData();
  }, [user]);

  const fetchVoterData = async () => {
    try {
      // 1. Fetch Active Elections
      const { data: activeData } = await supabase
        .from('elections')
        .select('*, profiles(full_name)')
        .eq('status', 'active')
        .order('end_date', { ascending: true });

      // 2. Fetch My Joined Elections
      const { data: joinedData } = await supabase
        .from('voter_registrations')
        .select('*, elections(*, profiles(full_name))')
        .eq('voter_id', user.id);

      setElections({
        active: activeData || [],
        joined: joinedData?.map(j => j.elections) || [],
        recommended: activeData?.slice(0, 3) || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Welcome Banner */}
      <div className="relative glass-card p-8 md:p-12 overflow-hidden bg-gradient-to-br from-primaryGold/10 via-secondaryBg to-secondaryBg border-primaryGold/20">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary leading-tight">
            Ready to <span className="text-primaryGold">Make an Impact</span>, {profile?.full_name.split(' ')[0]}?
          </h1>
          <p className="text-textSecondary text-lg">Browse active elections, verify your identity, and cast your secure ballot in minutes.</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="btn-primary px-8 py-3">Explore Active Elections</button>
            <Link to="/profile" className="btn-secondary px-8 py-3">Identity Settings</Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-1/4">
          <Vote size={400} className="text-primaryGold" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between border-b border-borderColor pb-4">
            <div className="flex items-center gap-8">
              <button onClick={() => setFilter('all')} className={`text-sm font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'text-primaryGold border-b-2 border-primaryGold pb-4 mb-[-17px]' : 'text-textMuted hover:text-textPrimary'}`}>All Elections</button>
              <button onClick={() => setFilter('joined')} className={`text-sm font-bold uppercase tracking-widest transition-all ${filter === 'joined' ? 'text-primaryGold border-b-2 border-primaryGold pb-4 mb-[-17px]' : 'text-textMuted hover:text-textPrimary'}`}>My Registrations</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <input type="text" placeholder="Search..." className="bg-secondaryBg/50 border border-borderColor rounded-full pl-10 pr-4 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primaryGold w-48" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-secondaryBg/50" />)
            ) : (filter === 'all' ? elections.active : elections.joined).map((el, i) => (
              <motion.div 
                key={el.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card group overflow-hidden border-borderColor hover:border-primaryGold/50 transition-all duration-500"
              >
                <div className="h-32 bg-secondaryBg relative overflow-hidden">
                  {el.banner_url && <img src={el.banner_url} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-cardBg to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <span className="px-3 py-1 bg-primaryGold/20 text-primaryGold text-[10px] font-bold uppercase rounded-full border border-primaryGold/30 backdrop-blur-md">
                      {el.category_id || 'General'}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-heading font-bold text-textPrimary group-hover:text-primaryGold transition-colors">{el.title}</h3>
                  <div className="flex items-center justify-between text-xs text-textSecondary">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-textMuted" />
                      <span>Ends {format(new Date(el.end_date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-textMuted" />
                      <span>{el.total_votes} Voted</span>
                    </div>
                  </div>
                  <Link to={`/elections/${el.id}`} className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                    <span>{filter === 'joined' ? 'View Participation' : 'Participate Now'}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Notifications Side Panel */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-borderColor flex items-center justify-between bg-secondaryBg/30">
              <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                <Bell size={16} className="text-primaryGold" />
                Alerts
              </h3>
              {unreadCount > 0 && <span className="bg-primaryGold text-primaryBg text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-borderColor">
              {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`p-4 hover:bg-secondaryBg/50 transition-colors ${!n.is_read ? 'bg-primaryGold/5' : ''}`}>
                  <p className="text-xs font-bold text-textPrimary mb-1">{n.title}</p>
                  <p className="text-[10px] text-textSecondary leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-textMuted mt-2 block">{format(new Date(n.created_at), 'HH:mm • dd MMM')}</span>
                </div>
              )) : (
                <div className="p-8 text-center text-textMuted text-xs italic">No notifications yet</div>
              )}
            </div>
            <button className="w-full py-3 bg-secondaryBg text-[10px] font-bold text-textSecondary hover:text-primaryGold transition-colors border-t border-borderColor uppercase tracking-widest">
              View All Alerts
            </button>
          </div>

          {/* Quick Info Card */}
          <div className="glass-card p-6 bg-gradient-to-br from-secondaryBg to-cardBg border-borderColor relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <Shield className="text-successGreen mb-2" size={24} />
              <h3 className="text-sm font-bold text-textPrimary">Your Identity is Secure</h3>
              <p className="text-[10px] text-textSecondary leading-relaxed">SecureVote Pro uses SHA256 hashing and zero-knowledge proof concepts to ensure your vote is never linked to your profile.</p>
              <button className="text-[10px] font-bold text-primaryGold hover:underline">Learn about encryption</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
