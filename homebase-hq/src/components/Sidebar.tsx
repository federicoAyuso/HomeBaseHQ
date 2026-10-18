import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Home,
  Users,
  Receipt,
  BellRing,
  Wrench,
  CloudUpload,
  Smartphone,
  Sparkles,
  X,
  Pin,
  PinOff,
  ChevronRight,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  unreadNotifCount: number;
  openTicketsCount: number;
  pendingRemindersCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  autoHideEnabled?: boolean;
  onToggleAutoHide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  unreadNotifCount,
  openTicketsCount,
  pendingRemindersCount,
  isMobileOpen = false,
  onCloseMobile,
  autoHideEnabled = true,
  onToggleAutoHide,
}) => {
  // When in auto-hide mode, is the floating drawer temporarily revealed?
  const [isHoverRevealed, setIsHoverRevealed] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Regions & Properties', icon: MapPin },
    { id: 'units', label: 'Units & Meter Serials', icon: Home },
    { id: 'tenants', label: 'Tenant Onboarding & KYC', icon: Users },
    { id: 'payments', label: 'Rent Payments & Receipts', icon: Receipt },
    { id: 'reminders', label: 'Automated Reminders', icon: BellRing, badge: pendingRemindersCount },
    { id: 'tickets', label: 'Maintenance Ticketing', icon: Wrench, badge: openTicketsCount },
    { id: 'google', label: 'Google Cloud Storage Sync', icon: CloudUpload },
    { id: 'notifications', label: 'Real-time Mobile Updates', icon: Smartphone, badge: unreadNotifCount },
    { id: 'ai', label: 'AI Property Copilot', icon: Sparkles, highlight: true },
  ];

  const totalBadges = (unreadNotifCount || 0) + (openTicketsCount || 0) + (pendingRemindersCount || 0);

  const handleSelectView = (id: string) => {
    setActiveView(id);
    setIsHoverRevealed(false);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (autoHideEnabled) {
      setIsHoverRevealed(true);
    }
  };

  const handleMouseLeave = () => {
    if (autoHideEnabled) {
      // 600ms grace period before auto-hiding
      hideTimeoutRef.current = setTimeout(() => {
        setIsHoverRevealed(false);
      }, 600);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Shared Sidebar Navigation Inner Content
  const renderSidebarContent = (isFloatingMode: boolean) => (
    <div
      className={`h-full min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between w-72 select-none liquid-glass transition-all duration-300 text-slate-200 ${
        isFloatingMode ? 'shadow-2xl border-white/20' : 'border-r border-white/10'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="space-y-3">
        {/* Header: Management Controls */}
        <div className="flex items-center justify-between pb-3.5 mb-1 px-1 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Management Controls
                </span>
              </div>
              <p className="text-[10px] text-cyan-300/80 font-medium">Liquid Glass Navigation</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto-Hide / Pin Mode Toggle */}
            {onToggleAutoHide && (
              <button
                onClick={onToggleAutoHide}
                className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                  autoHideEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30'
                    : 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/20'
                }`}
                title={
                  autoHideEnabled
                    ? 'Auto-Hide Active (Click to Pin permanently)'
                    : 'Pinned to screen (Click to enable Auto-Hide)'
                }
              >
                {autoHideEnabled ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold hidden sm:inline">Auto-Hide</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold hidden sm:inline">Pinned</span>
                  </>
                )}
              </button>
            )}

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Auto-Hide Mode Guide Tag */}
        {autoHideEnabled && (
          <div className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-400/20 text-[11px] text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Auto-hides when cursor exits
            </span>
            <button
              onClick={onToggleAutoHide}
              className="text-[10px] underline hover:text-white text-indigo-200"
            >
              Pin
            </button>
          </div>
        )}

        {/* Menu Items List */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 via-indigo-500/80 to-purple-600/80 text-white shadow-lg shadow-indigo-500/25 border border-white/30 font-semibold'
                    : item.highlight
                    ? 'liquid-glass-pill text-cyan-200 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-950/30 border border-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/15 border border-transparent'
                }`}
              >
                {/* Subtle active specular beam */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none" />
                )}

                <div className="flex items-center gap-3 min-w-0 relative z-10">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-cyan-400'
                        : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Badge Indicator */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 relative z-10 transition-all ${
                      isActive
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : 'bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Cloud Storage Sync */}
      <div className="mt-4 pt-3.5 border-t border-white/10">
        <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Storage Sync</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-emerald-300 font-semibold">Active AES-256</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
          </div>
          <button
            onClick={() => handleSelectView('google')}
            className="w-full liquid-btn-primary text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Sync Cloud Data</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* CASE 1: FIXED / PINNED MODE ON DESKTOP */}
      {!autoHideEnabled && (
        <aside className="hidden md:block shrink-0 w-72 h-full z-20">
          {renderSidebarContent(false)}
        </aside>
      )}

      {/* CASE 2: AUTO-HIDE MODE ON DESKTOP */}
      {autoHideEnabled && (
        <>
          {/* Floating Liquid Glass Edge Dock Trigger */}
          <div
            className="hidden md:block fixed left-0 top-24 z-30 group"
            onMouseEnter={handleMouseEnter}
          >
            <button
              onClick={() => setIsHoverRevealed(true)}
              className="liquid-glass-dock px-3 py-3 rounded-r-2xl border-l-0 text-slate-200 hover:text-white flex items-center gap-2.5 shadow-2xl transition-all duration-300 hover:pr-4 cursor-pointer hover:border-cyan-400/40"
              title="Expand Management Controls (Auto-Hide is Active)"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <Sliders className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-bold tracking-tight text-white hidden lg:inline">
                  Controls
                </span>
              </div>

              {totalBadges > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/80 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                  {totalBadges}
                </span>
              )}

              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Floating Liquid Glass Drawer when hovered/active in Auto-Hide mode */}
          <div
            className={`hidden md:block fixed left-0 top-16 bottom-0 z-40 transition-transform duration-300 ease-out ${
              isHoverRevealed ? 'translate-x-0' : '-translate-x-full'
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {renderSidebarContent(true)}
          </div>

          {/* Subtle click-outside backdrop when revealed in Auto-Hide */}
          {isHoverRevealed && (
            <div
              className="hidden md:block fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity"
              onClick={() => setIsHoverRevealed(false)}
            />
          )}
        </>
      )}

      {/* CASE 3: MOBILE DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl flex flex-col">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
