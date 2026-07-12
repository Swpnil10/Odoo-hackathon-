import React, { useState, useRef, useEffect } from 'react';

interface ESGMetrics {
  department: string;
  environment_score: number;
  social_score: number;
  governance_score: number;
  carbon_emission: number;
  csr_participation: number;
  pending_compliance: number;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface SustainabilityAdvisorChatProps {
  metrics: ESGMetrics;
  onAskAdvisor: (question: string, metrics: ESGMetrics) => Promise<string>;
}

const SUGGESTED_PROMPTS = [
  "How can we improve our ESG score?",
  "Why did our Environmental score decrease?",
  "Suggest CSR activities for our department.",
  "Which compliance issues should we prioritize?",
  "Recommend sustainability improvements."
];

export const SustainabilityAdvisorChat: React.FC<SustainabilityAdvisorChatProps> = ({
  metrics,
  onAskAdvisor,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am your EcoSphere Sustainability Advisor. I have loaded the performance metrics for the **${metrics.department}** department. 

How can I help you improve your carbon footprint, social engagement, or governance compliance today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    // Append user message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const botAnswer = await onAskAdvisor(trimmed, metrics);
      const botMsg: Message = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: botAnswer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve response from the advisor.");
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        sender: 'bot',
        text: "⚠️ Sorry, I encountered an issue reaching the AI service. Please click the Retry button below or re-submit your question.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(msgId);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        setError("Failed to copy message.");
      });
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `Hello! I am your EcoSphere Sustainability Advisor. I have loaded the performance metrics for the **${metrics.department}** department. 

How can I help you improve your carbon footprint, social engagement, or governance compliance today?`,
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden font-sans min-h-[600px]">
      
      {/* Sidebar: Department Context */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-indigo-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Context Dashboard</h4>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{metrics.department}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Environmental Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics.environment_score}%` }} />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{metrics.environment_score}/100</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Social Engagement Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${metrics.social_score}%` }} />
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{metrics.social_score}/100</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Governance Compliance Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${metrics.governance_score}%` }} />
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{metrics.governance_score}/100</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Carbon</span>
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{metrics.carbon_emission} t</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">CSR Rate</span>
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{metrics.csr_participation}%</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-400">Pending Compliances:</span>
              <span className="px-2 py-0.5 text-xs font-black bg-rose-500 text-white rounded-md">{metrics.pending_compliance}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="mt-6 flex items-center justify-center gap-1.5 w-full py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Conversation
        </button>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-[600px] bg-slate-50 dark:bg-slate-950">
        
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Profile Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 select-none ${
                msg.sender === 'user'
                  ? 'bg-indigo-500 text-white font-bold'
                  : 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-extrabold shadow-sm'
              }`}>
                {msg.sender === 'user' ? 'U' : 'AI'}
              </div>

              {/* Message Block */}
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl relative group ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line prose dark:prose-invert">
                    {msg.text}
                  </p>

                  {/* Copy Button (on Hover) */}
                  {msg.id !== 'welcome' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className={`absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                        msg.sender === 'user' ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className={`text-[10px] text-slate-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-end">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 select-none">
                AI
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        <div className="px-6 py-2 flex gap-2 overflow-x-auto select-none no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-600 dark:text-slate-300 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            disabled={loading}
            placeholder={loading ? "AI Advisor is drafting a response..." : "Ask your sustainability consultant..."}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white rounded-xl transition-all shadow cursor-pointer disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

      </div>

    </div>
  );
};
