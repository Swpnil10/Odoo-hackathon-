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
  onToggleRole: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, user, userRole, onToggleRole }) => {
  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard & Terrarium', icon: LayoutDashboard },
    { id: 'scores', label: 'ESG Scoring Analysis', icon: BarChart3 },
    { id: 'rewards', label: 'Rewards & Badges', icon: Award },
    { id: 'reports', label: 'Custom Report Builder', icon: FileSpreadsheet },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard & Terrarium', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
    { id: 'scores', label: 'ESG Scoring Analysis', icon: BarChart3 },
    { id: 'rewards', label: 'Rewards & Badges', icon: Award },
    { id: 'reports', label: 'Custom Report Builder', icon: FileSpreadsheet },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  // Simple logic to calculate progress to next level
  const maxXPForLevel = user.level * 200;
  const xpPercentage = Math.min((user.xp / maxXPForLevel) * 100, 100);

  return (
    <aside className="w-80 h-screen sticky top-0 p-6 flex flex-col justify-between border-r border-brand-border bg-brand-bg/80 backdrop-blur-xl z-20">
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

        {/* Navigation Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-white/5 border border-white/10 text-white shadow-lg shadow-black/20'
                    : 'text-brand-textMuted border border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive 
                      ? (item.id === 'admin' ? 'text-amber-400' : 'text-emerald-400')
                      : 'text-brand-textMuted group-hover:text-emerald-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                  isActive ? 'opacity-100 text-emerald-400' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-brand-textMuted'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Account & Gamification Progress Profile Panel */}
      <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
            userRole === 'admin'
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-amber-500/20'
              : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/20'
          }`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight">{user.name}</h4>
            <p className="text-xs text-brand-textMuted">
              {userRole === 'admin' ? 'ESG Administrator' : user.role}
            </p>
          </div>
        </div>

        {/* Level Stats */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Level {user.level}
            </span>
            <span className="text-brand-textMuted">
              {user.xp} / {maxXPForLevel} XP
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
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
