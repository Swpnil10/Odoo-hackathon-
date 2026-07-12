import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area
} from 'recharts';
import { 
  Lock, 
  Unlock, 
  Scale, 
  Users, 
  Sparkles,
  Leaf,
  HeartHandshake,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import type { DepartmentScore, ESGWeightConfig } from '../types';
import GlassCard from './GlassCard';
import { calculateWeightedScores, calculateOverallESGScore } from '../utils/esgMath';
import { api } from '../utils/api';
import { AIPolicySummaryCard } from './AIPolicySummaryCard';
import { ESGInsightsCard } from './ESGInsightsCard';

interface ScoreWeightsProps {
  departments: DepartmentScore[];
}

export const ScoreWeights: React.FC<ScoreWeightsProps> = ({ departments }) => {
  // Weight configurations (0-100 values)
  const [weights, setWeights] = useState<ESGWeightConfig>({
    environmental: 40,
    social: 30,
    governance: 30
  });

  const [selectedDept, setSelectedDept] = useState<DepartmentScore | null>(null);
  const [forecast, setForecast] = useState<{ forecasted_carbon_amount: number; trend: string } | null>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDept) {
      setForecast(null);
      return;
    }

    const fetchForecast = async () => {
      setLoadingForecast(true);
      setForecastError(null);
      try {
        const data = await api.getCarbonForecast(parseInt(selectedDept.id));
        setForecast({
          forecasted_carbon_amount: data?.forecasted_carbon_amount ?? 0.0,
          trend: data?.trend ?? 'stable'
        });
      } catch (err: any) {
        setForecastError(err.message || 'Failed to fetch carbon emissions forecast.');
      } finally {
        setLoadingForecast(false);
      }
    };

    fetchForecast();
  }, [selectedDept]);

  const [isLocked, setIsLocked] = useState(true);
  const [weightByEmployees, setWeightByEmployees] = useState(false);

  if (!departments || departments.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl text-center flex flex-col items-center justify-center min-h-[300px]">
        <Scale className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
        <h3 className="text-base font-bold text-slate-200">No Department Scorecard Data Available</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
          The application was unable to retrieve department details from the database. Please verify the backend service is running and seed data is populated.
        </p>
      </div>
    );
  }

  // Proportional weight balancing algorithm to ensure sum is always 100%
  const handleWeightChange = (category: keyof ESGWeightConfig, value: number) => {
    if (isLocked) return;

    const newVal = Math.min(100, Math.max(0, value));
    const oldVal = weights[category];
    const diff = newVal - oldVal;

    const others = (['environmental', 'social', 'governance'] as const).filter(c => c !== category);
    
    const currentOtherSum = weights[others[0]] + weights[others[1]];
    
    const nextWeights = { ...weights };
    nextWeights[category] = newVal;

    if (currentOtherSum === 0) {
      nextWeights[others[0]] = Math.round((100 - newVal) / 2);
      nextWeights[others[1]] = 100 - newVal - nextWeights[others[0]];
    } else {
      // Adjust the other two sliders proportionally to their existing share
      const val1 = Math.max(0, Math.round(weights[others[0]] - (diff * (weights[others[0]] / currentOtherSum))));
      const val2 = Math.max(0, 100 - newVal - val1);
      nextWeights[others[0]] = val1;
      nextWeights[others[1]] = val2;
    }

    setWeights(nextWeights);
  };

  const resetToDefault = () => {
    setWeights({
      environmental: 40,
      social: 30,
      governance: 30
    });
  };

  // Calculates department weighted scores
  const calculatedDepts = calculateWeightedScores(departments, weights);

  // Calculate Company-Wide Overall ESG Score
  const overallScore = calculateOverallESGScore(calculatedDepts, weightByEmployees);

  // Circular gauge SVG parameters
  const radius = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Formatting chart data for Recharts
  const chartData = calculatedDepts.map(d => ({
    name: d.name,
    Environmental: d.environmental,
    Social: d.social,
    Governance: d.governance,
    'Weighted Total': d.weightedTotal
  }));

  // Formatting radar chart data for Recharts
  const radarData = departments.map(d => ({
    subject: d.name,
    Environmental: d.environmental,
    Social: d.social,
    Governance: d.governance,
    fullMark: 100,
  }));

  // Projection Data based on overall ESG rating
  const projectionData = [
    { name: 'Current', Baseline: 120, Projected: 120, Optimistic: 120 },
    { name: 'Q3 2026', Baseline: 130, Projected: Math.round(120 + overallScore * 0.4), Optimistic: 160 },
    { name: 'Q4 2026', Baseline: 140, Projected: Math.round(120 + overallScore * 0.95), Optimistic: 220 },
    { name: 'Q1 2027', Baseline: 148, Projected: Math.round(120 + overallScore * 1.6), Optimistic: 300 },
    { name: 'Q2 2027', Baseline: 155, Projected: Math.round(120 + overallScore * 2.35), Optimistic: 400 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Weights adjustment panel & radial score gauge */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        {/* Overall Score Dial Gauge */}
        <GlassCard hoverEffect={false} className="flex flex-col items-center text-center p-6 bg-white/[0.01] h-full justify-between">
          <div className="w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Audit Index Score
            </span>
            <h3 className="text-lg font-bold text-white mt-3">Company ESG Rating</h3>
            <p className="text-xs text-brand-textMuted mt-1">Weighted company-wide average index</p>
          </div>

          {/* SVG Circular Dial */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-44 h-44 transform -rotate-90">
              {/* Outer Track Ring */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active Glowing Rating Arc */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-emerald-400 transition-all duration-500 ease-out"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.45))'
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white text-glow-env">{overallScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Index Rating</span>
            </div>
          </div>

          {/* Employee weight toggle checkbox */}
          <button
            onClick={() => setWeightByEmployees(!weightByEmployees)}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
              weightByEmployees 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-white/5 border-white/5 text-brand-textMuted hover:bg-white/10'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Weight by Department Size
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-white/5">
              {weightByEmployees ? 'Active' : 'Off'}
            </span>
          </button>
        </GlassCard>

        {/* Dynamic Sliders Card */}
        <GlassCard hoverEffect={false} className="p-6 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Weight Configurations
            </h4>
            <button
              onClick={() => {
                if (isLocked) {
                  setIsLocked(false);
                } else {
                  setIsLocked(true);
                }
              }}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLocked 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {isLocked ? 'Locked' : 'Unlock Custom'}
            </button>
          </div>

          <div className="space-y-5">
            {/* Environmental Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Leaf className="w-3.5 h-3.5" /> Environmental
                </span>
                <span className="text-white">{weights.environmental}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isLocked}
                value={weights.environmental}
                onChange={(e) => handleWeightChange('environmental', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Social Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-violet-400 font-bold">
                  <HeartHandshake className="w-3.5 h-3.5" /> Social
                </span>
                <span className="text-white">{weights.social}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isLocked}
                value={weights.social}
                onChange={(e) => handleWeightChange('social', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-400 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Governance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Governance
                </span>
                <span className="text-white">{weights.governance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isLocked}
                value={weights.governance}
                onChange={(e) => handleWeightChange('governance', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {!isLocked && (
              <button
                onClick={resetToDefault}
                className="w-full mt-2 text-[10px] text-center text-slate-500 hover:text-white transition-colors underline flex items-center justify-center gap-1"
              >
                Reset to default (40% Env / 30% Soc / 30% Gov)
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recharts Bar Chart Breakdown by department */}
      <div className="lg:col-span-2">
        <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between p-6 bg-white/[0.01]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  Department Breakdown
                </h4>
                <p className="text-xs text-brand-textMuted mt-0.5">
                  Comparison of department performance and active weighted total indexes
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Hover bars to inspect values
              </span>
            </div>

            {/* Recharts responsive container */}
            <div className="w-full h-[320px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Environmental" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="Social" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="Governance" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="Weighted Total" fill="#ffffff" radius={[4, 4, 0, 0]} opacity={0.9} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Table Summary */}
          <div className="overflow-x-auto mt-6 border-t border-slate-800 pt-4">
            <table className="w-full text-[11px] text-left text-slate-400">
              <thead>
                <tr className="text-slate-100 border-b border-slate-800 pb-2">
                  <th className="pb-2 font-bold">Department</th>
                  <th className="pb-2 font-bold text-center">Employees</th>
                  <th className="pb-2 font-bold text-center text-emerald-400">E-Score</th>
                  <th className="pb-2 font-bold text-center text-indigo-400">S-Score</th>
                  <th className="pb-2 font-bold text-center text-amber-400">G-Score</th>
                  <th className="pb-2 font-bold text-right text-slate-100">Weighted Index</th>
                </tr>
              </thead>
              <tbody>
                {calculatedDepts.map((d) => (
                  <tr 
                    key={d.id} 
                    className={`border-b border-slate-800/40 hover:bg-slate-800/40 cursor-pointer transition-all ${
                      selectedDept?.id === d.id ? 'bg-slate-800 border-l-2 border-emerald-400 pl-2' : ''
                    }`}
                    onClick={() => setSelectedDept(d)}
                  >
                    <td className="py-2.5 font-semibold text-slate-100">{d.name}</td>
                    <td className="py-2.5 text-center">{d.employeeCount}</td>
                    <td className="py-2.5 text-center text-emerald-400/90 font-medium">{d.environmental}</td>
                    <td className="py-2.5 text-center text-indigo-400/90 font-medium">{d.social}</td>
                    <td className="py-2.5 text-center text-amber-400/90 font-medium">{d.governance}</td>
                    <td className="py-2.5 text-right font-bold text-slate-100">{d.weightedTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>

      {/* Advanced Analytics Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Compliance Chart */}
        <GlassCard hoverEffect={false} className="p-6 bg-white/[0.01] flex flex-col justify-between h-[360px]">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">E/S/G Compliance Radar</h4>
            <p className="text-xs text-brand-textMuted mb-4">Radar profile comparing department strengths across ESG criteria</p>
            <div className="w-full h-[250px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar name="Environmental" dataKey="Environmental" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Radar name="Social" dataKey="Social" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  <Radar name="Governance" dataKey="Governance" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(11, 15, 30, 0.85)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Carbon Offset Projections */}
        <GlassCard hoverEffect={false} className="p-6 bg-white/[0.01] flex flex-col justify-between h-[360px]">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Carbon Offset Projections (kg CO2)</h4>
            <p className="text-xs text-brand-textMuted mb-4">4-quarter impact forecasting based on current ESG Index ({overallScore})</p>
            <div className="w-full h-[250px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(11, 15, 30, 0.85)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" />
                  <Area type="monotone" name="Baseline (Low compliance)" dataKey="Baseline" stroke="#475569" fill="transparent" strokeDasharray="4 4" />
                  <Area type="monotone" name="Projected (Current index)" dataKey="Projected" stroke="#10b981" fillOpacity={1} fill="url(#projGrad)" strokeWidth={2} />
                  <Area type="monotone" name="Optimistic (Target path)" dataKey="Optimistic" stroke="#38bdf8" fillOpacity={1} fill="url(#optGrad)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Selected Department Details (AI ESG Insights & Policy Summarizer) */}
      {selectedDept && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8 pt-8 border-t border-brand-border">
          <div className="xl:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Sustainability Analyst Panel: {selectedDept.name}
                </h3>
                <p className="text-xs text-brand-textMuted mt-0.5">
                  Live predictive model and executive recommendation agents powered by EcoSphere GenAI
                </p>
              </div>
              <button 
                onClick={() => setSelectedDept(null)}
                className="text-xs font-bold text-slate-400 hover:text-white border border-white/5 px-3 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>

          {/* ESG Insights Card */}
          <div className="space-y-6">
            {loadingForecast ? (
              <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin h-6 w-6 text-blue-400" />
                <span className="text-xs text-slate-400 font-medium ml-3">Calculating carbon emissions forecast...</span>
              </div>
            ) : forecastError ? (
              <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs">
                {forecastError}
              </div>
            ) : forecast ? (
              <ESGInsightsCard 
                department={selectedDept} 
                forecastedCarbon={forecast.forecasted_carbon_amount}
                carbonTrend={forecast.trend}
              />
            ) : null}
          </div>

          {/* Policy Summarizer Card */}
          <div>
            <AIPolicySummaryCard />
          </div>
        </div>
      )}

    </div>
  );
};
export default ScoreWeights;
