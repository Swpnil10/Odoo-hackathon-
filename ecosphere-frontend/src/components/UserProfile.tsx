import React from 'react';
import { 
  Mail, 
  Sparkles, 
  Flame, 
  Sprout, 
  Award, 
  ShieldAlert,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { UserProfile as UserProfileType, Challenge } from '../types';

interface UserProfileProps {
  user: UserProfileType;
  challenges: Challenge[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, challenges }) => {
  // 1. Dynamic Level Calculations
  const userLevel = Math.floor((user?.xp || 0) / 100);
  const currentLevelXP = (user?.xp || 0) % 100;
  const maxXPForLevel = 100;
  const xpPercentage = Math.min((currentLevelXP / maxXPForLevel) * 100, 100);

  // 2. Filter completed challenges
  const completedChallenges = challenges.filter(c => c.status === 'Completed');
  const completedCount = completedChallenges.length;

  // 3. Derive badges dynamically if not supplied or combine with system badges
  const derivedBadges = [
    {
      id: 'derived-1',
      title: 'First Offset',
      description: 'Completed your first corporate ESG challenge.',
      icon: Sprout,
      unlocked: completedCount >= 1,
      unlockedAt: completedCount >= 1 ? (completedChallenges[0]?.endDate || 'Recent') : null,
      source: completedCount >= 1 ? completedChallenges[0]?.title : null,
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'derived-2',
      title: 'Eco Warrior',
      description: 'Completed more than 5 ESG challenges.',
      icon: Flame,
      unlocked: completedCount > 5,
      unlockedAt: completedCount > 5 ? (completedChallenges[5]?.endDate || 'Recent') : null,
      source: completedCount > 5 ? completedChallenges[5]?.title : null,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'derived-3',
      title: 'Zero Waste Advocate',
      description: 'Completed a waste management or recycling objective.',
      icon: Award,
      unlocked: completedChallenges.some(c => 
        c.title.toLowerCase().includes('waste') || 
        c.description.toLowerCase().includes('waste') ||
        c.title.toLowerCase().includes('recycle') || 
        c.description.toLowerCase().includes('recycle')
      ),
      unlockedAt: completedChallenges.find(c => 
        c.title.toLowerCase().includes('waste') || 
        c.description.toLowerCase().includes('waste') ||
        c.title.toLowerCase().includes('recycle') || 
        c.description.toLowerCase().includes('recycle')
      )?.endDate || null,
      source: completedChallenges.find(c => 
        c.title.toLowerCase().includes('waste') || 
        c.description.toLowerCase().includes('waste') ||
        c.title.toLowerCase().includes('recycle') || 
        c.description.toLowerCase().includes('recycle')
      )?.title || null,
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'derived-4',
      title: 'Compliance Champion',
      description: 'Acquired 300+ XP in ESG scoring and policy training.',
      icon: ShieldAlert,
      unlocked: (user?.xp || 0) >= 300,
      unlockedAt: (user?.xp || 0) >= 300 ? 'Level milestone achieved' : null,
      source: 'Gamified Level Progress',
      colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl w-full mx-auto select-none">
      {/* Hero Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Background glow decorator */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center md:justify-start gap-2">
              {user.name}
              <span className="text-[10px] px-2 py-0.5 border border-indigo-500/30 text-indigo-400 rounded-full font-bold uppercase bg-indigo-500/5">
                {user.role}
              </span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {user.email || 'employee@ecosphere.com'}
            </p>
          </div>
        </div>

        {/* Dynamic Level Stats */}
        <div className="w-full md:w-80 space-y-3.5 border-t md:border-t-0 md:border-l border-slate-800 pt-5 md:pt-0 md:pl-6 flex-shrink-0">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-slate-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Level {userLevel}
            </span>
            <span className="text-slate-400 font-medium">
              {currentLevelXP} / {maxXPForLevel} XP
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Points: <strong className="text-emerald-400">{user.points} pts</strong></span>
            <span>Total XP: <strong className="text-white">{(user?.xp || 0)} XP</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Badge Showcase Grid - Left 3/5 Columns */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Badge Showcase
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Achievements earned through compliance submissions and environmental milestones
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {derivedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className={`rounded-xl border p-4.5 flex items-start gap-3.5 transition-all duration-300 ${
                    badge.unlocked 
                      ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/60'
                      : 'border-slate-800/40 bg-slate-900 opacity-40 select-none'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{badge.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      {badge.description}
                    </p>
                    {badge.unlocked ? (
                      <span className="block text-[9px] text-indigo-400/90 font-medium truncate pt-1">
                        Unlocked via: {badge.source}
                      </span>
                    ) : (
                      <span className="block text-[9px] text-slate-500 font-medium pt-1">
                        Locked (Requires criteria)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed List - Right 2/5 Columns */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Recent Activities
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              History of completed compliance metrics
            </p>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-[360px] pr-1.5 scrollbar-thin">
            {completedChallenges.length > 0 ? (
              completedChallenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 flex flex-col space-y-2.5 transition-colors hover:bg-slate-950/60"
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {challenge.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-snug">{challenge.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Closed on {challenge.endDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold border-t border-slate-900">
                    <span className="text-slate-300">+{challenge.xp} XP</span>
                    <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                    <span className="text-emerald-400">+{challenge.points} pts</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center p-4">
                <Clock className="w-8 h-8 text-slate-700 mb-2.5" />
                <p className="text-xs font-bold text-slate-400">No actions completed yet</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  Join a compliance challenge on the dashboard to record activities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
