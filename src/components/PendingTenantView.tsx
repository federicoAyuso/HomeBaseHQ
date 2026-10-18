import React, { useState } from 'react';
import { User, Tenant, Unit, Property } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  User as UserIcon,
  Mail,
  Phone,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Building,
  KeyRound,
  FileCheck,
} from 'lucide-react';

interface PendingTenantViewProps {
  user: User;
  onLogout: () => void;
  onRefresh: () => void;
  onSwitchToManager?: () => void;
}

export const PendingTenantView: React.FC<PendingTenantViewProps> = ({
  user,
  onLogout,
  onRefresh,
  onSwitchToManager,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200 liquid-bg-mesh relative overflow-hidden select-none">
      {/* Ambient Lighting Spheres */}
      <div className="w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[130px] fixed -top-24 -left-24 pointer-events-none animate-liquid-orb-1" />
      <div className="w-[450px] h-[450px] rounded-full bg-cyan-500/15 blur-[120px] fixed -bottom-24 -right-24 pointer-events-none animate-liquid-orb-2" />

      {/* Main Glass Card */}
      <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 my-6">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Glowing Top Specular Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

          {/* Top Brand & Status Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-lg bg-slate-900 shrink-0">
                <img
                  src="/logo.png"
                  alt="Homebase Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Homebase HQ</h1>
                <p className="text-xs text-slate-400 font-medium">Tenant Registration & Onboarding Portal</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Manager Approval</span>
            </div>
          </div>

          {/* Body Banner */}
          <div className="py-6 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome, {user.name}
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              Your tenant application and unit request have been successfully recorded in the system. Our property managers (Miranda and Federico) are currently reviewing your unit assignment and lease details.
            </p>
          </div>

          {/* Application Details Card */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Application & Requested Unit Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Applicant Name</span>
                <p className="font-semibold text-white text-sm">{user.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Email Address</span>
                <p className="font-semibold text-cyan-300 text-sm">{user.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Requested Unit Number</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-mono font-bold text-xs">
                    {user.requestedUnitNumber || 'Unit 102 - Garden View'}
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">Pending Approval</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Property Location</span>
                <p className="font-semibold text-white">Sunset Park Apartments, North Metro</p>
              </div>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="space-y-3 mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Approval & Activation Pipeline
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">1. Online Registration & Account Created</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs shadow-sm">
                <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
                <span className="font-medium">2. Unit Number Allocation & Manager Approval</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-amber-500/25 px-2 py-0.5 rounded-full text-amber-300">
                  In Progress
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs">
                <FileCheck className="w-4 h-4 shrink-0 text-slate-500" />
                <span>3. Tenancy Lease Activation & Unit Key Handover</span>
                <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-wider">
                  Waiting
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs">
                <KeyRound className="w-4 h-4 shrink-0 text-slate-500" />
                <span>4. Full Tenant Portal (Rent Ledger, Receipts & Maintenance)</span>
                <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-wider">
                  Locked
                </span>
              </div>
            </div>
          </div>

          {/* Quick Testing Helper Card */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-400/25 text-xs text-indigo-200 space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Testing Workflow Helper</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-mono">
                Admin Approval
              </span>
            </div>
            <p className="text-[11px] text-indigo-300/80 leading-relaxed">
              To test approving this tenant with their unit number right now, switch to <strong>Federico</strong> or <strong>Miranda</strong>, navigate to <strong>Tenant Management &rarr; Pending Approvals</strong>, and click <strong>Approve & Assign Unit</strong>.
            </p>
            {onSwitchToManager && (
              <button
                type="button"
                onClick={onSwitchToManager}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/40 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Switch to Manager (Federico) to Approve</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl liquid-glass text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition border border-white/10 hover:border-white/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-cyan-500/25"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
