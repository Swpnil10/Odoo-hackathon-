import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Search, 
  FileDown, 
  Check, 
  FileSpreadsheet, 
  Filter, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { filterMetadata } from '../data/mockData';
import type { ReportFilter } from '../types';
import GlassCard from './GlassCard';

interface AuditRecord {
  id: string;
  date: string;
  employee: string;
  department: string;
  module: string;
  challenge: string;
  category: 'Environmental' | 'Social' | 'Governance';
  offsetValue: number; // e.g. kg CO2 saved
}

const mockAuditLogs: AuditRecord[] = [
  { id: 'log-1', date: '2026-07-01', employee: 'Jane Doe', department: 'Operations', module: 'Gamification', challenge: 'Zero Waste Coffee Week', category: 'Environmental', offsetValue: 8 },
  { id: 'log-2', date: '2026-07-02', employee: 'John Smith', department: 'Engineering', module: 'Carbon Auditing', challenge: 'Commute Green Challenge', category: 'Environmental', offsetValue: 18 },
  { id: 'log-3', date: '2026-07-03', employee: 'Sarah Jenkins', department: 'Human Resources', module: 'Policy Training', challenge: 'Diversity & Inclusion Session', category: 'Social', offsetValue: 0 },
  { id: 'log-4', date: '2026-07-05', employee: 'Michael Chang', department: 'Finance & Legal', module: 'Supplier ESG Compliance', challenge: 'Whistleblower Policy Check', category: 'Governance', offsetValue: 0 },
  { id: 'log-5', date: '2026-07-06', employee: 'Jane Doe', department: 'Operations', module: 'Gamification', challenge: 'Digital Declutter Audit', category: 'Environmental', offsetValue: 4 },
  { id: 'log-6', date: '2026-07-08', employee: 'Emily Watson', department: 'Sales & Marketing', module: 'Gamification', challenge: 'Zero Waste Coffee Week', category: 'Environmental', offsetValue: 8 },
  { id: 'log-7', date: '2026-07-09', employee: 'John Smith', department: 'Engineering', module: 'Policy Training', challenge: 'Governance Ethics Training', category: 'Governance', offsetValue: 0 },
  { id: 'log-8', date: '2026-07-10', employee: 'Sarah Jenkins', department: 'Human Resources', module: 'Gamification', challenge: 'Volunteer at Local Food Bank', category: 'Social', offsetValue: 12 },
  { id: 'log-9', date: '2026-07-11', employee: 'Emily Watson', department: 'Sales & Marketing', module: 'Carbon Auditing', challenge: 'Commute Green Challenge', category: 'Environmental', offsetValue: 15 },
  { id: 'log-10', date: '2026-07-12', employee: 'Michael Chang', department: 'Finance & Legal', module: 'Policy Training', challenge: 'Governance Ethics Training', category: 'Governance', offsetValue: 0 }
];

