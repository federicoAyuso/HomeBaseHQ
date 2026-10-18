import React from 'react';
import {
  FinancialStats,
  Payment,
  MaintenanceTicket,
  Unit,
  Tenant,
  SystemNotification,
} from '../types';
import {
  TrendingUp,
  Building,
  Home,
  Wrench,
  Receipt,
  BellRing,
  CloudCheck,
  ChevronRight,
  Plus,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DashboardOverviewProps {
  stats: FinancialStats;
  payments: Payment[];
  tickets: MaintenanceTicket[];
  units: Unit[];
  tenants: Tenant[];
  notifications: SystemNotification[];
  onOpenReceipt: (payment: Payment) => void;
  onNavigate: (view: string) => void;
  onOpenQuickAction: (action: string) => void;
  isGoogleConnected: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  payments,
  tickets,
  units,
  tenants,
  notifications,
  onOpenReceipt,
  onNavigate,
  onOpenQuickAction,
  isGoogleConnected,
}) => {
  // Chart Data Preparation: Income vs Expense per property
  const propertyChartData = [
    { name: 'Sunset Park', Income: 4850, Expenses: 170 },
    { name: 'Highland Crest', Income: 5600, Expenses: 0 },
    { name: 'Bayside Towers', Income: 3350, Expenses: 120 },
  ];

  const recentPayments = payments.slice(0, 5);
  const activeTickets = tickets.filter((t) => t.status !== 'Closed').slice(0, 4);
  const latestNotification = notifications[0];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Real-time Status Alert Banner */}
      {latestNotification && (
        <div className="liquid-glass-dock rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-cyan-400/20">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30 uppercase tracking-wider">
                  LIVE STATUS ALERT
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(latestNotification.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{latestNotification.title}</p>
              <p className="text-xs text-slate-300">{latestNotification.message}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('notifications')}
            className="text-xs font-semibold text-cyan-200 hover:text-white flex items-center gap-1.5 liquid-glass-pill px-4 py-2 rounded-xl border border-cyan-400/30 hover:border-cyan-300 transition shrink-0 cursor-pointer"
          >
            <span>Live Mobile Feed</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      )}

      {/* Primary Financial Stats Grid with Liquid Glass cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Occupancy Rate Card */}
        <div className="liquid-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Occupancy Rate</p>
          <h3 className="text-3xl font-extrabold mt-1.5 text-cyan-300 tracking-tight">
            {stats.occupancyRate.toFixed(1)}%
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>
              {stats.occupiedUnits} / {stats.totalUnits} Units Occupied
            </span>
          </div>
        </div>

        {/* Monthly Revenue / Total Income Card */}
        <div className="liquid-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Monthly Revenue</p>
          <h3 className="text-3xl font-extrabold mt-1.5 text-white tracking-tight flex items-baseline gap-1">
            <span className="text-emerald-400 font-black text-2xl">P</span>
            <span>{stats.totalIncome.toLocaleString()}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-2.5">
            P{stats.totalExpenses.toLocaleString()} maintenance deductible
          </p>
        </div>

        {/* Open Tickets Card */}
        <div className="liquid-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Tickets</p>
          <h3 className="text-3xl font-extrabold mt-1.5 text-rose-400 tracking-tight">
            {stats.openTicketsCount}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2.5">Active tenant maintenance requests</p>
        </div>

        {/* Net Revenue Card */}
        <div className="liquid-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Net Operational Revenue</p>
          <h3 className="text-3xl font-extrabold mt-1.5 text-white tracking-tight flex items-baseline gap-1">
            <span className="text-cyan-400 font-black text-2xl">P</span>
            <span>{stats.netRevenue.toLocaleString()}</span>
          </h3>
          <p className="text-[11px] text-cyan-300 font-medium mt-2.5">Gross Income minus expenses</p>
        </div>
      </div>

      {/* Main Grid: Chart & Quick Actions / Real-time widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Chart */}
        <div className="lg:col-span-2 liquid-glass-card rounded-2xl p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <span>Financial Performance by Property</span>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  BWP (P)
                </span>
              </h2>
              <p className="text-xs text-slate-400">Monthly income vs deductible maintenance cost</p>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition"
            >
              <span>Full Ledger</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `P${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    color: '#f8fafc',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  }}
                  formatter={(val: any) => [`P${Number(val).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
                <Bar dataKey="Income" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Actions & Private Cloud Storage Card */}
        <div className="space-y-4">
          <div className="liquid-glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span>Quick Management Actions</span>
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onOpenQuickAction('payment')}
                className="w-full flex items-center justify-between p-3 rounded-xl liquid-glass-pill hover:bg-white/10 text-xs text-white font-medium transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-cyan-200 transition-colors">
                    Log Rent & Print Receipt
                  </span>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => onOpenQuickAction('tenant')}
                className="w-full flex items-center justify-between p-3 rounded-xl liquid-glass-pill hover:bg-white/10 text-xs text-white font-medium transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-cyan-200 transition-colors">
                    Onboard Tenant & KYC
                  </span>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => onOpenQuickAction('reminder')}
                className="w-full flex items-center justify-between p-3 rounded-xl liquid-glass-pill hover:bg-white/10 text-xs text-white font-medium transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-cyan-200 transition-colors">
                    Automated Rent Reminder
                  </span>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => onNavigate('ai')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-400/30 text-xs text-cyan-200 font-semibold transition cursor-pointer hover:border-cyan-400/50"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Portfolio Copilot Analysis</span>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Cloud Sync Status Box */}
          <div className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CloudCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Private Cloud Storage</p>
                <p className="text-[11px] text-slate-400">
                  {isGoogleConnected ? 'Google Drive & Sheets Linked' : 'Encrypted backup ready'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('google')}
              className="px-3 py-1.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Split Cards: Recent Transactions & Dark Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payment Transactions */}
        <div className="lg:col-span-2 liquid-glass-card rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Recent Transactions</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                BWP Receipts
              </span>
            </h2>
            <button
              onClick={() => onNavigate('payments')}
              className="text-cyan-300 hover:text-white text-xs font-bold transition"
            >
              Generate All Receipts
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-3 font-semibold">Receipt #</th>
                  <th className="px-6 py-3 font-semibold">Tenant</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium divide-y divide-white/[0.06]">
                {recentPayments.map((pay) => {
                  const tenant = tenants.find((t) => t.id === pay.tenantId);
                  return (
                    <tr key={pay.id} className="hover:bg-white/[0.04] transition">
                      <td className="px-6 py-4 font-mono font-bold text-cyan-300">{pay.receiptNumber}</td>
                      <td className="px-6 py-4 text-slate-200">{tenant?.name || 'Tenant'}</td>
                      <td className="px-6 py-4 font-bold text-white">
                        <span className="text-emerald-400 mr-0.5">P</span>
                        {pay.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenReceipt(pay)}
                          className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Status Widget */}
        <div className="liquid-glass-dock rounded-2xl flex flex-col p-6 text-white space-y-4 border border-white/15">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Real-time Status Feed</span>
            </h2>
            <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-2.5 py-0.5 rounded-full border border-cyan-400/30 font-bold tracking-wider">
              LIVE PULSE
            </span>
          </div>

          <div className="space-y-4 flex-1">
            <div className="border-l-2 border-cyan-400 pl-4 py-1">
              <p className="text-xs font-semibold text-white">Maintenance Ticketing Desk Active</p>
              <p className="text-[11px] text-slate-300">{activeTickets.length} open tickets tracked in portal.</p>
              <p className="text-[10px] text-cyan-300 mt-1 font-mono">Just Now</p>
            </div>

            <div className="border-l-2 border-indigo-500 pl-4 py-1">
              <p className="text-xs font-semibold text-white">Google Private Cloud Sync</p>
              <p className="text-[11px] text-slate-300">Encrypted backup archives active for Miranda E Cavanagh.</p>
              <p className="text-[10px] text-indigo-300 mt-1 font-mono">12 mins ago</p>
            </div>

            <div className="border-l-2 border-emerald-400 pl-4 py-1">
              <p className="text-xs font-semibold text-white">Payment Receipts Generated</p>
              <p className="text-[11px] text-slate-300">Digital tenant receipts synchronized to ledger (BWP).</p>
              <p className="text-[10px] text-emerald-300 mt-1 font-mono">28 mins ago</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="liquid-glass-subtle rounded-xl p-3 flex items-center gap-3 border border-white/10">
              <div className="w-9 h-9 bg-cyan-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center shrink-0 text-cyan-300">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-tight">Mobile Alert Channel Active</p>
                <p className="text-[10px] text-slate-400">Push notifications ready for property events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
