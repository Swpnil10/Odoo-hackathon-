import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  X,
  AlertCircle,
  Package,
  ShieldCheck,
  Sparkles,
  FileText,
  Leaf,
  Users,
  Landmark,
  Eye,
  ArchiveRestore,
} from 'lucide-react';
import type { Challenge, ChallengeStatus, ESGCategory, Reward } from '../types';
import { GlassCard } from './GlassCard';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'creator' | 'audit' | 'inventory';

interface AdminConsoleProps {
  challenges: Challenge[];
  rewards: Reward[];
  onAddChallenge: (challenge: Challenge) => void;
  onAddReward?: (reward: Reward) => void;
  onUpdateStatus: (id: string, status: ChallengeStatus, rejectionNote?: string) => void;
  onEarnRewards: (xp: number, points: number) => void;
  onUpdateRewardStock: (rewardId: string, newStock: number) => void;
}

interface ChallengeFormState {
  title: string;
  description: string;
  category: ESGCategory;
  xp: number;
  points: number;
  proofRequired: boolean;
  startDate: string;
  endDate: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: typeof Plus }[] = [
  { key: 'creator', label: 'Challenge Creator', icon: Plus },
  { key: 'audit', label: 'Audit Verification', icon: ShieldCheck },
  { key: 'inventory', label: 'Reward Inventory', icon: Package },
];

const CATEGORY_STYLES: Record<ESGCategory, { bg: string; text: string; border: string; glow: 'env' | 'social' | 'gov' }> = {
  Environmental: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'env' },
  Social: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'social' },
  Governance: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'gov' },
};

const CATEGORY_ICONS: Record<ESGCategory, typeof Leaf> = {
  Environmental: Leaf,
  Social: Users,
  Governance: Landmark,
};

const INITIAL_FORM: ChallengeFormState = {
  title: '',
  description: '',
  category: 'Environmental',
  xp: 100,
  points: 50,
  proofRequired: false,
  startDate: '',
  endDate: '',
};

const TAB_VARIANTS = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(6px)' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200';

const labelClass = 'block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1.5';

function CategoryBadge({ category }: { category: ESGCategory }) {
  const style = CATEGORY_STYLES[category];
  const Icon = CATEGORY_ICONS[category];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
      <Icon size={10} />
      {category}
    </span>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl px-5 py-3.5 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
        <Check size={14} className="text-emerald-400" />
      </div>
      <span className="text-sm font-medium text-emerald-300">{message}</span>
      <button onClick={onDismiss} className="ml-2 text-white/30 hover:text-white/60 transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Tab 1: Challenge Creator ────────────────────────────────────────────────

function ChallengeCreator({
  onAddChallenge,
  onToast,
}: {
  onAddChallenge: AdminConsoleProps['onAddChallenge'];
  onToast: (msg: string) => void;
}) {
  const [form, setForm] = useState<ChallengeFormState>({ ...INITIAL_FORM });

  const updateField = <K extends keyof ChallengeFormState>(key: K, value: ChallengeFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buildChallenge = (status: ChallengeStatus): Challenge => ({
    id: `ch-admin-${Date.now()}`,
    ...form,
    status,
    participantsCount: 0,
  });

  const handleCreate = (status: ChallengeStatus) => {
    if (!form.title.trim() || !form.description.trim()) return;
    onAddChallenge(buildChallenge(status));
    setForm({ ...INITIAL_FORM });
    onToast(status === 'Draft' ? 'Challenge saved as draft' : 'Challenge published & active');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
          <Sparkles size={16} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90">New Challenge</h3>
          <p className="text-[10px] text-white/35 uppercase tracking-wider">Configure & Deploy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Title */}
        <div className="md:col-span-2">
          <label className={labelClass}>Challenge Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Zero-Waste Week Initiative"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the challenge objectives, deliverables, and success criteria…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>ESG Category</label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as ESGCategory)}
              className={`${inputClass} appearance-none cursor-pointer pr-10`}
            >
              <option value="Environmental">🌱 Environmental</option>
              <option value="Social">💜 Social</option>
              <option value="Governance">⚖️ Governance</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* XP */}
        <div>
          <label className={labelClass}>XP Reward</label>
          <input
            type="number"
            min={0}
            value={form.xp}
            onChange={(e) => updateField('xp', Number(e.target.value))}
            className={inputClass}
          />
        </div>

        {/* Points */}
        <div>
          <label className={labelClass}>Points Reward</label>
          <input
            type="number"
            min={0}
            value={form.points}
            onChange={(e) => updateField('points', Number(e.target.value))}
            className={inputClass}
          />
        </div>

        {/* Proof Required */}
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.proofRequired}
                onChange={(e) => updateField('proofRequired', e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-5 rounded-md border border-white/15 bg-white/5 peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/40 transition-all flex items-center justify-center">
                {form.proofRequired && <Check size={12} className="text-emerald-400" />}
              </div>
            </div>
            <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Require proof submission</span>
          </label>
        </div>

        {/* Dates */}
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCreate('Draft')}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/60 hover:text-white/80 hover:border-white/20 transition-all"
        >
          <FileText size={13} />
          Create as Draft
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCreate('Active')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
        >
          <Sparkles size={13} />
          Publish Active
        </motion.button>
      </div>
    </div>
  );
}

