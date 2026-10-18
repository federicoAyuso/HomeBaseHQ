import React, { useState } from 'react';
import { SystemNotification } from '../types';
import { Smartphone, Bell, CheckCheck, RefreshCw, Send, Volume2, ShieldCheck, Receipt, Wrench, Users } from 'lucide-react';

interface MobileNotificationTrayProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onTriggerTestNotification: () => void;
}

export const MobileNotificationTray: React.FC<MobileNotificationTrayProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onTriggerTestNotification,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getNotifIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'payment':
        return <Receipt className="w-4 h-4 text-emerald-400" />;
      case 'ticket':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case 'kyc':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'google':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <span>Mobile Notification & Real-Time Alert System</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live push notifications for rent payments, ticket updates, reminders, and cloud backups
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              soundEnabled
                ? 'liquid-glass-pill text-cyan-300 border-cyan-400/30 bg-cyan-500/10'
                : 'liquid-glass-subtle text-slate-400 border-white/10'
            }`}
            title="Toggle Audio Sound Effect"
          >
            <Volume2 className="w-4 h-4" />
            <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onTriggerTestNotification}
            className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Mobile Push Alert</span>
          </button>
        </div>
      </div>

      {/* Notifications Tray Card */}
      <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Status Stream
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-bold">
              {notifications.filter((n) => !n.read).length} Unread Alerts
            </span>
          </div>

          <button
            onClick={onMarkAllRead}
            className="text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 font-semibold transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Notifications Feed List */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkRead(notif.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                notif.read
                  ? 'liquid-glass-subtle opacity-70 border-white/5'
                  : 'liquid-glass border-cyan-400/30 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/10 shrink-0">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-white truncate">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
