import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  Search, 
  Upload, 
  Check, 
  AlertCircle,
  FileCode
} from 'lucide-react';
import type { Challenge, ChallengeStatus, ESGCategory } from '../types';
import GlassCard from './GlassCard';

interface ChallengeListProps {
  challenges: Challenge[];
  onUpdateStatus: (id: string, status: ChallengeStatus, proofSubmitted?: string) => void;
  onEarnRewards: (xp: number, points: number) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ 
  challenges, 
  onUpdateStatus, 
  onEarnRewards 
}) => {
  const [activeFilter, setActiveFilter] = useState<ChallengeStatus | 'All'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingProofFor, setSubmittingProofFor] = useState<Challenge | null>(null);
  
  // Proof Submission Form States
  const [proofText, setProofText] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const statuses: (ChallengeStatus | 'All')[] = ['All', 'Draft', 'Active', 'Under Review', 'Completed', 'Archived'];

  // Filter & Search Logic
  const filteredChallenges = challenges.filter(c => {
    const matchesFilter = activeFilter === 'All' ? true : c.status === activeFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryStyles = (category: ESGCategory) => {
    switch (category) {
      case 'Environmental':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-400',
          gradient: 'from-emerald-400 to-teal-500',
          glow: 'env'
        };
      case 'Social':
        return {
          bg: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
          dot: 'bg-violet-400',
          gradient: 'from-violet-400 to-pink-500',
          glow: 'social'
        };
      case 'Governance':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-400',
          gradient: 'from-amber-400 to-orange-500',
          glow: 'gov'
        };
    }
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full font-medium">
            <FileText className="w-3 h-3" /> Draft
          </span>
        );
      case 'Active':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium animate-pulse">
            <ArrowUpRight className="w-3 h-3" /> Active
          </span>
        );
      case 'Under Review':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'Completed':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'Archived':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-medium">
            <AlertCircle className="w-3 h-3" /> Archived
          </span>
        );
    }
  };

  const triggerUploadMock = () => {
    setIsUploading(true);
    setTimeout(() => {
      setAttachedFile(`esg_verification_${Date.now().toString().slice(-4)}.pdf`);
      setIsUploading(false);
    }, 1200);
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingProofFor) return;

    const proofStr = `${proofText || 'Completed challenge tasks.'} ${
      attachedFile ? `(Attached: ${attachedFile})` : ''
    }`;

    onUpdateStatus(submittingProofFor.id, 'Under Review', proofStr);
    
    // Reset Form
    setProofText('');
    setAttachedFile(null);
    setSubmittingProofFor(null);
  };

  const handleSimulateApprove = (challenge: Challenge) => {
    // Transition status to Completed
    onUpdateStatus(challenge.id, 'Completed');
    // Award the user points and XP
    onEarnRewards(challenge.xp, challenge.points);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Status Filter Scroll List */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin select-none max-w-full">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeFilter === status
                  ? 'bg-slate-800 border border-slate-700 text-slate-100 shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-300 font-sans"
          />
        </div>
      </div>

      {/* Grid of Challenges */}
      {filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredChallenges.map((challenge) => {
              const styles = getCategoryStyles(challenge.category);
              return (
                <motion.div
                  key={challenge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <GlassCard 
                    glowColor={styles.glow as any} 
                    className="flex flex-col justify-between h-full hover:border-white/10"
                    hoverEffect={true}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex justify-between items-start gap-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles.bg}`}>
                          {challenge.category}
                        </span>
                        {getStatusBadge(challenge.status)}
                      </div>

                      {/* Content */}
                      <h4 className="text-base font-bold text-white mt-3.5 leading-snug">
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-brand-textMuted mt-1.5 leading-relaxed">
                        {challenge.description}
                      </p>

                      {challenge.status === 'Active' && challenge.rejectionNote && (
                        <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold text-rose-300 block uppercase tracking-wider">Rejection Alert</span>
                            <p className="text-[11px] text-rose-200/80 mt-0.5 leading-relaxed">
                              HR Audit rejection: {challenge.rejectionNote || 'Please attach clear proof'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Timeline & Metadata */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] text-brand-textMuted font-medium pt-3.5 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {challenge.startDate} to {challenge.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {challenge.participantsCount} participants
                        </span>
                      </div>
                    </div>

                    {/* Reward details & action buttons footer */}
                    <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold leading-none">XP Reward</p>
                          <span className="text-xs font-bold text-white">+{challenge.xp} XP</span>
                        </div>
                        <div className="w-px h-5 bg-white/5" />
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold leading-none">Points</p>
                          <span className="text-xs font-bold text-emerald-400 text-glow-env">+{challenge.points} pts</span>
                        </div>
                      </div>

                      {/* Contextual Action Button */}
                      <div className="flex gap-2">
                        {challenge.status === 'Active' && (
                          <button
                            onClick={() => setSubmittingProofFor(challenge)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-brand-bg px-3.5 py-1.5 rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1"
                          >
                            Submit Proof
                          </button>
                        )}
                        {challenge.status === 'Draft' && (
                          <button
                            onClick={() => onUpdateStatus(challenge.id, 'Active')}
                            className="bg-white/5 border border-white/10 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 active:scale-95 transition-all"
                          >
                            Publish Active
                          </button>
                        )}
                        {challenge.status === 'Under Review' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSimulateApprove(challenge)}
                              title="As admin, approve and award rewards"
                              className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                          </div>
                        )}
                        {challenge.status === 'Completed' && (
                          <span className="text-[11px] text-sky-400 font-semibold flex items-center gap-1 select-none">
                            <Check className="w-3.5 h-3.5" /> Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
          <AlertCircle className="w-8 h-8 text-slate-500 mb-3 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-100">No challenges found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no challenges under the "{activeFilter}" state. Try choosing another filter or searching a different term.
          </p>
        </div>
      )}

      {/* Proof Submission Modal */}
      <AnimatePresence>
        {submittingProofFor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl bg-slate-900 flex flex-col space-y-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Verify Challenge
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submit audit compliance proof for "{submittingProofFor.title}"
                  </p>
                </div>
                <button
                  onClick={() => setSubmittingProofFor(null)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleProofSubmit} className="space-y-4">
                {/* Description of action */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Description of Action Taken
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Describe how you completed this challenge (e.g., 'Volunteered for 3 hours helping package food boxes...')"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                  />
                </div>

                {/* Upload File Zone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    ESG Proof Attachment (PDF, Image, or Certificate)
                  </label>
                  
                  {attachedFile ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <FileCode className="w-5 h-5 text-emerald-400" />
                        <div className="max-w-[200px] truncate">
                          <p className="text-xs font-semibold text-white truncate">{attachedFile}</p>
                          <span className="text-[10px] text-emerald-400/80">File ready for audit upload</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded border border-slate-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={triggerUploadMock}
                      className="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-slate-950/20"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <span className="text-[11px] text-slate-400">Verifying file metadata...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
                          <span className="text-xs font-semibold text-slate-300">Upload verification file</span>
                          <span className="text-[10px] text-slate-500 mt-1">Drag and drop, or tap to browse</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setSubmittingProofFor(null)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Submit Proof Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ChallengeList;