// ─── Tab 2: Audit Verification Ledger ────────────────────────────────────────

function AuditVerification({
  challenges,
  onUpdateStatus,
  onEarnRewards,
}: {
  challenges: Challenge[];
  onUpdateStatus: AdminConsoleProps['onUpdateStatus'];
  onEarnRewards: AdminConsoleProps['onEarnRewards'];
}) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const underReview = challenges.filter((c) => c.status === 'Under Review');

  const handleApprove = (challenge: Challenge) => {
    onUpdateStatus(challenge.id, 'Completed');
    onEarnRewards(challenge.xp, challenge.points);
  };

  const handleReject = (id: string) => {
    if (!rejectionNote.trim()) return;
    onUpdateStatus(id, 'Active', rejectionNote);
    setRejectingId(null);
    setRejectionNote('');
  };

  if (underReview.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-5">
          <ShieldCheck size={28} className="text-emerald-500/40" />
        </div>
        <h4 className="text-sm font-semibold text-white/60 mb-1.5">All Clear</h4>
        <p className="text-xs text-white/30 max-w-xs">
          No challenges are pending verification. Submissions will appear here when employees submit proof.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-white/40" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {underReview.length} Pending Review
          </span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {underReview.map((challenge) => {
          const catStyle = CATEGORY_STYLES[challenge.category];
          return (
            <motion.div
              key={challenge.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <GlassCard
                className="!p-4"
                hoverEffect={false}
                glowColor={catStyle.glow}
              >
                <div className="flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white/90 truncate">{challenge.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <CategoryBadge category={challenge.category} />
                        <span className="text-[10px] text-white/30">
                          <Users size={10} className="inline mr-1" />
                          {challenge.participantsCount} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-emerald-400/70 bg-emerald-500/10 rounded-lg px-2 py-1">
                        +{challenge.xp} XP
                      </span>
                      <span className="text-[10px] font-semibold text-teal-400/70 bg-teal-500/10 rounded-lg px-2 py-1">
                        +{challenge.points} PTS
                      </span>
                    </div>
                  </div>

                  {/* Proof */}
                  {challenge.proofSubmitted && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Submitted Proof</p>
                      <p className="text-xs text-white/60 leading-relaxed">{challenge.proofSubmitted}</p>
                    </div>
                  )}

                  {/* Rejection textarea */}
                  <AnimatePresence>
                    {rejectingId === challenge.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          value={rejectionNote}
                          onChange={(e) => setRejectionNote(e.target.value)}
                          placeholder="Provide a reason for rejection…"
                          rows={2}
                          className={`${inputClass} resize-none mb-2`}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {rejectingId === challenge.id ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleReject(challenge.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 border border-rose-500/25 px-3.5 py-2 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/25 transition-all"
                        >
                          <X size={12} />
                          Confirm Rejection
                        </motion.button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectionNote(''); }}
                          className="text-[11px] text-white/30 hover:text-white/50 px-2 py-2 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleApprove(challenge)}
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600/80 to-teal-600/80 px-4 py-2 text-[11px] font-semibold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
                        >
                          <Check size={12} />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setRejectingId(challenge.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-[11px] font-semibold text-rose-400/80 hover:bg-rose-500/15 transition-all"
                        >
                          <X size={12} />
                          Reject
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab 3: Reward Inventory Manager ─────────────────────────────────────────

function RewardInventory({
  rewards,
  onUpdateRewardStock,
  onAddReward,
  onToast,
}: {
  rewards: Reward[];
  onUpdateRewardStock: AdminConsoleProps['onUpdateRewardStock'];
  onAddReward: AdminConsoleProps['onAddReward'];
  onToast: (msg: string) => void;
}) {
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  
  // New reward perk form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState<number>(100);
  const [newStock, setNewStock] = useState<number>(10);
  const [newCategory, setNewCategory] = useState<'Physical' | 'Digital' | 'Experience'>('Digital');
  const [newIcon, setNewIcon] = useState('🎁');

  const getStockValue = (reward: Reward) =>
    stockValues[reward.id] ?? reward.stock;

  const handleStockChange = (id: string, value: number) =>
    setStockValues((prev) => ({ ...prev, [id]: value }));

  const handleUpdate = (id: string) => {
    const value = stockValues[id];
    if (value !== undefined) {
      onUpdateRewardStock(id, value);
      onToast("Perk stock updated successfully!");
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !onAddReward) return;
    
    const rewardObj: Reward = {
      id: `rw-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      pointsRequired: newPoints,
      stock: newStock,
      category: newCategory,
      icon: newIcon,
    };

    onAddReward(rewardObj);
    onToast("New reward perk added successfully!");
    
    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewPoints(100);
    setNewStock(10);
    setNewCategory('Digital');
    setNewIcon('🎁');
  };

  const rewardCategoryStyles: Record<Reward['category'], { bg: string; text: string }> = {
    Physical: { bg: 'bg-sky-500/10', text: 'text-sky-400' },
    Digital: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
    Experience: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  };

  return (
    <div className="space-y-6">
      {/* Create Reward Perk Form */}
      <form onSubmit={handleCreateReward} className="p-4.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <Plus size={14} className="text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Create Reward Perk</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Icon Emoji</label>
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="e.g. 🎁, 🌳, 🎫"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Perk Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Tree Planting Certificate"
              className={inputClass}
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className={labelClass}>Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Dedicate a real native tree to be planted in our corporate forest."
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Points Cost</label>
            <input
              type="number"
              min={1}
              value={newPoints}
              onChange={(e) => setNewPoints(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Initial Stock</label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Perk Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className={inputClass}
            >
              <option value="Physical">Physical Item</option>
              <option value="Digital">Digital Reward</option>
              <option value="Experience">Real-life Experience</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow transition-all cursor-pointer"
          >
            <Plus size={13} />
            Create Reward Perk
          </button>
        </div>
      </form>

      {rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-5">
            <Package size={28} className="text-white/20" />
          </div>
          <h4 className="text-sm font-semibold text-white/60 mb-1.5">No Rewards Yet</h4>
          <p className="text-xs text-white/30">Add rewards to the marketplace to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ArchiveRestore size={14} className="text-white/40" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {rewards.length} Reward{rewards.length !== 1 ? 's' : ''} in Catalog
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => {
              const isOutOfStock = reward.stock === 0;
              const catStyle = rewardCategoryStyles[reward.category];

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard
                    className={`!p-4 ${isOutOfStock ? '!border-rose-500/25 ring-1 ring-rose-500/10' : ''}`}
                    hoverEffect={false}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Title & category */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{reward.icon}</span>
                            <h4 className="text-sm font-semibold text-white/90 truncate">{reward.title}</h4>
                          </div>
                          <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{reward.description}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${catStyle.bg} ${catStyle.text}`}>
                          {reward.category}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/30">Cost</span>
                          <span className="text-xs font-semibold text-teal-400">{reward.pointsRequired} pts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/30">Stock</span>
                          <span className={`text-xs font-semibold ${isOutOfStock ? 'text-rose-400' : 'text-white/70'}`}>
                            {reward.stock}
                          </span>
                          {isOutOfStock && (
                            <AlertCircle size={12} className="text-rose-400 animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* Stock Control */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={getStockValue(reward)}
                          onChange={(e) => handleStockChange(reward.id, Number(e.target.value))}
                          className={`${inputClass} !py-2 flex-1`}
                        />
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleUpdate(reward.id)}
                          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600/70 to-teal-600/70 px-4 py-2 text-[11px] font-semibold text-white hover:from-emerald-600 hover:to-teal-600 transition-all"
                        >
                          <Check size={12} />
                          Update
                        </motion.button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  challenges,
  rewards,
  onAddChallenge,
  onAddReward,
  onUpdateStatus,
  onEarnRewards,
  onUpdateRewardStock,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('creator');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/15">
          <ShieldCheck size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white/95 tracking-tight">Admin Console</h2>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/35 font-medium">Corporate ESG Management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl bg-slate-950/80 border border-slate-800 p-1.5 backdrop-blur-sm">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-tab-bg"
                  className="absolute inset-0 rounded-xl bg-indigo-600/20 border border-indigo-500/30 shadow-[0_0_24px_rgba(99,102,241,0.08)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <GlassCard hoverEffect={false} className="!p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={TAB_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {activeTab === 'creator' && (
              <ChallengeCreator onAddChallenge={onAddChallenge} onToast={showToast} />
            )}
            {activeTab === 'audit' && (
              <AuditVerification
                challenges={challenges}
                onUpdateStatus={onUpdateStatus}
                onEarnRewards={onEarnRewards}
              />
            )}
            {activeTab === 'inventory' && (
              <RewardInventory 
                rewards={rewards} 
                onUpdateRewardStock={onUpdateRewardStock} 
                onAddReward={onAddReward}
                onToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default AdminConsole;
