import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trees, 
  GlassWater, 
  Coffee, 
  Bike, 
  Sun, 
  Sprout, 
  Flame, 
  HeartHandshake, 
  ShieldAlert, 
  Lock, 
  Coins, 
  ShoppingBag,
  PartyPopper
} from 'lucide-react';
import type { UserProfile, Reward, Badge } from '../types';
import GlassCard from './GlassCard';

// Map dynamic string names from Mock Data to actual Lucide component components
const iconMap: Record<string, React.ComponentType<any>> = {
  Trees,
  GlassWater,
  Coffee,
  Bike,
  Sun,
  Sprout,
  Flame,
  HeartHandshake,
  ShieldAlert
};

interface RewardStoreProps {
  user: UserProfile;
  rewards: Reward[];
  badges: Badge[];
  onRedeem: (rewardId: string, cost: number) => void;
}

export const RewardStore: React.FC<RewardStoreProps> = ({ 
  user, 
  rewards, 
  badges, 
  onRedeem 
}) => {
  const [successRedemption, setSuccessRedemption] = useState<Reward | null>(null);

  const handleRedeemClick = (reward: Reward) => {
    if (reward.stock <= 0 || user.points < reward.pointsRequired) return;
    
    // Execute redeem state updates
    onRedeem(reward.id, reward.pointsRequired);
    setSuccessRedemption(reward);
  };

  return (
    <div className="space-y-10">
      
      {/* Badges Section */}
      <div>
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
            ESG Milestones
          </span>
          <h3 className="text-xl font-bold text-white mt-2">Earned Badges</h3>
          <p className="text-xs text-brand-textMuted mt-0.5">
            Auto-unlocked achievements representing environmental, social, and governance task benchmarks
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const BadgeIcon = iconMap[badge.icon] || Sprout;
            return (
              <GlassCard 
                key={badge.id}
                hoverEffect={badge.isUnlocked}
                glowColor={badge.isUnlocked ? 'social' : 'default'}
                className={`relative flex flex-col justify-between h-full border ${
                  badge.isUnlocked 
                    ? 'border-violet-500/20 bg-violet-950/5' 
                    : 'border-white/5 opacity-55 bg-slate-950/20'
                }`}
              >
                <div>
                  {/* Lock Indicator */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl border ${
                      badge.isUnlocked 
                        ? 'bg-violet-500/20 border-violet-500/30 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                        : 'bg-slate-800 border-white/5 text-slate-500'
                    }`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                    {badge.isUnlocked ? (
                      <span className="text-[9px] uppercase tracking-wider bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 border border-white/5 text-slate-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-tight">{badge.title}</h4>
                  <p className="text-xs text-brand-textMuted mt-1 leading-normal">
                    {badge.description}
                  </p>
                </div>

                {/* Unlock criteria rule */}
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-brand-textMuted">
                  <span className="font-semibold text-slate-400">Unlock Rule:</span>{' '}
                  {badge.unlockRule.category ? `${badge.unlockRule.category} Challenges` : 'Total XP'} &ge; {badge.unlockRule.value}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Rewards Store Section */}
      <div>
        <div className="mb-6 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Employee Perks
            </span>
            <h3 className="text-xl font-bold text-white mt-2">Perks & Vouchers Shop</h3>
            <p className="text-xs text-brand-textMuted mt-0.5">
              Redeem your hard-earned points for physical gear, digital offsets, or local volunteer experiences
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 text-glow-env">
            <Coins className="w-4 h-4" />
            <span>Balance: {user.points} pts</span>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const RewardIcon = iconMap[reward.icon] || ShoppingBag;
            const isOutOfStock = reward.stock <= 0;
            const hasEnoughPoints = user.points >= reward.pointsRequired;
            
            return (
              <GlassCard 
                key={reward.id} 
                glowColor={!isOutOfStock && hasEnoughPoints ? 'gov' : 'default'}
                className="flex flex-col justify-between h-full border border-white/5 hover:border-white/10"
              >
                <div>
                  {/* Top Stats */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl border ${
                      isOutOfStock
                        ? 'bg-slate-800 border-white/5 text-slate-500'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <RewardIcon className="w-5 h-5" />
                    </div>
                    
                    {/* Stock Status display */}
                    {isOutOfStock ? (
                      <span className="text-[9px] uppercase tracking-wider bg-rose-500/15 border border-rose-500/25 text-rose-400 font-bold px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    ) : (
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        reward.stock < 5 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {reward.stock} units left
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                    {reward.category} Perk
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 leading-tight">{reward.title}</h4>
                  <p className="text-xs text-brand-textMuted mt-1.5 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                {/* Bottom cost and checkout button */}
                <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-none">Cost</span>
                    <span className="text-base font-extrabold text-amber-400">{reward.pointsRequired} pts</span>
                  </div>

                  <button
                    disabled={isOutOfStock || !hasEnoughPoints}
                    onClick={() => handleRedeemClick(reward)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      isOutOfStock
                        ? 'bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed'
                        : !hasEnoughPoints
                        ? 'bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-brand-bg hover:scale-105 active:scale-95 shadow-md shadow-amber-500/10'
                    }`}
                  >
                    {isOutOfStock ? 'Sold Out' : !hasEnoughPoints ? 'Need Points' : 'Redeem Perk'}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Success Animation Modal */}
      <AnimatePresence>
        {successRedemption && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-sm rounded-2xl border border-white/15 p-6 text-center shadow-2xl bg-[#090d16]/95"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <PartyPopper className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-white">Voucher Claimed!</h3>
              <p className="text-xs text-brand-textMuted mt-1.5 leading-relaxed">
                You successfully redeemed <span className="text-white font-semibold">"{successRedemption.title}"</span>. 
                Your digital voucher code has been emailed to you.
              </p>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 my-4 flex items-center justify-between text-xs">
                <span className="text-brand-textMuted flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Redeemed
                </span>
                <span className="font-bold text-rose-400">-{successRedemption.pointsRequired} pts</span>
              </div>

              <button
                onClick={() => setSuccessRedemption(null)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-brand-bg py-2.5 rounded-xl text-xs font-bold hover:scale-102 active:scale-98 transition-all font-semibold"
              >
                Close & Keep Exploring
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default RewardStore;
