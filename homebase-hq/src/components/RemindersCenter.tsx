import React, { useState } from 'react';
import { Reminder, Tenant, Unit } from '../types';
import { BellRing, Send, Sparkles, Plus, CheckCircle, Clock, MessageSquare, X } from 'lucide-react';

interface RemindersCenterProps {
  reminders: Reminder[];
  tenants: Tenant[];
  units: Unit[];
  onCreateReminder: (data: {
    tenantId: string;
    dueDate: string;
    amount: number;
    message: string;
    channel: Reminder['channel'];
    tone: Reminder['tone'];
  }) => void;
  onSendReminder: (id: string) => void;
}

export const RemindersCenter: React.FC<RemindersCenterProps> = ({
  reminders,
  tenants,
  units,
  onCreateReminder,
  onSendReminder,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState(1500);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<Reminder['channel']>('WhatsApp');
  const [tone, setTone] = useState<Reminder['tone']>('Polite');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleAiDraft = async () => {
    const tenant = tenants.find((t) => t.id === tenantId);
    const unit =
      tenant && tenant.assignedUnitIds.length > 0
        ? units.find((u) => u.id === tenant.assignedUnitIds[0])
        : null;

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/reminder-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantName: tenant?.name || 'Tenant',
          unitNumber: unit?.unitNumber || 'Unit',
          amount,
          dueDate: dueDate || '1st of the month',
          tone,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !dueDate || !amount) return;

    onCreateReminder({
      tenantId,
      dueDate,
      amount: Number(amount),
      message: message || `Rent payment of P${amount} is due on ${dueDate}.`,
      channel,
      tone,
    });

    setTenantId('');
    setDueDate('');
    setMessage('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <BellRing className="w-5 h-5" />
            </div>
            <span>Automated Rent Payment Reminders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule WhatsApp, SMS, or Email payment reminders with AI message drafting in Botswana (P)
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 text-cyan-200" />
          <span>Schedule New Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reminders.map((rem) => {
          const tenant = tenants.find((t) => t.id === rem.tenantId);

          return (
            <div
              key={rem.id}
              className="liquid-glass-card rounded-2xl p-5 space-y-3.5 hover:border-cyan-400/30 transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{tenant?.name || 'Tenant'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Due Date: <span className="text-amber-400 font-bold">{rem.dueDate}</span> • Amount Due:{' '}
                    <span className="font-bold text-emerald-400">P{rem.amount.toLocaleString()}</span>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase border ${
                    rem.status === 'Sent'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {rem.status === 'Sent' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{rem.status}</span>
                </span>
              </div>

              {/* Message Box */}
              <div className="p-3.5 rounded-xl liquid-glass-subtle border border-white/10 text-xs text-slate-200 leading-relaxed font-mono">
                "{rem.message}"
              </div>

              {/* Footer Channel & Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Channel: {rem.channel}</span>
                  <span className="text-[10px] liquid-glass-pill px-2 py-0.5 rounded-md text-cyan-300 font-semibold border border-white/10">
                    {rem.tone} Tone
                  </span>
                </div>

                {rem.status !== 'Sent' && (
                  <button
                    onClick={() => onSendReminder(rem.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-cyan-400" />
                <span>Schedule Automated Reminder</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Tenant *</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-white">Select Tenant</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name} ({t.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Amount Due (P) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Payment Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Dispatch Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as Reminder['channel'])}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value="WhatsApp" className="bg-slate-900 text-white">WhatsApp</option>
                    <option value="Email" className="bg-slate-900 text-white">Email</option>
                    <option value="SMS" className="bg-slate-900 text-white">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Message Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Reminder['tone'])}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value="Polite" className="bg-slate-900 text-white">Polite</option>
                    <option value="Firm" className="bg-slate-900 text-white">Firm</option>
                    <option value="Urgent" className="bg-slate-900 text-white">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Message Content</label>
                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={isGeneratingAi}
                    className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isGeneratingAi ? 'Drafting...' : 'AI Draft Message'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Click AI Draft Message above or type custom reminder text..."
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
