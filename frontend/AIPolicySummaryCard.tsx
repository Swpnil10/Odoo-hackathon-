import React, { useState, useEffect } from 'react';

interface AIPolicySummaryCardProps {
  policyText: string;
  onSummarize: (text: string) => Promise<string[]>;
  autoTrigger?: boolean;
}

export const AIPolicySummaryCard: React.FC<AIPolicySummaryCardProps> = ({
  policyText,
  onSummarize,
  autoTrigger = false,
}) => {
  const [summary, setSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchSummary = async () => {
    if (!policyText || policyText.trim().length < 10) {
      setError("Policy text must be at least 10 characters long to summarize.");
      setSummary([]);
      return;
    }
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const result = await onSummarize(policyText);
      if (result && result.length === 3) {
        setSummary(result);
      } else {
        throw new Error("Invalid response format received from AI.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during summarization.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTrigger && policyText && policyText.trim().length >= 10) {
      fetchSummary();
    }
  }, [policyText]);

  const handleCopy = () => {
    if (summary.length === 0) return;
    const formattedText = summary.map(bullet => `• ${bullet}`).join('\n');
    navigator.clipboard.writeText(formattedText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setError("Failed to copy to clipboard.");
      });
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden font-sans">
      {/* Decorative Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 to-emerald-500" />
      
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AI Policy Summarizer
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Google Gemini powered key actions & compliance checklist
            </p>
          </div>

          <div className="flex items-center gap-2">
            {summary.length > 0 && !loading && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Copy to clipboard"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : summary.length > 0 ? (
                "Regenerate"
              ) : (
                "Summarize"
              )}
            </button>
          </div>
        </div>

        {/* Content States */}
        {loading && (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="flex gap-4">
              <div className="min-w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-full space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-11/12" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="min-w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-full space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-10/12" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-8/12" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="min-w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-full space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-9/12" />
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-500 dark:text-rose-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Summarization Failed</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
              <button
                onClick={fetchSummary}
                className="text-xs font-semibold text-rose-800 dark:text-rose-300 underline mt-2 hover:text-rose-950 dark:hover:text-rose-100"
              >
                Click here to retry
              </button>
            </div>
          </div>
        )}

        {summary.length > 0 && !loading && !error && (
          <ul className="space-y-4 py-2">
            {summary.map((bullet, idx) => (
              <li key={idx} className="flex gap-4 items-start group">
                <span className="flex items-center justify-center min-w-[24px] h-[24px] text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full border border-teal-100 dark:border-teal-900 group-hover:scale-110 transition-transform">
                  {idx + 1}
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pt-0.5">
                  {bullet}
                </p>
              </li>
            ))}
          </ul>
        )}

        {summary.length === 0 && !loading && !error && (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
            <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">No summary generated yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto px-4">
              Provide your ESG policy text above and click the Summarize button to extract the core points.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
