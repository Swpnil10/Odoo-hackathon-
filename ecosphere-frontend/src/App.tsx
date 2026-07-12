import { useState, useEffect } from 'react';
import { 
  Leaf, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Terrarium from './components/Terrarium';
import ChallengeList from './components/ChallengeList';
import ScoreWeights from './components/ScoreWeights';
import RewardStore from './components/RewardStore';
import ReportBuilder from './components/ReportBuilder';

import { 
  initialUser, 
  mockChallenges as baseChallenges, 
  mockDepartmentScores, 
  mockRewards as baseRewards, 
  mockBadges as baseBadges 
} from './data/mockData';
import type { ChallengeStatus, Challenge, UserRole } from './types';
import AdminConsole from './components/AdminConsole';
import { evaluateBadgeUnlocks } from './utils/badgeUnlocker';

import { motion as motionElement, AnimatePresence as AnimatePresenceElement } from 'framer-motion';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  
  // App-level Shared States
  const [user, setUser] = useState(initialUser);
  const [challenges, setChallenges] = useState<Challenge[]>(baseChallenges);
  const [rewards, setRewards] = useState(baseRewards);
  const [badges, setBadges] = useState(baseBadges);

  // Auto-leveling & Badge unlock side-effects
  useEffect(() => {
    setBadges(prevBadges => {
      const { updatedBadges, userBadgesUpdated } = evaluateBadgeUnlocks(
        prevBadges,
        user.xp,
        user.level,
        challenges
      );

      // Update user profile badges list if a new badge was unlocked
      if (userBadgesUpdated) {
        const unlockedIds = updatedBadges.filter(b => b.isUnlocked).map(b => b.id);
        setUser(prevUser => ({
          ...prevUser,
          badges: unlockedIds
        }));
      }

      return updatedBadges;
    });
  }, [user.xp, user.level, challenges]);

  // Action: Add XP and Points, checking Level-up thresholds
  const handleEarnRewards = (xpEarned: number, pointsEarned: number) => {
    setUser(prev => {
      let newXp = prev.xp + xpEarned;
      let nextLevel = prev.level;
      let maxXP = nextLevel * 200;

      // Handle continuous level ups if XP earned is very large
      while (newXp >= maxXP) {
        newXp -= maxXP;
        nextLevel += 1;
        maxXP = nextLevel * 200;
      }

      return {
        ...prev,
        xp: newXp,
        points: prev.points + pointsEarned,
        level: nextLevel
      };
    });
  };

  // Action: Update Challenge Status (Active -> Under Review -> Completed / Rejected)
  const handleUpdateChallengeStatus = (id: string, status: ChallengeStatus, proofOrRejection?: string) => {
    setChallenges(prevChallenges => 
      prevChallenges.map(c => {
        if (c.id === id) {
          const isRejection = status === 'Active';
          const updated: Challenge = {
            ...c,
            status,
            proofSubmitted: !isRejection ? (proofOrRejection || c.proofSubmitted) : c.proofSubmitted,
            rejectionNote: isRejection ? (proofOrRejection || c.rejectionNote) : undefined
          };

          // Increment participants count if starting/joining a draft challenge
          if (c.status === 'Draft' && status === 'Active') {
            updated.participantsCount = c.participantsCount + 1;
          }

          return updated;
        }
        return c;
      })
    );
  };

  // Action: Toggle between Employee and ESG Admin Roles
  const handleToggleRole = () => {
    setUserRole(prev => {
      const nextRole = prev === 'employee' ? 'admin' : 'employee';
      if (nextRole === 'employee' && currentTab === 'admin') {
        setCurrentTab('dashboard');
      }
      return nextRole;
    });
  };

  // Action: Add new challenge (Admin Console)
  const handleAddChallenge = (newChallenge: Challenge) => {
    setChallenges(prev => [newChallenge, ...prev]);
  };

  // Action: Update reward stock (Admin Console)
  const handleUpdateRewardStock = (rewardId: string, newStock: number) => {
    setRewards(prevRewards =>
      prevRewards.map(r => r.id === rewardId ? { ...r, stock: newStock } : r)
    );
  };

  // Action: Redeem points for reward perks
  const handleRedeemReward = (rewardId: string, cost: number) => {
    // 1. Deduct points from user
    setUser(prev => ({
      ...prev,
      points: Math.max(0, prev.points - cost)
    }));

    // 2. Reduce reward stock count
    setRewards(prevRewards =>
      prevRewards.map(r => {
        if (r.id === rewardId) {
          return {
            ...r,
            stock: Math.max(0, r.stock - 1)
          };
        }
        return r;
      })
    );
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Sustainability Ecosystem';
      case 'admin':
        return 'ESG Corporate Management';
      case 'scores':
        return 'ESG Audit Scorecards';
      case 'rewards':
        return 'Rewards & Recognition';
      case 'reports':
        return 'Custom Report Builder';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex bg-[#05070f] text-slate-100 min-h-screen">
      {/* Sleek Navigation Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={user} 
        userRole={userRole}
        onToggleRole={handleToggleRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto max-h-screen">
        {/* Header Block */}
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-brand-border select-none">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {getPageTitle()}
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-brand-textMuted mt-1">
              Analyze metrics, complete challenges, and track your ecological impact score.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              Corporate Network: Stable
            </span>
          </div>
        </header>

        {/* Tab Components Render View */}
        <AnimatePresenceElement mode="wait">
          <motionElement.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {currentTab === 'dashboard' && (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
                {/* Welcome Card & SVG Terrarium Panel (Left 2/5 columns) */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Glassmorphic Welcome Card */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden select-none">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
                    
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Eco-Impact Center
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">Welcome back, {user.name}!</h3>
                    <p className="text-xs text-brand-textMuted mt-1.5 leading-relaxed">
                      You completed <span className="text-emerald-400 font-semibold">2 challenges</span> this week, offsetting approximately <span className="text-emerald-400 font-semibold">12kg of CO2</span>.
                    </p>

                    <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3">
                      <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-300 block">Eco-Tip of the Day:</span>
                        <p className="text-[11px] text-brand-textMuted mt-0.5 leading-relaxed">
                          Reduce office vampire load! Shut down workspaces and power strips fully before weekend breaks.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terrarium Panel */}
                  <div className="h-[465px]">
                    <Terrarium xp={user.xp} onXpChange={(newXp) => handleEarnRewards(newXp - user.xp, 0)} />
                  </div>
                </div>

                {/* Challenges Panel (Right 3/5 columns) */}
                <div className="xl:col-span-3">
                  <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <div className="mb-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-white">Active Corporate Challenges</h3>
                        <p className="text-xs text-brand-textMuted mt-0.5">
                          Engage in daily social, environmental, and governance objectives to earn XP
                        </p>
                      </div>
                    </div>

                    <ChallengeList 
                      challenges={challenges} 
                      onUpdateStatus={handleUpdateChallengeStatus} 
                      onEarnRewards={handleEarnRewards}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'scores' && (
              <ScoreWeights departments={mockDepartmentScores} />
            )}

            {currentTab === 'rewards' && (
              <RewardStore 
                user={user} 
                rewards={rewards} 
                badges={badges} 
                onRedeem={handleRedeemReward} 
              />
            )}

            {currentTab === 'reports' && (
              <ReportBuilder />
            )}

            {currentTab === 'admin' && (
              <AdminConsole
                challenges={challenges}
                rewards={rewards}
                onAddChallenge={handleAddChallenge}
                onUpdateStatus={handleUpdateChallengeStatus}
                onEarnRewards={handleEarnRewards}
                onUpdateRewardStock={handleUpdateRewardStock}
              />
            )}
          </motionElement.div>
        </AnimatePresenceElement>
      </main>
    </div>
  );
}
