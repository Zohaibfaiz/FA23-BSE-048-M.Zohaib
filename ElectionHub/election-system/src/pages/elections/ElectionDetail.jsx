import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Calendar, Users, Shield, ArrowLeft, Loader2, 
  CheckCircle, Vote, Info, AlertTriangle, Key 
} from 'lucide-react';
import { format } from 'date-fns';
import CryptoJS from 'crypto-js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Registration Flow
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Voting Flow
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [secretIdInput, setSecretIdInput] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Realtime subscription for votes
    const voteSub = supabase
      .channel(`results-${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'candidates', 
        filter: `election_id=eq.${id}` 
      }, (payload) => {
        setCandidates(current => 
          current.map(c => c.id === payload.new.id ? { ...c, vote_count: payload.new.vote_count } : c)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(voteSub);
    };
  }, [id, user]);

  const fetchData = async () => {
    try {
      const [elRes, candRes] = await Promise.all([
        supabase.from('elections').select('*, profiles(full_name)').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id).order('vote_count', { ascending: false })
      ]);

      if (elRes.error) throw elRes.error;
      setElection(elRes.data);
      setCandidates(candRes.data || []);

      if (user) {
        const { data: regData } = await supabase
          .from('voter_registrations')
          .select('*')
          .eq('election_id', id)
          .eq('voter_id', user.id)
          .maybeSingle();
        setRegistration(regData);
      }
    } catch (err) {
      toast.error("Could not fetch election details");
      navigate('/voter/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) return navigate('/login');
    setIsRegistering(true);
    
    try {
      // 1. Generate Secret ID
      const secret = `POLL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const hash = CryptoJS.SHA256(secret).toString();

      // 2. Insert Registration
      const { error } = await supabase
        .from('voter_registrations')
        .insert({
          election_id: id,
          voter_id: user.id,
          secret_id_hash: hash
        });

      if (error) throw error;

      // 3. Insert Notification for the user
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'voter_id',
        title: 'Registration Successful',
        message: `Your secret ID for ${election.title} is: ${secret}. KEEP THIS SAFE.`,
        link: `/elections/${id}`
      });

      toast.success("Successfully registered! Check notifications for your ID.", { duration: 6000 });
      fetchData();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const castVote = async () => {
    if (!secretIdInput) return toast.error("Please enter your secret ID");
    setIsVoting(true);

    try {
      const inputHash = CryptoJS.SHA256(secretIdInput).toString();

      // 1. Verify Hash matches registration
      if (inputHash !== registration.secret_id_hash) {
        throw new Error("Invalid Secret Voter ID");
      }

      // 2. Check if already voted (redundant but safe)
      if (registration.has_voted) {
        throw new Error("You have already cast your vote");
      }

      // 3. Insert Anonymous Vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          election_id: id,
          candidate_id: selectedCandidate.id,
          secret_id_hash: inputHash
        });

      if (voteError) {
        if (voteError.code === '23505') throw new Error("This ID has already been used to vote");
        throw voteError;
      }

      // 4. Update Registration Status
      await supabase
        .from('voter_registrations')
        .update({ has_voted: true })
        .eq('id', registration.id);

      // 5. Log Audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'vote_cast',
        entity_type: 'election',
        entity_id: id,
        details: { candidate: selectedCandidate.name }
      });

      toast.success("Vote submitted successfully!", { icon: '🗳️' });
      setShowVoteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-primaryBg"><Loader2 className="animate-spin text-primaryGold" size={48} /></div>;

  const isActive = election.status === 'active';
  const isCompleted = election.status === 'completed';
  const canVote = isActive && registration && !registration.has_voted;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-secondaryBg rounded-full border border-borderColor hover:border-primaryGold transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-textPrimary">{election.title}</h1>
          <div className="flex items-center gap-2 text-textSecondary text-sm">
            <Users size={14} className="text-primaryGold" />
            <span>Created by {election.profiles?.full_name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Voting */}
        <div className="lg:col-span-2 space-y-8">
          {/* Election Banner/Header */}
          <div className="glass-card overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-primaryGold/20 to-goldHover/20 relative">
              {election.banner_url && <img src={election.banner_url} className="w-full h-full object-cover opacity-50" alt="" />}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex gap-2 mb-2">
                  <span className="px-3 py-1 bg-primaryGold text-primaryBg font-bold text-[10px] uppercase rounded-full">Secure</span>
                  <span className={`px-3 py-1 font-bold text-[10px] uppercase rounded-full border ${isActive ? 'bg-successGreen/20 text-successGreen border-successGreen/40' : 'bg-secondaryBg text-textSecondary border-borderColor'}`}>
                    {election.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-textSecondary leading-relaxed text-lg">{election.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-borderColor">
                <InfoItem icon={<Calendar className="text-primaryGold" />} label="Start Date" value={format(new Date(election.start_date), 'PPP')} />
                <InfoItem icon={<Clock className="text-dangerRed" />} label="End Date" value={format(new Date(election.end_date), 'PPP')} />
                <InfoItem icon={<Shield className="text-successGreen" />} label="Reg. Deadline" value={format(new Date(election.registration_deadline), 'PPP')} />
              </div>
            </div>
          </div>

          {/* Candidates Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-textPrimary flex items-center gap-2">
              <Users className="text-primaryGold" />
              <span>Candidates</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map(cand => (
                <motion.div 
                  key={cand.id}
                  whileHover={canVote ? { y: -5 } : {}}
                  onClick={() => canVote && setSelectedCandidate(cand)}
                  className={`glass-card p-6 border-2 transition-all relative ${canVote ? 'cursor-pointer' : 'cursor-default'} ${selectedCandidate?.id === cand.id ? 'border-primaryGold' : 'border-transparent'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondaryBg border border-borderColor overflow-hidden flex-shrink-0">
                      {cand.photo_url ? <img src={cand.photo_url} className="w-full h-full object-cover" alt="" /> : <Users className="w-full h-full p-4 text-textMuted" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-textPrimary text-xl">{cand.name}</h3>
                      <p className="text-primaryGold text-sm font-medium mb-2">{cand.designation}</p>
                      <p className="text-textSecondary text-sm line-clamp-3">{cand.manifesto}</p>
                    </div>
                  </div>
                  {canVote && (
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCandidate?.id === cand.id ? 'bg-primaryGold border-primaryGold' : 'border-borderColor'}`}>
                      {selectedCandidate?.id === cand.id && <CheckCircle size={14} className="text-primaryBg" />}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Realtime Results */}
        <div className="space-y-8">
          {/* Action Card */}
          <div className="glass-card p-6 space-y-6 sticky top-24">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-textPrimary">Your Status</h3>
              {!user ? (
                <div className="p-4 bg-secondaryBg border border-borderColor rounded-xl text-center">
                  <p className="text-sm text-textSecondary mb-4">You must be logged in to participate</p>
                  <button onClick={() => navigate('/login')} className="btn-primary w-full">Sign In</button>
                </div>
              ) : registration ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-successGreen/10 border border-successGreen/20 rounded-lg">
                    <span className="text-xs font-bold text-successGreen uppercase">Registered</span>
                    <CheckCircle size={16} className="text-successGreen" />
                  </div>
                  {registration.has_voted ? (
                    <div className="p-4 bg-primaryGold/10 border border-primaryGold/20 rounded-xl text-center">
                      <Vote className="mx-auto text-primaryGold mb-2" size={32} />
                      <p className="text-sm font-bold text-textPrimary">Vote Cast Successfully</p>
                      <p className="text-[10px] text-textSecondary mt-1 uppercase tracking-widest">Anonymous Receipt Logged</p>
                    </div>
                  ) : isActive ? (
                    <button 
                      onClick={() => selectedCandidate ? setShowVoteModal(true) : toast.error("Select a candidate first")}
                      className="btn-primary w-full py-4 text-lg font-heading"
                    >
                      Cast Secure Vote
                    </button>
                  ) : (
                    <div className="p-4 bg-secondaryBg border border-borderColor rounded-xl text-center">
                      <Clock size={24} className="mx-auto text-textMuted mb-2" />
                      <p className="text-sm text-textSecondary">Voting is not currently active</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-secondaryBg border border-borderColor rounded-xl text-center">
                  <AlertTriangle className="mx-auto text-warningOrange mb-2" size={24} />
                  <p className="text-sm text-textSecondary mb-4">You are not registered for this election</p>
                  <button 
                    onClick={handleRegister} 
                    disabled={isRegistering}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isRegistering ? <Loader2 className="animate-spin" size={18} /> : "Join Election"}
                  </button>
                </div>
              )}
            </div>

            {/* Turnout Stats */}
            <div className="pt-6 border-t border-borderColor space-y-4">
              <h3 className="text-sm font-bold text-textSecondary uppercase tracking-widest">Turnout Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-textMuted">Total Votes Cast</span>
                  <span className="text-textPrimary font-bold">{election.total_votes}</span>
                </div>
                <div className="w-full bg-secondaryBg h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(election.total_votes / election.max_voters) * 100}%` }}
                    className="h-full bg-primaryGold"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-textMuted">
                  <span>Capacity</span>
                  <span>{election.max_voters} Voters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Card */}
          {(isCompleted || profile?.role === 'super_admin' || user?.id === election.creator_id) && (
            <div className="glass-card p-6 space-y-6">
              <h3 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                <BarChart3 size={20} className="text-primaryGold" />
                Live Results
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={candidates}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151515', borderColor: '#1F1F1F', borderRadius: '8px' }}
                      itemStyle={{ color: '#C9A84C' }}
                    />
                    <Bar dataKey="vote_count" radius={[4,4,0,0]}>
                      {candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#C9A84C' : '#1F1F1F'} stroke={index === 0 ? '#F0D77A' : 'none'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {candidates.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <span className={`text-sm ${i === 0 ? 'text-primaryGold font-bold' : 'text-textSecondary'}`}>
                      {i + 1}. {c.name}
                    </span>
                    <span className="text-xs font-mono text-textMuted">{c.vote_count} ({((c.vote_count / (election.total_votes || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vote Confirmation Modal */}
      <AnimatePresence>
        {showVoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isVoting && setShowVoteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10"
            >
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-primaryGold/10 rounded-full flex items-center justify-center mx-auto border border-primaryGold/20">
                  <Shield className="text-primaryGold" size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold text-textPrimary">Confirm Your Choice</h3>
                <p className="text-textSecondary">
                  You are voting for <span className="text-primaryGold font-bold">{selectedCandidate?.name}</span>. This action is encrypted and irreversible.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} />
                    Enter Secret Voter ID
                  </label>
                  <input 
                    type="password"
                    placeholder="POLL-XXXX-XXXX"
                    value={secretIdInput}
                    onChange={(e) => setSecretIdInput(e.target.value.toUpperCase())}
                    className="input-field text-center font-mono text-xl tracking-[0.2em] placeholder:tracking-normal placeholder:text-sm"
                    disabled={isVoting}
                  />
                  <p className="text-[10px] text-textMuted text-center">Your ID was sent to your notifications during registration.</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    disabled={isVoting}
                    onClick={() => setShowVoteModal(false)} 
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isVoting || !secretIdInput}
                    onClick={castVote}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {isVoting ? <Loader2 className="animate-spin" size={20} /> : "Submit Ballot"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-textMuted uppercase tracking-wider font-bold">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium text-textPrimary">{value}</p>
    </div>
  );
}
