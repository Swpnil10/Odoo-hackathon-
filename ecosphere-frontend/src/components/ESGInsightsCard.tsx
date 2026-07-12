import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Copy, Check, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { api, APIError } from '../utils/api';
import type { ESGInsightsResponse } from '../utils/api';
import type { DepartmentScore } from '../types';

interface ESGInsightsCardProps {
  department: DepartmentScore;
  forecastedCarbon: number;
  carbonTrend: string;
}

export const ESGInsightsCard: React.FC<ESGInsightsCardProps> = ({
  department,
  forecastedCarbon,
  carbonTrend
}) => {
  const [insights, setInsights] = useState<ESGInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Clear previous insights when department changes to allow fresh queries
  useEffect(() => {
    setInsights(null);
    setError(null);
  }, [department]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    // Map department-specific compliance issues for rich AI context
    let complianceIssues: string[] = [];
    if (department.name.includes("Engineering")) {
      complianceIssues = ["Anomalous server rack electricity spike", "Missing hardware recycling logs"];
    } else if (department.name.includes("Sales")) {
      complianceIssues = ["Corporate travel offset quota exceeded"];
    } else if (department.name.includes("Operations")) {
      complianceIssues = ["Delayed toxic packaging audit documentation"];
    } else if (department.name.includes("Finance")) {
      complianceIssues = ["Anti-bribery training compliance gap"];
    }

    const payload = {
      department_name: department.name,
      env_score: department.environmental,
      social_score: department.social,
      gov_score: department.governance,
      forecasted_carbon: forecastedCarbon,
      open_compliance_issues: complianceIssues
    };

    try {
      const response = await api.generateInsights(payload);
      if (response && response.status_summary && response.actionable_recommendations.length === 3) {
        setInsights(response);
      } else {
        throw new Error("Invalid response format received from ESG Insights service.");
      }
    } catch (err: any) {
      if (err instanceof APIError) {
        setError(err.detail);
      } else {
        setError(err.message || "Failed to generate ESG insights.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!insights) return;
    const copiedText = `ESG Report Summary: ${insights.status_summary}\n\nAction Items:\n${insights.actionable_recommendations.map(r => `• ${r}`).join('\n')}`;
    navigator.clipboard.writeText(copiedText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setError("Failed to copy to clipboard.");
      });
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />;
    if (trend === 'decreasing') return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />;
    return <Activity className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getTrendColorClass = (trend: string) => {
    if (trend === 'increasing') return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    if (trend === 'decreasing') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    return 'text-slate-300 border-white/5 bg-white/[0.02]';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 flex flex-col space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            AI ESG Insights Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            CSO Sustainability Analytics for {department.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {insights && !loading && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Insights
                </>
              )}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                {insights ? "Re-Analyze" : "Generate ESG Insights"}
              </>
            )}
          </button>
        </div>
      </div>

        {/* Dashboard Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-5">
          <div className="text-center sm:border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Environmental</span>
            <div className={`text-sm font-black mt-1 ${getScoreColorClass(department.environmental)}`}>
              {department.environmental}/100
            </div>
          </div>
          <div className="text-center sm:border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Social Score</span>
            <div className={`text-sm font-black mt-1 ${getScoreColorClass(department.social)}`}>
              {department.social}/100
            </div>
          </div>
          <div className="text-center sm:border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Governance</span>
            <div className={`text-sm font-black mt-1 ${getScoreColorClass(department.governance)}`}>
              {department.governance}/100
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Carbon Forecast</span>
            <div className="text-xs font-black mt-1 text-slate-300 flex items-center justify-center gap-1.5">
              <span>{forecastedCarbon} kg</span>
              <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full flex items-center gap-0.5 ${getTrendColorClass(carbonTrend)}`}>
                {getTrendIcon(carbonTrend)}
                {carbonTrend}
              </span>
            </div>
          </div>
        </div>

        {/* Loading details */}
        {loading && (
          <div className="space-y-6 animate-pulse py-2">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-800 rounded w-1/4" />
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-11/12" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-5/6" />
              <div className="h-3 bg-slate-800 rounded w-4/5" />
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && !loading && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-300">Insights Generation Failed</p>
              <p className="text-[11px] text-rose-400 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Insights Results */}
        {insights && !loading && !error && (
          <div className="space-y-5">
            {/* Status Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <span className="text-[9px] uppercase tracking-widest font-black text-blue-400 mb-2 block">
                Executive Performance Summary
              </span>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                {insights.status_summary}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <span className="text-[9px] uppercase tracking-widest font-black text-indigo-400 mb-3 block">
                Actionable Sustainability Steps
              </span>
              <ul className="space-y-3">
                {insights.actionable_recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex gap-3 items-start group">
                    <span className="flex items-center justify-center min-w-[20px] h-[20px] text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      {idx + 1}
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed pt-0.5 font-medium">
                      {recommendation}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!insights && !loading && !error && (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <ShieldCheck className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-400 mt-3">ESG Analysis is empty</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto px-4">
              Click the Generate ESG Insights button above to run sustainability analysis.
            </p>
          </div>
        )}
    </div>
  );
};
export default ESGInsightsCard;
