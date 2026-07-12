import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api, APIError } from '../utils/api';

export const AIPolicySummaryCard: React.FC = () => {
  const [policyText, setPolicyText] = useState<string>('');
  const [summary, setSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSummarize = async () => {
    const trimmed = policyText.trim();
    if (!trimmed || trimmed.length < 10) {
      setError("Policy text must be at least 10 characters long to summarize.");
      setSummary([]);
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await api.summarizePolicy({ policy_text: trimmed });
      if (response && response.summary_bullets && response.summary_bullets.length === 3) {
        setSummary(response.summary_bullets);
      } else {
        throw new Error("Invalid response format received from the server.");
      }
    } catch (err: any) {
      if (err instanceof APIError) {
        setError(err.detail);
      } else {
        setError(err.message || "An unexpected error occurred during summarization.");
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl p-6 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            AI Policy Summarizer
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distill dense corporate policies into actionable employee tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary.length > 0 && !loading && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy checklist"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Checklist
                </>
              )}
            </button>
          )}
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {summary.length > 0 ? "Regenerate" : "Summarize Policy"}
              </>
            )}
          </button>
        </div>
      </div>

        {/* Input Textarea */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            ESG Policy Text Input
          </label>
          <textarea
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Paste or write your long-form corporate ESG policy rules here (minimum 10 characters)..."
            className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all font-sans leading-relaxed resize-none"
          />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 py-2 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-5 h-5 bg-slate-800 rounded-full flex-shrink-0" />
                <div className="w-full space-y-1.5 pt-1">
                  <div className="h-3 bg-slate-800 rounded w-11/12" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Notification */}
        {error && !loading && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-300">Summarization Failed</p>
              <p className="text-[11px] text-rose-400 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Bullets Display */}
        {summary.length > 0 && !loading && !error && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 mb-3 block">
              Actionable Compliance Checklist
            </span>
            <ul className="space-y-3.5">
              {summary.map((bullet, idx) => (
                <li key={idx} className="flex gap-3 items-start group">
                  <span className="flex items-center justify-center min-w-[20px] h-[20px] text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed pt-0.5 font-medium">
                    {bullet}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.length === 0 && !loading && !error && (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <FileText className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-400 mt-3">No summary generated yet</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto px-4">
              Enter your policy text in the workspace above and click Summarize Policy.
            </p>
          </div>
        )}
    </div>
  );
};
export default AIPolicySummaryCard;