export const ReportBuilder: React.FC = () => {
  // Default filter configuration
  const [filters, setFilters] = useState<ReportFilter>({
    department: 'All',
    startDate: '',
    endDate: '',
    module: 'All',
    employee: 'All',
    challenge: '',
    category: 'All'
  });

  const [activeLogs, setActiveLogs] = useState<AuditRecord[]>(mockAuditLogs);
  
  // Export process state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Filter application handler
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    
    const results = mockAuditLogs.filter(log => {
      // Department filter
      if (filters.department !== 'All' && log.department !== filters.department) return false;
      // Module filter
      if (filters.module !== 'All' && log.module !== filters.module) return false;
      // Employee filter
      if (filters.employee !== 'All' && log.employee !== filters.employee) return false;
      // Category filter
      if (filters.category !== 'All' && log.category !== filters.category) return false;
      // Challenge title search
      if (filters.challenge.trim() !== '' && !log.challenge.toLowerCase().includes(filters.challenge.toLowerCase())) return false;
      // Start date filter
      if (filters.startDate !== '' && new Date(log.date) < new Date(filters.startDate)) return false;
      // End date filter
      if (filters.endDate !== '' && new Date(log.date) > new Date(filters.endDate)) return false;

      return true;
    });

    setActiveLogs(results);
  };

  const handleResetFilters = () => {
    setFilters({
      department: 'All',
      startDate: '',
      endDate: '',
      module: 'All',
      employee: 'All',
      challenge: '',
      category: 'All'
    });
    setActiveLogs(mockAuditLogs);
  };

  // Export mock with loading shimmer
  const handleExport = (type: 'PDF' | 'CSV') => {
    setIsExporting(true);
    setExportSuccess(false);
    console.log(`Simulating audit export for format: ${type}`);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    }, 1800);
  };

  // Prepare chart data: aggregate offsets by date
  const dateMap: Record<string, number> = {};
  activeLogs.forEach(log => {
    dateMap[log.date] = (dateMap[log.date] || 0) + log.offsetValue;
  });
  const chartData = Object.keys(dateMap).sort().map(date => ({
    date,
    'Carbon Offsets (kg)': dateMap[date]
  }));

  // Statistics summaries
  const totalOffset = activeLogs.reduce((sum, log) => sum + log.offsetValue, 0);
  const totalRecords = activeLogs.length;
  const envRatio = Math.round((activeLogs.filter(l => l.category === 'Environmental').length / (totalRecords || 1)) * 100);

  return (
    <div className="space-y-6">
      
      {/* Search Filter Panel */}
      <GlassCard hoverEffect={false} className="p-6 bg-white/[0.01]">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Custom ESG Query Builder</h3>
        </div>

        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Department Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10"
            >
              <option value="All">All Departments</option>
              {filterMetadata.departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* ESG Category selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">ESG Pillar</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10"
            >
              <option value="All">All Categories</option>
              {filterMetadata.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Module selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">System Module</label>
            <select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10"
            >
              <option value="All">All Modules</option>
              {filterMetadata.modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Employee selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Employee Name</label>
            <select
              value={filters.employee}
              onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/10"
            >
              <option value="All">All Employees</option>
              {filterMetadata.employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/10"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/10"
            />
          </div>

          {/* Challenge title text filter */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Challenge Title Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-textMuted" />
              <input
                type="text"
                placeholder="Enter search terms..."
                value={filters.challenge}
                onChange={(e) => setFilters({ ...filters, challenge: e.target.value })}
                className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-white/10"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-brand-bg px-5 py-2 rounded-xl text-xs font-bold hover:scale-102 active:scale-98 shadow-md shadow-emerald-500/10"
            >
              Apply Filter Query
            </button>
          </div>

        </form>
      </GlassCard>

      {/* Analytics Visualizations */}
      {totalRecords > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Summary Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard hoverEffect={false} className="p-5 bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Offsets Logged</span>
              <h4 className="text-3xl font-extrabold text-white mt-1 leading-none text-glow-env">
                {totalOffset} <span className="text-sm font-normal text-brand-textMuted">kg CO2</span>
              </h4>
              <p className="text-[10px] text-brand-textMuted mt-2">
                Simulated environmental carbon offset savings generated from completed challenges
              </p>
            </GlassCard>

            <GlassCard hoverEffect={false} className="p-5 bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Audit Log Matches</span>
              <h4 className="text-3xl font-extrabold text-white mt-1 leading-none">
                {totalRecords} <span className="text-sm font-normal text-brand-textMuted">entries</span>
              </h4>
              <p className="text-[10px] text-brand-textMuted mt-2">
                Total audit entries matching active department, date, and pillar criteria
              </p>
            </GlassCard>

            <GlassCard hoverEffect={false} className="p-5 bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Environmental Focus Ratio</span>
              <h4 className="text-3xl font-extrabold text-emerald-400 mt-1 leading-none text-glow-env">
                {envRatio}%
              </h4>
              <p className="text-[10px] text-brand-textMuted mt-2">
                Percentage of filtered activities categorized as Environmental (E) ESG initiatives
              </p>
            </GlassCard>
          </div>

          {/* Recharts Area Chart */}
          <div className="lg:col-span-2">
            <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between p-6 bg-white/[0.01]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Audit Trend Analysis
                    </h4>
                    <p className="text-[11px] text-brand-textMuted">
                      Aggregated Environmental CO2 offsets compiled over filtered timeline
                    </p>
                  </div>
                  
                  {/* Export Buttons */}
                  <div className="flex gap-2 relative">
                    {isExporting ? (
                      <div className="bg-slate-900 border border-white/5 text-slate-400 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow shimmer">
                        <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        Generating Document...
                      </div>
                    ) : exportSuccess ? (
                      <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                        <Check className="w-3.5 h-3.5" /> Export Successful!
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleExport('CSV')}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> Export CSV
                        </button>
                        <button
                          onClick={() => handleExport('PDF')}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <FileDown className="w-3.5 h-3.5 text-slate-400" /> Export PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full h-[180px] text-xs">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} fontSize={10} />
                        <YAxis stroke="#94a3b8" tickLine={false} fontSize={10} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(11, 15, 30, 0.85)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area type="monotone" dataKey="Carbon Offsets (kg)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOffset)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Carbon offsets are zero for this filter selection.
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Tabular List Results */}
          <div className="lg:col-span-3">
            <GlassCard hoverEffect={false} className="p-0 overflow-hidden bg-white/[0.01]">
              <div className="px-6 py-4.5 border-b border-white/5 flex justify-between items-center">
                <h4 className="text-sm font-bold text-white">Compliance Verification Ledger</h4>
                <span className="text-[10px] text-brand-textMuted bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                  {totalRecords} records found
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-textMuted">
                  <thead>
                    <tr className="text-white bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-wider font-semibold">
                      <th className="px-6 py-3.5">Log ID</th>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Employee</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Module</th>
                      <th className="px-6 py-3.5">ESG Pillar</th>
                      <th className="px-6 py-3.5">Verified Task</th>
                      <th className="px-6 py-3.5 text-right">Offset Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-3 font-mono text-[10px] text-slate-400">{log.id}</td>
                        <td className="px-6 py-3">{log.date}</td>
                        <td className="px-6 py-3 font-semibold text-white">{log.employee}</td>
                        <td className="px-6 py-3">{log.department}</td>
                        <td className="px-6 py-3 text-slate-300">{log.module}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.category === 'Environmental' ? 'bg-emerald-500/10 text-emerald-400' :
                            log.category === 'Social' ? 'bg-violet-500/10 text-violet-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {log.category[0]}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-300 max-w-xs truncate" title={log.challenge}>{log.challenge}</td>
                        <td className="px-6 py-3 text-right font-bold text-emerald-400">{log.offsetValue > 0 ? `${log.offsetValue} kg` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-slate-500 mb-3" />
          <h4 className="text-sm font-semibold text-white">Ledger Query is Empty</h4>
          <p className="text-xs text-brand-textMuted mt-1 max-w-sm">
            No verified ledger events match your current filter parameters. Try expanding your date range or selecting "All" categories.
          </p>
        </div>
      )}

    </div>
  );
};
export default ReportBuilder;
