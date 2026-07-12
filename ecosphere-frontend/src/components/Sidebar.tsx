import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Award, 
  FileSpreadsheet, 
  Leaf, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Users,
  ArrowLeftRight
} from 'lucide-react';
import type { UserProfile, UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  userRole: UserRole;
  actualRole: UserRole;
  onToggleRole: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, user, userRole, actualRole, onToggleRole, onLogout }) => {
  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard & Terrarium', icon: LayoutDashboard },
    { id: 'scores', label: 'ESG Scoring Analysis', icon: BarChart3 },
    { id: 'policies', label: 'PDF Policy Summarizer', icon: FileSpreadsheet },
    { id: 'rewards', label: 'Rewards & Badges', icon: Award },
    { id: 'reports', label: 'Custom Report Builder', icon: FileSpreadsheet },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard & Terrarium', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
    { id: 'scores', label: 'ESG Scoring Analysis', icon: BarChart3 },
    { id: 'policies', label: 'PDF Policy Summarizer', icon: FileSpreadsheet },
    { id: 'rewards', label: 'Rewards & Badges', icon: Award },
    { id: 'reports', label: 'Custom Report Builder', icon: FileSpreadsheet },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  // Dynamic Level calculation
  const userLevel = Math.floor((user?.xp || 0) / 100);
  const currentLevelXP = (user?.xp || 0) % 100;
  const maxXPForLevel = 100;
  const xpPercentage = Math.min((currentLevelXP / maxXPForLevel) * 100, 100);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md h-screen p-6 flex flex-col justify-between z-20">
      {/* Brand Logo */}
      <div>
        <div className="flex items-center gap-3 mb-8 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-brand-bg animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              EcoSphere
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
              ESG Management Platform
            </span>
          </div>
        </div>

        {/* Role Switcher */}
        {actualRole === 'admin' && (
          <button
            onClick={onToggleRole}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold mb-5 transition-all duration-300 border ${
              userRole === 'admin'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {userRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              {userRole === 'admin' ? 'ESG Admin Mode' : 'Employee Mode'}
            </span>
            <span className="flex items-center gap-1 text-[10px] opacity-70">
              <ArrowLeftRight className="w-3 h-3" /> Switch
            </span>
          </button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 border border-slate-700 text-slate-100 shadow-lg shadow-black/20'
                    : 'text-slate-400 border border-transparent hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive 
                      ? 'text-indigo-400'
                      : 'text-slate-400 group-hover:text-indigo-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                  isActive ? 'opacity-100 text-indigo-400' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-slate-400'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Account & Gamification Progress Profile Panel */}
      <div className="glass-panel p-4.5 rounded-2xl border border-slate-800 bg-slate-950/20">
        <div 
          onClick={() => setCurrentTab('profile')}
          className="flex items-center gap-3 mb-4 cursor-pointer group select-none animate-pulse-slow"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-all ${
            userRole === 'admin'
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-amber-500/20'
              : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/20'
          }`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight group-hover:text-indigo-400 transition-colors">{user.name}</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              View Profile
            </p>
          </div>
        </div>

        {/* Level Stats */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Level {userLevel}
            </span>
            <span className="text-slate-400">
              {currentLevelXP} / {maxXPForLevel} XP
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]" 
              style={{ width: `${xpPercentage}%` }}
            />
          </div>

          {/* Points Balance */}
          <div className="pt-2 flex justify-between items-center border-t border-brand-border">
            <span className="text-xs text-brand-textMuted">Redeemable Points</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 text-glow-env">
              {user.points} pts
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
