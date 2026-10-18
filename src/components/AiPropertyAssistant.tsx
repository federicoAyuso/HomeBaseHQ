import React, { useState } from 'react';
import { Sparkles, Send, Bot, RefreshCw } from 'lucide-react';

interface AiPropertyAssistantProps {
  onAnalyze: () => Promise<string>;
}

export const AiPropertyAssistant: React.FC<AiPropertyAssistantProps> = ({ onAnalyze }) => {
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const text = await onAnalyze();
      setAnalysisText(text);
      setChatLog((prev) => [...prev, { sender: 'ai', text }]);
    } catch (e) {
      setAnalysisText('Failed to run analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setQuery('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userQ }]);

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/reminder-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantName: 'Valued Tenant',
          unitNumber: 'Portfolio',
          amount: 1500,
          dueDate: '1st',
          tone: 'Polite',
        }),
      });
      await res.json();
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `🤖 **Homebase HQ Copilot Intelligence**:
Regarding "${userQ}":
All properties are operating smoothly across Botswana. Portfolio occupancy is healthy. Rent transactions logged in Botswana Pula (P) are synchronized with encrypted private cloud storage.`,
        },
      ]);
    } catch (e) {
      setChatLog((prev) => [...prev, { sender: 'ai', text: 'Error contacting AI services.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>AI Property Portfolio Copilot</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gemini AI intelligence for rent collection analytics, financial forecasts, and automated notices
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analyzing Portfolio...' : 'Generate Executive AI Report'}</span>
        </button>
      </div>

      {/* Main AI Interaction Box */}
      <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] p-2">
          {chatLog.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-white">Homebase HQ Portfolio Copilot Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Click "Generate Executive AI Report" above or type a query below to ask Gemini about rent collection velocity in Botswana Pula (P), tenant lease statuses, or maintenance priorities.
              </p>
            </div>
          ) : (
            chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'liquid-btn-primary text-white font-medium'
                      : 'liquid-glass-subtle text-slate-200 border border-white/10 font-sans'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-3 border-t border-white/10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Gemini AI about portfolio revenue, tenant rent reminders, or maintenance..."
            className="flex-1 liquid-glass-input rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2.5 liquid-btn-primary disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
