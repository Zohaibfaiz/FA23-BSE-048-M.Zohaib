import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, ChevronLeft, Calendar, 
  Users, Image as ImageIcon, Plus, 
  Trash2, ShieldCheck, Clock, Save, 
  Globe, Info 
} from 'lucide-react';

export default function NewElection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: null,
    registration_deadline: '',
    start_date: '',
    end_date: '',
    max_voters: 1000,
    allow_waitlist: true,
    is_anonymous: true
  });

  const [candidates, setCandidates] = useState([
    { name: '', designation: '', manifesto: '', photo_url: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCandidateChange = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const addCandidate = () => setCandidates([...candidates, { name: '', designation: '', manifesto: '', photo_url: '' }]);
  const removeCandidate = (index) => setCandidates(candidates.filter((_, i) => i !== index));

  const createElection = async (status = 'draft') => {
    if (!formData.title) return toast.error("Election title is required");
    setLoading(true);

    try {
      // 1. Create Election
      const { data: election, error: elError } = await supabase
        .from('elections')
        .insert({
          ...formData,
          creator_id: user.id,
          status,
          slug: `${formData.title.toLowerCase().replace(/ /g, '-')}-${Date.now()}`
        })
        .select()
        .single();

      if (elError) throw elError;

      // 2. Insert Candidates
      const candidatesWithId = candidates.map(c => ({ ...c, election_id: election.id }));
      const { error: candError } = await supabase.from('candidates').insert(candidatesWithId);
      
      if (candError) throw candError;

      // 3. Log Activity
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'create_election',
        entity_type: 'election',
        entity_id: election.id,
        details: { status }
      });

      toast.success(status === 'published' ? "Election published live!" : "Draft saved successfully");
      navigate('/creator/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-12">
        <StepIcon step={1} current={step} label="Basic Info" />
        <div className="flex-1 h-[2px] bg-borderColor mx-4 mb-6" />
        <StepIcon step={2} current={step} label="Timeline" />
        <div className="flex-1 h-[2px] bg-borderColor mx-4 mb-6" />
        <StepIcon step={3} current={step} label="Candidates" />
        <div className="flex-1 h-[2px] bg-borderColor mx-4 mb-6" />
        <StepIcon step={4} current={step} label="Review" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-borderColor bg-secondaryBg/30">
          <h2 className="text-2xl font-heading font-bold text-textPrimary">
            {step === 1 && "Start with the basics"}
            {step === 2 && "Define the timeline"}
            {step === 3 && "Add your candidates"}
            {step === 4 && "Finalize & Launch"}
          </h2>
          <p className="text-textSecondary text-sm">SecureVote Pro ensures every parameter is cryptographically verifiable.</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <FormGroup label="Election Title" description="Clear name for voters to identify the poll">
                  <input name="title" value={formData.title} onChange={handleInputChange} className="input-field" placeholder="e.g. Annual Executive Board Election 2024" />
                </FormGroup>
                <FormGroup label="Description" description="Provide context and voting instructions">
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field min-h-[150px]" placeholder="Tell voters why this election is happening..." />
                </FormGroup>
                <div className="grid grid-cols-2 gap-6">
                  <FormGroup label="Category">
                    <select name="category_id" onChange={handleInputChange} className="input-field">
                      <option value="">Select Category</option>
                      <option value="corporate">Corporate</option>
                      <option value="academic">Academic</option>
                      <option value="government">Government</option>
                    </select>
                  </FormGroup>
                  <FormGroup label="Max Voter Capacity">
                    <input type="number" name="max_voters" value={formData.max_voters} onChange={handleInputChange} className="input-field" />
                  </FormGroup>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="p-6 bg-primaryGold/5 border border-primaryGold/10 rounded-2xl flex gap-4">
                  <Info className="text-primaryGold flex-shrink-0" size={24} />
                  <p className="text-xs text-textSecondary leading-relaxed">
                    <span className="font-bold text-textPrimary block mb-1">Time Logic:</span>
                    Registration deadline must be before or equal to the start date. Voters cannot join after the deadline. All times are handled in UTC.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormGroup label="Registration Deadline" icon={<ShieldCheck size={14} />}>
                    <input type="datetime-local" name="registration_deadline" value={formData.registration_deadline} onChange={handleInputChange} className="input-field" />
                  </FormGroup>
                  <FormGroup label="Voting Start" icon={<Clock size={14} />}>
                    <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleInputChange} className="input-field" />
                  </FormGroup>
                  <FormGroup label="Voting End" icon={<Clock size={14} />}>
                    <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleInputChange} className="input-field" />
                  </FormGroup>
                  <div className="flex flex-col justify-end space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="allow_waitlist" checked={formData.allow_waitlist} onChange={handleInputChange} className="w-5 h-5 rounded border-borderColor bg-secondaryBg text-primaryGold focus:ring-primaryGold" />
                      <span className="text-sm font-medium text-textSecondary group-hover:text-textPrimary transition-colors">Enable Waitlist if Capacity Reached</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="is_anonymous" checked={formData.is_anonymous} onChange={handleInputChange} className="w-5 h-5 rounded border-borderColor bg-secondaryBg text-primaryGold focus:ring-primaryGold" />
                      <span className="text-sm font-medium text-textSecondary group-hover:text-textPrimary transition-colors">Enforce Strict Anonymity (Zero Linking)</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-textSecondary">At least 2 candidates are recommended for a fair poll.</p>
                  <button onClick={addCandidate} className="text-primaryGold text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Add Candidate
                  </button>
                </div>
                {candidates.map((cand, i) => (
                  <div key={i} className="p-6 bg-secondaryBg/30 border border-borderColor rounded-2xl relative group">
                    <button onClick={() => removeCandidate(i)} className="absolute top-4 right-4 text-textMuted hover:text-dangerRed transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <input value={cand.name} onChange={(e) => handleCandidateChange(i, 'name', e.target.value)} className="input-field" placeholder="Candidate Full Name" />
                        <input value={cand.designation} onChange={(e) => handleCandidateChange(i, 'designation', e.target.value)} className="input-field text-sm" placeholder="Title / Designation (e.g. CTO)" />
                        <textarea value={cand.manifesto} onChange={(e) => handleCandidateChange(i, 'manifesto', e.target.value)} className="input-field text-sm min-h-[80px]" placeholder="Candidate Manifesto..." />
                      </div>
                      <div className="aspect-square bg-secondaryBg rounded-xl border border-dashed border-borderColor flex flex-col items-center justify-center cursor-pointer hover:border-primaryGold transition-colors">
                        <ImageIcon className="text-textMuted mb-2" size={32} />
                        <span className="text-[10px] font-bold text-textMuted uppercase">Upload Photo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="glass-card p-6 border-primaryGold/20">
                  <h3 className="text-lg font-bold text-textPrimary mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-textSecondary">Title: <span className="text-textPrimary">{formData.title}</span></div>
                    <div className="text-textSecondary">Capacity: <span className="text-textPrimary">{formData.max_voters} Voters</span></div>
                    <div className="text-textSecondary">Candidates: <span className="text-textPrimary">{candidates.length}</span></div>
                    <div className="text-textSecondary">Anonymity: <span className="text-textPrimary">{formData.is_anonymous ? "Strict" : "Standard"}</span></div>
                  </div>
                </div>
                <div className="p-6 bg-successGreen/5 border border-successGreen/10 rounded-2xl flex gap-4">
                  <Globe className="text-successGreen" size={24} />
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Ready to go live? Once published, some timeline settings will be locked to ensure election integrity. All voters will be notified if you choose "Publish Now".
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-borderColor flex items-center justify-between bg-secondaryBg/30">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1 || loading} className="btn-secondary px-6 flex items-center gap-2 disabled:opacity-0 transition-opacity">
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <div className="flex gap-3">
            {step === 4 && (
              <button onClick={() => createElection('draft')} disabled={loading} className="btn-secondary px-8 flex items-center gap-2">
                <Save size={18} />
                <span>Save Draft</span>
              </button>
            )}
            <button onClick={() => step === 4 ? createElection('published') : setStep(s => s + 1)} disabled={loading} className="btn-primary px-8 py-3 flex items-center gap-2">
              <span>{step === 4 ? "Publish Election Now" : "Continue"}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ step, current, label }) {
  const isCompleted = current > step;
  const isActive = current === step;

  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 mb-2 ${isCompleted ? 'bg-successGreen border-successGreen text-primaryBg' : isActive ? 'bg-primaryGold border-primaryGold text-primaryBg' : 'bg-secondaryBg border-borderColor text-textMuted'}`}>
        {isCompleted ? <ShieldCheck size={20} /> : <span className="font-heading font-bold">{step}</span>}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primaryGold' : 'text-textMuted'}`}>{label}</span>
    </div>
  );
}

function FormGroup({ label, description, children, icon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
          {icon}
          {label}
        </label>
        {description && <span className="text-[10px] text-textMuted">{description}</span>}
      </div>
      {children}
    </div>
  );
}
