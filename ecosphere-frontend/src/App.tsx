import { useState, useEffect } from 'react';
import { 
  Leaf, 
  Sparkles, 
  TrendingUp,
  Loader2
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Terrarium from './components/Terrarium';
import ChallengeList from './components/ChallengeList';
import ScoreWeights from './components/ScoreWeights';
import RewardStore from './components/RewardStore';
import ReportBuilder from './components/ReportBuilder';
import Auth from './components/Auth';
import ComplianceSummarizer from './components/ComplianceSummarizer';
import UserProfile from './components/UserProfile';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';

import { 
  initialUser, 
  mockChallenges as baseChallenges, 
  mockRewards as baseRewards, 
  mockBadges as baseBadges 
} from './data/mockData';
import type { ChallengeStatus, Challenge, UserRole, DepartmentScore, Reward, UserProfile as UserProfileType } from './types';
import AdminConsole from './components/AdminConsole';
import { evaluateBadgeUnlocks } from './utils/badgeUnlocker';
import { api } from './utils/api';

import { motion as motionElement, AnimatePresence as AnimatePresenceElement } from 'framer-motion';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('userRole');
    return (saved as UserRole) || 'employee';
  });

  const decodeToken = (t: string | null) => {
    if (!t) return null;
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const tokenPayload = decodeToken(token);
  const actualRole: UserRole = (tokenPayload?.role as UserRole) || 'employee';
  const activeRoleView = actualRole === 'admin' ? userRole : 'employee';

  // App-level Shared States
  const [user, setUser] = useState<UserProfileType>(() => {
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail') || 'employee@ecosphere.com';
    const initialXP = initialUser.xp ?? 320;
    const initialLevel = Math.floor((initialXP || 0) / 100);
    if (savedName && token) {
      return {
        ...initialUser,
        name: savedName,
        email: savedEmail,
        xp: initialXP,
        level: initialLevel,
        role: actualRole === 'admin' ? 'Admin' : 'Employee'
      };
    }
    return {
      ...initialUser,
      email: 'employee@ecosphere.com',
      level: Math.floor((initialUser.xp || 0) / 100)
    };
  });
  const [challenges, setChallenges] = useState<Challenge[]>(baseChallenges);
  const [rewards, setRewards] = useState(baseRewards);
  const [badges, setBadges] = useState(baseBadges);

  const [departments, setDepartments] = useState<DepartmentScore[]>([]);
  const [loadingDepts, setLoadingDepts] = useState<boolean>(true);
  const [deptError, setDeptError] = useState<string | null>(null);

  const handleAuthSuccess = (jwtToken: string, email: string, authenticatedRole: 'employee' | 'admin') => {
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('userRole', authenticatedRole);
    localStorage.setItem('userName', email.split('@')[0]);
    localStorage.setItem('userEmail', email);
    setUserRole(authenticatedRole);
    
    const decoded = decodeToken(jwtToken);
    const roleFromToken = (decoded?.role as UserRole) || authenticatedRole;
    
    setUser(prev => {
      const currentXP = prev?.xp ?? 0;
      return {
        ...prev,
        name: email.split('@')[0],
        email: email,
        xp: currentXP,
        level: Math.floor((currentXP || 0) / 100),
        role: roleFromToken === 'admin' ? 'Admin' : 'Employee'
      };
    });
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUserRole('employee');
    setUser({
      ...initialUser,
      level: Math.floor((initialUser.xp || 0) / 100)
    });
    setCurrentTab('dashboard');
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoadingDepts(true);
        const data = await api.getDepartments();
        const mapped: DepartmentScore[] = data.map(d => ({
          id: String(d.id),
          name: d.name,
          environmental: d.environmental_score,
          social: d.social_score,
          governance: d.governance_score,
          employeeCount: d.employee_count
        }));
        setDepartments(mapped);
      } catch (err: any) {
        setDeptError(err.message || 'Failed to fetch departments data.');
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

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
      const newXp = (prev?.xp || 0) + xpEarned;
      const nextLevel = Math.floor((newXp || 0) / 100);

      return {
        ...prev,
        xp: newXp,
        points: prev.points + pointsEarned,
        level: nextLevel
      };
    });
  };

  // Synchronize dynamic level bounds
  useEffect(() => {
    setUser(prev => {
      const calculatedLevel = Math.floor((prev?.xp || 0) / 100);
      if (prev.level !== calculatedLevel) {
        return {
          ...prev,
          level: calculatedLevel
        };
      }
      return prev;
    });
  }, [user.xp]);

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

  // Action: Add new reward perk (Admin Console)
  const handleAddReward = (newReward: Reward) => {
    setRewards(prev => [newReward, ...prev]);
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
      case 'profile':
        return 'Sustainability Profile';
      default:
        return 'Dashboard';
    }
  };

  if (window.location.pathname === '/reset-password-confirm') {
    return <ResetPasswordConfirm />;
  }

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sleek Navigation Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={user} 
        userRole={activeRoleView}
        actualRole={actualRole}
        onToggleRole={handleToggleRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-8 space-y-6 bg-slate-950">
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
          
          <div className="flex items-center gap-4">
            {/* Global Role Selector */}
            {actualRole === 'admin' && (
              <div className="flex bg-slate-900 border border-white/10 rounded-xl p-0.5 select-none animate-pulse-slow">
                <button
                  onClick={() => {
                    setUserRole('employee');
                    if (currentTab === 'admin') setCurrentTab('dashboard');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeRoleView === 'employee'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Employee View
                </button>
                <button
                  onClick={() => {
                    setUserRole('admin');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeRoleView === 'admin'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Admin View
                </button>
              </div>
            )}

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
                  {/* Standardized Welcome Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 flex flex-col space-y-4 relative overflow-hidden select-none">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
                    
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Eco-Impact Center
                    </span>
                    <h3 className="text-xl font-bold text-slate-100 mt-2">Welcome back, {user.name}!</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      You completed <span className="text-emerald-400 font-semibold">2 challenges</span> this week, offsetting approximately <span className="text-emerald-400 font-semibold">12kg of CO2</span>.
                    </p>

                    <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                      <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-300 block">Eco-Tip of the Day:</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          Reduce office vampire load! Shut down workspaces and power strips fully before weekend breaks.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terrarium Panel */}
                  <div className="h-[530px]">
                    <Terrarium xp={user.xp} />
                  </div>
                </div>

                {/* Challenges Panel (Right 3/5 columns) */}
                <div className="xl:col-span-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 flex flex-col space-y-4">
                    <div className="mb-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">Active Corporate Challenges</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
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
              loadingDepts ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl p-8">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-sm text-slate-400 font-medium mt-3">Loading department scorecards...</span>
                </div>
              ) : deptError ? (
                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs text-center">
                  <p className="font-bold">Error Connecting to Backend</p>
                  <p className="mt-1 opacity-80">{deptError}</p>
                </div>
              ) : (
                <ScoreWeights departments={departments} />
              )
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

            {currentTab === 'policies' && (
              <ComplianceSummarizer />
            )}

            {currentTab === 'profile' && (
              <UserProfile 
                user={user} 
                challenges={challenges}
              />
            )}

            {currentTab === 'admin' && (
              <AdminConsole
                challenges={challenges}
                rewards={rewards}
                onAddChallenge={handleAddChallenge}
                onAddReward={handleAddReward}
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
