import React, { useState } from 'react';
import { Payment, Tenant, Unit, Property } from '../types';
import {
  Receipt,
  Plus,
  Printer,
  Calendar,
  CreditCard,
  Search,
  ArrowDownCircle,
  History,
  MessageSquare,
  Sparkles,
  Tag,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface PaymentLedgerProps {
  payments: Payment[];
  tenants: Tenant[];
  units: Unit[];
  properties: Property[];
  onLogPayment: (data: {
    tenantId: string;
    unitId?: string;
    amount: number;
    expense?: number;
    date: string;
    receiptNumber: string;
    paymentMethod: Payment['paymentMethod'];
    notes?: string;
    isHistorical?: boolean;
    periodCovered?: string;
  }) => void;
  onOpenReceipt: (payment: Payment) => void;
}

export const PaymentLedger: React.FC<PaymentLedgerProps> = ({
  payments,
  tenants,
  units,
  properties,
  onLogPayment,
  onOpenReceipt,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [tenantFilter, setTenantFilter] = useState<'all' | 'active' | 'past'>('all');

  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState(1500);
  const [expense, setExpense] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNumber, setReceiptNumber] = useState(
    `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Bank Transfer');
  const [notes, setNotes] = useState('');
  const [isHistorical, setIsHistorical] = useState(false);
  const [periodCovered, setPeriodCovered] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDeductibles = payments.reduce((sum, p) => sum + (p.expense || 0), 0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !amount || !date || !receiptNumber) return;

    onLogPayment({
      tenantId,
      amount: Number(amount),
      expense: Number(expense) || 0,
      date,
      receiptNumber,
      paymentMethod,
      notes,
      isHistorical,
      periodCovered,
    });

    setTenantId('');
    setAmount(1500);
    setExpense(0);
    setNotes('');
    setIsHistorical(false);
    setPeriodCovered('');
    setReceiptNumber(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setShowLogModal(false);
  };

  const filteredPayments = payments.filter((p) => {
    const tenant = tenants.find((t) => t.id === p.tenantId);
    const isPast = Boolean(p.isHistorical || tenant?.isPastTenant);

    if (tenantFilter === 'active' && isPast) return false;
    if (tenantFilter === 'past' && !isPast) return false;

    const q = searchTerm.toLowerCase();
    const matchesReceipt = p.receiptNumber.toLowerCase().includes(q);
    const matchesTenant = tenant && tenant.name.toLowerCase().includes(q);
    const matchesMethod = p.paymentMethod.toLowerCase().includes(q);
    const matchesNotes = p.notes && p.notes.toLowerCase().includes(q);
    const matchesPeriod = p.periodCovered && p.periodCovered.toLowerCase().includes(q);

    return matchesReceipt || matchesTenant || matchesMethod || matchesNotes || matchesPeriod;
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Receipt className="w-5 h-5" />
            </div>
            <span>Rent Payments, Historical Ledgers & Receipts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log current and past tenant payments in Botswana Pula (P), record historical ledger notes, and print receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsHistorical(true);
              setReceiptNumber(`HIST-REC-${Math.floor(1000 + Math.random() * 9000)}`);
              setShowLogModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl liquid-glass border border-amber-400/30 hover:border-amber-400/60 text-amber-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Log Historical / Past Payment</span>
          </button>

          <button
            onClick={() => {
              setIsHistorical(false);
              setReceiptNumber(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
              setShowLogModal(true);
            }}
            className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-cyan-200" />
            <span>Log Rent Payment</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="liquid-glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Rent Revenue Recorded
            </p>
            <p className="text-3xl font-extrabold text-white mt-1 flex items-baseline gap-1">
              <span className="text-emerald-400 font-black text-2xl">P</span>
              <span>{totalCollected.toLocaleString()}</span>
            </p>
          </div>
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-2xl font-black text-xl shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            P
          </div>
        </div>

        <div className="liquid-glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Maintenance & Expense Deductibles
            </p>
            <p className="text-3xl font-extrabold text-rose-400 mt-1 flex items-baseline gap-1">
              <span className="font-black text-2xl">P</span>
              <span>{totalDeductibles.toLocaleString()}</span>
            </p>
          </div>
          <div className="p-3.5 bg-rose-500/20 border border-rose-400/30 text-rose-300 rounded-2xl shadow-[0_0_12px_rgba(244,63,94,0.25)]">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTenantFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              tenantFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Payments ({payments.length})
          </button>
          <button
            onClick={() => setTenantFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              tenantFilter === 'active'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Current Tenants
          </button>
          <button
            onClick={() => setTenantFilter('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              tenantFilter === 'past'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Past Tenants History</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, tenant, payment notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full liquid-glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Table with Notes Display */}
      <div className="liquid-glass-card rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Payment Transaction History & Ledger Notes</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/50 border border-cyan-400/30 px-2 py-0.5 rounded-full font-mono">
              Botswana Ledger
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {filteredPayments.length} Transactions Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] font-semibold tracking-wider">
                <th className="p-3.5">Receipt Code</th>
                <th className="p-3.5">Tenant & Status</th>
                <th className="p-3.5">Amount Paid</th>
                <th className="p-3.5">Expense Deductible</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Payment Notes & Remarks</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const tenant = tenants.find((t) => t.id === p.tenantId);
                  const isPast = Boolean(p.isHistorical || tenant?.isPastTenant);

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.04] transition">
                      <td className="p-3.5 font-mono font-bold text-cyan-300">
                        <div className="flex items-center gap-1.5">
                          {p.receiptNumber}
                          {isPast && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-sans font-bold border border-amber-400/30">
                              PAST
                            </span>
                          )}
                        </div>
                        {p.periodCovered && (
                          <span className="text-[10px] text-slate-400 block font-sans font-normal mt-0.5">
                            {p.periodCovered}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-200 block">
                          {tenant?.name || 'Tenant'}
                        </span>
                        {isPast ? (
                          <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
                            <History className="w-2.5 h-2.5" />
                            <span>Former Tenant</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400/90">
                            Active Tenant
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        <span className="text-emerald-400 mr-0.5">P</span>
                        {p.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-400 font-medium">
                        {p.expense ? `P${p.expense}` : '—'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg liquid-glass-pill text-slate-300 text-[11px] font-medium border border-white/10">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{p.date}</td>
                      <td className="p-3.5 max-w-xs">
                        {p.notes ? (
                          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-slate-300 italic flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{p.notes}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No notes</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onOpenReceipt(p)}
                          className="px-3 py-1.5 rounded-xl liquid-glass-pill hover:bg-white/15 text-cyan-300 hover:text-white font-semibold flex items-center gap-1.5 ml-auto transition cursor-pointer border border-cyan-400/20"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Payment Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Receipt className="w-5 h-5 text-cyan-400" />
              <span>
                {isHistorical ? 'Log Past / Historical Payment' : 'Log Rent Payment & Generate Receipt'}
              </span>
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Historical toggle */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Historical / Past Payment</p>
                  <p className="text-[11px] text-slate-400">Record payments from past years or prior leases</p>
                </div>
                <input
                  type="checkbox"
                  checked={isHistorical}
                  onChange={(e) => {
                    setIsHistorical(e.target.checked);
                    if (e.target.checked && !receiptNumber.startsWith('HIST')) {
                      setReceiptNumber(`HIST-REC-${Math.floor(1000 + Math.random() * 9000)}`);
                    }
                  }}
                  className="rounded border-white/20 text-cyan-500 focus:ring-cyan-400 h-4 w-4 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Select Tenant (Active or Past) *</label>
                <select
                  value={tenantId}
                  onChange={(e) => {
                    setTenantId(e.target.value);
                    const selected = tenants.find((t) => t.id === e.target.value);
                    if (selected && selected.assignedUnitIds.length > 0) {
                      const u = units.find((un) => un.id === selected.assignedUnitIds[0]);
                      if (u) setAmount(u.rentAmount);
                    }
                  }}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-white">Choose Tenant</option>
                  <optgroup label="Active Tenants" className="bg-slate-900 text-cyan-300">
                    {tenants
                      .filter((t) => !t.isPastTenant && t.status !== 'Past')
                      .map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                          {t.name} ({t.contact})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Past Tenants (History)" className="bg-slate-900 text-amber-300">
                    {tenants
                      .filter((t) => t.isPastTenant || t.status === 'Past')
                      .map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                          [Past] {t.name} ({t.formerUnitNumber || 'Past Tenant'})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Payment Amount (P) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-bold text-emerald-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Expense Deductible (P)</label>
                  <input
                    type="number"
                    value={expense}
                    onChange={(e) => setExpense(Number(e.target.value))}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    {isHistorical ? 'Historical Payment Date *' : 'Payment Date *'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Receipt Code *</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Period / Month Covered</label>
                <input
                  type="text"
                  placeholder="e.g. October 2024 Rent"
                  value={periodCovered}
                  onChange={(e) => setPeriodCovered(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['paymentMethod'])}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                >
                  <option value="Bank Transfer" className="bg-slate-900 text-white">Bank Transfer</option>
                  <option value="Online Portal" className="bg-slate-900 text-white">Online Portal</option>
                  <option value="Cash" className="bg-slate-900 text-white">Cash</option>
                  <option value="Credit Card" className="bg-slate-900 text-white">Credit Card</option>
                  <option value="Check" className="bg-slate-900 text-white">Check</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Notes / Deductible Reason / Historical Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid in full on 1st via wire transfer. Deposit deduction of P100 for light fixtures."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
