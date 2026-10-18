import React, { useState } from 'react';
import { User } from '../types';
import {
  Building2,
  Bell,
  Cloud,
  CloudCheck,
  UserCheck,
  ChevronDown,
  Sparkles,
  PlusCircle,
  PanelLeft,
  Pin,
  EyeOff,
  LogOut,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onSwitchUser: (username: string) => void;
  onLogout?: () => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenGoogleSync: () => void;
  onOpenQuickAction: (action: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onToggleSidebar?: () => void;
  autoHideEnabled?: boolean;
  onToggleAutoHide?: () => void;
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSwitchUser,
  onLogout,
  unreadNotifCount,
  onOpenNotifications,
  onOpenGoogleSync,
  onOpenQuickAction,
  activeView,
  setActiveView,
  onToggleSidebar,
  autoHideEnabled = true,
  onToggleAutoHide,
  onResetData,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 text-white shadow-lg shadow-black/20 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Toggle Management Controls"
            >
              <PanelLeft className="w-5 h-5 text-cyan-300" />
            </button>
          )}

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveView('dashboard')}
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform bg-slate-900 shrink-0">
              <img
                src="/logo.png"
                alt="Homebase Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                  Homebase HQ
                </span>
                <span className="text-[9px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full tracking-wider uppercase shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                  Liquid Glass
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Botswana Rental & Asset Management Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Auto-Hide / Pin Mode Indicator & Switch in Top Bar */}
          {onToggleAutoHide && (
            <button
              onClick={onToggleAutoHide}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition cursor-pointer ${
                autoHideEnabled
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20'
                  : 'bg-white/[0.06] border-white/15 text-slate-300 hover:bg-white/10'
              }`}
              title={
                autoHideEnabled
                  ? 'Auto-Hide is Active (Sidebar tucks away when not in use). Click to Pin.'
                  : 'Sidebar is Pinned to layout. Click to enable Auto-Hide.'
              }
            >
              {autoHideEnabled ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auto-Hide Mode</span>
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5 text-slate-300" />
                  <span>Pinned Mode</span>
                </>
              )}
            </button>
          )}

          {/* Reset Demo Data Button for Testing */}
          {onResetData && (
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data to initial testing state with clean available units and 1 pending applicant (Kagiso Modise)?')) {
                  onResetData();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold transition cursor-pointer"
              title="Reset all units and tenant records to clean test state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset Demo Data</span>
            </button>
          )}

          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl liquid-btn-primary text-white text-xs font-semibold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-cyan-200" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-56 liquid-glass rounded-2xl shadow-2xl py-1.5 z-50 text-xs border border-white/20 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Create / Action
                </div>
                <button
                  onClick={() => {
                    onOpenQuickAction('payment');
                    setShowQuickMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                >
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💳</span>
                  <span>Log Rent Payment (BWP)</span>
                </button>
                <button
                  onClick={() => {
                    onOpenQuickAction('tenant');
                    setShowQuickMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                >
                  <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">👤</span>
                  <span>Onboard New Tenant</span>
                </button>
                <button
                  onClick={() => {
                    onOpenQuickAction('ticket');
                    setShowQuickMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                >
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">🔧</span>
                  <span>Log Maintenance Ticket</span>
                </button>
                <button
                  onClick={() => {
                    onOpenQuickAction('reminder');
                    setShowQuickMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition"
                >
                  <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⏰</span>
                  <span>Send Payment Reminder</span>
                </button>
              </div>
            )}
          </div>

          {/* Google Private Cloud Sync Badge */}
          <button
            onClick={onOpenGoogleSync}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              user?.googleConnected
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/15 border-amber-400/30 text-amber-300 hover:bg-amber-500/25'
            }`}
            title="Private Cloud Storage & Google Drive / Sheets Sync Status"
          >
            {user?.googleConnected ? (
              <CloudCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Cloud className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
            <span className="hidden lg:inline font-medium">
              {user?.googleConnected ? 'Google Cloud Synced' : 'Sync Identity'}
            </span>
          </button>

          {/* Mobile Notifications Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl liquid-glass-pill text-slate-300 hover:text-white transition cursor-pointer"
            title="Real-time Mobile Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md shadow-rose-500/50">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* User Account & Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl liquid-glass-pill text-slate-200 hover:text-white transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {user?.name.charAt(0) || 'M'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">
                  {user?.name || 'Miranda E Cavanagh'}
                </p>
                <p className="text-[10px] text-cyan-300 capitalize">
                  {user?.role === 'main' ? 'Owner (Main)' : user?.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 liquid-glass rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-white/10">
                  <p className="text-xs font-bold text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-300 font-semibold">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>Role: {user?.role.toUpperCase()} ACCOUNT</span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Switch Shared Account View
                </div>

                <button
                  onClick={() => {
                    onSwitchUser('Miranda');
                    setShowUserDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition ${
                    user?.username === 'Miranda' || user?.username === 'Miranda E Cavanagh'
                      ? 'text-cyan-300 font-bold bg-white/10'
                      : 'text-slate-300'
                  }`}
                >
                  <span>Miranda E Cavanagh</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold px-1.5 py-0.5 rounded">
                    Owner
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSwitchUser('Federico');
                    setShowUserDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition ${
                    user?.username === 'Federico' || user?.username === 'admin'
                      ? 'text-cyan-300 font-bold bg-white/10'
                      : 'text-slate-300'
                  }`}
                >
                  <span>Federico</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSwitchUser('tenant');
                    setShowUserDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition ${
                    user?.username === 'tenant'
                      ? 'text-cyan-300 font-bold bg-white/10'
                      : 'text-slate-300'
                  }`}
                >
                  <span>Marcus Vance (Tenant)</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold px-1.5 py-0.5 rounded">
                    Portal
                  </span>
                </button>

                {onLogout && (
                  <div className="pt-2 mt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
