import React, { useState, useEffect } from 'react';

interface ESGMetrics {
  department: string;
  environment_score: number;
  social_score: number;
  governance_score: number;
  carbon_emission: number;
  previous_carbon_emission: number;
  csr_participation: number;
  pending_compliance: number;
}

interface ESGInsightsCardProps {
  metrics: ESGMetrics;
  onGenerateInsights: (metrics: ESGMetrics) => Promise<{ overall_health: string; insight: string }>;
  autoTrigger?: boolean;
}

export const ESGInsightsCard: React.FC<ESGInsightsCardProps> = ({
  metrics,
  onGenerateInsights,
  autoTrigger = false,
}) => {
  const [overallHealth, setOverallHealth] = useState<string>('');
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const result = await onGenerateInsights(metrics);
      setOverallHealth(result.overall_health);
      setInsight(result.insight);
    } catch (err: any) {
      setError(err.message || "Failed to generate ESG insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTrigger && metrics && metrics.department) {
      handleGenerate();
    }
  }, [metrics]);

  const handleCopy = () => {
    if (!insight) return;
    const copiedText = `Overall ESG Health: ${overallHealth}\n\n${insight}`;
    navigator.clipboard.writeText(copiedText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setError("Failed to copy to clipboard.");
      });
  };

  const getHealthBadgeClass = (health: string) => {
    const norm = health.toLowerCase();
    if (norm.includes("excellent")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
    if (norm.includes("good")) return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900";
    if (norm.includes("fair") || norm.includes("average")) return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900";
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  // Compare carbon emissions
  const emissionDiff = metrics.carbon_emission - metrics.previous_carbon_emission;
  const isEmissionUp = emissionDiff > 0;

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden font-sans">
      {/* Accent Header Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />

      <div className="p-6 sm:p-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI ESG Insights Engine
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Google Gemini analytics for {metrics.department || "Selected Department"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {insight && !loading && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : insight ? (
                "Re-analyze"
              ) : (
                "Generate Insights"
              )}
            </button>
          </div>
        </div>

        {/* Department Metrics Summary Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-xl mb-6">
          <div className="text-center sm:border-r border-slate-200 dark:border-slate-800 p-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Environment</span>
            <div className={`text-xl font-extrabold mt-1 ${getScoreColorClass(metrics.environment_score)}`}>
              {metrics.environment_score}/100
            </div>
          </div>
          <div className="text-center sm:border-r border-slate-200 dark:border-slate-800 p-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Social Score</span>
            <div className={`text-xl font-extrabold mt-1 ${getScoreColorClass(metrics.social_score)}`}>
              {metrics.social_score}/100
            </div>
          </div>
          <div className="text-center sm:border-r border-slate-200 dark:border-slate-800 p-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Governance</span>
            <div className={`text-xl font-extrabold mt-1 ${getScoreColorClass(metrics.governance_score)}`}>
              {metrics.governance_score}/100
            </div>
          </div>
          <div className="text-center p-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Carbon footprint</span>
            <div className="text-base font-extrabold mt-1 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
              <span>{metrics.carbon_emission} t</span>
              <span className={`text-[10px] font-medium flex items-center ${isEmissionUp ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isEmissionUp ? '▲' : '▼'} {Math.abs(emissionDiff)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        {loading && (
          <div className="space-y-6 animate-pulse py-2">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-500 dark:text-rose-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Insights Failed</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
              <button
                onClick={handleGenerate}
                className="text-xs font-semibold text-rose-800 dark:text-rose-300 underline mt-2 hover:text-rose-950 dark:hover:text-rose-100"
              >
                Click here to retry analysis
              </button>
            </div>
          </div>
        )}

        {insight && !loading && !error && (
          <div className="space-y-4">
            {/* Health rating banner */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Overall Department ESG Health:</span>
              <span className={`px-2.5 py-1 text-xs font-extrabold uppercase rounded-full border ${getHealthBadgeClass(overallHealth)}`}>
                {overallHealth}
              </span>
            </div>

            {/* AI insight text */}
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line py-2">
              {insight}
            </div>
          </div>
        )}

        {!insight && !loading && !error && (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
            <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">Insights dashboard is empty</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto px-4">
              Click the Generate Insights button above to request an overall health analysis and actionable risk mitigation reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
