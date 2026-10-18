import React, { useState, useEffect } from 'react';
import { Tenant, Unit, Property, Payment, TenantNote } from '../types';
import {
  Users,
  Plus,
  ShieldCheck,
  CreditCard,
  Calendar,
  Phone,
  Search,
  FileText,
  X,
  History,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ClipboardList,
  AlertCircle,
  FileCheck,
  Building,
  Home,
  LogOut,
  ChevronRight,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Clock,
  UserCheck,
  XCircle,
  Check,
} from 'lucide-react';

interface TenantOnboardingProps {
  tenants: Tenant[];
  units: Unit[];
  properties: Property[];
  payments?: Payment[];
  onAddTenant: (data: any) => void;
  onAddTenantNote?: (tenantId: string, text: string, category?: string) => void;
  onMoveOutTenant?: (
    tenantId: string,
    data: {
      moveOutDate: string;
      departureReason?: string;
      exitNotes?: string;
      depositRefunded?: number;
      depositDeductions?: number;
      depositNotes?: string;
      forwardingAddress?: string;
    }
  ) => void;
  onLogPayment?: (data: any) => void;
  onApproveTenant?: (
    tenantId: string,
    data: {
      unitId: string;
      unitNumber?: string;
      leaseStart?: string;
      leaseEnd?: string;
      agreedRent?: number;
      securityDeposit?: number;
      notes?: string;
    }
  ) => void;
  onRejectTenant?: (tenantId: string, data: { reason: string }) => void;
  onResetData?: () => void;
}

export const TenantOnboarding: React.FC<TenantOnboardingProps> = ({
  tenants,
  units,
  properties,
  payments = [],
  onAddTenant,
  onAddTenantNote,
  onMoveOutTenant,
  onLogPayment,
  onApproveTenant,
  onRejectTenant,
  onResetData,
}) => {
  // Tenant collections
  const pendingTenants = tenants.filter(
    (t) =>
      !t.isPastTenant &&
      t.status !== 'Past' &&
      (t.approvalStatus === 'Pending' || (!t.approvalStatus && t.assignedUnitIds.length === 0))
  );

  const activeTenants = tenants.filter(
    (t) =>
      !t.isPastTenant &&
      t.status !== 'Past' &&
      t.approvalStatus !== 'Pending' &&
      t.approvalStatus !== 'Rejected'
  );

  const pastTenants = tenants.filter((t) => t.isPastTenant || t.status === 'Past');
  const rejectedTenants = tenants.filter((t) => t.approvalStatus === 'Rejected');

  // Active Tab: default to pending if applicants are waiting, otherwise active
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'past' | 'all'>(() => {
    return pendingTenants.length > 0 ? 'pending' : 'active';
  });

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showPastModal, setShowPastModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [showHistoryDetailModal, setShowHistoryDetailModal] = useState(false);

  // Selected tenant for modals
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // State: Approve Tenant Modal
  const [approveUnitId, setApproveUnitId] = useState('');
  const [approveLeaseStart, setApproveLeaseStart] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [approveLeaseEnd, setApproveLeaseEnd] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [approveAgreedRent, setApproveAgreedRent] = useState<number>(1450);
  const [approveSecurityDeposit, setApproveSecurityDeposit] = useState<number>(1450);
  const [approveNotes, setApproveNotes] = useState(
    'Tenant identity & Omang verified. Lease agreement and unit allocation approved.'
  );

  // State: Reject Tenant Modal
  const [rejectReason, setRejectReason] = useState('Unit already allocated to another tenant');
  const [rejectCustomNotes, setRejectCustomNotes] = useState('');

  // State: Onboard New Active Tenant
  const [activeName, setActiveName] = useState('');
  const [activeContact, setActiveContact] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const [activeBankDetails, setActiveBankDetails] = useState('');
  const [activeKycIdPassport, setActiveKycIdPassport] = useState('');
  const [activeLeaseStart, setActiveLeaseStart] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [activeLeaseEnd, setActiveLeaseEnd] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [activeSelectedUnitIds, setActiveSelectedUnitIds] = useState<string[]>([]);
  const [activeInitialNote, setActiveInitialNote] = useState('');

  // State: Record Past Tenant
  const [pastName, setPastName] = useState('');
  const [pastContact, setPastContact] = useState('');
  const [pastEmail, setPastEmail] = useState('');
  const [pastBankDetails, setPastBankDetails] = useState('');
  const [pastKycIdPassport, setPastKycIdPassport] = useState('');
  const [pastFormerProperty, setPastFormerProperty] = useState('');
  const [pastFormerUnit, setPastFormerUnit] = useState('');
  const [pastLeaseStart, setPastLeaseStart] = useState('');
  const [pastMoveOutDate, setPastMoveOutDate] = useState('');
  const [pastDepartureReason, setPastDepartureReason] = useState('Completed 12-month lease term');
  const [pastForwardingAddress, setPastForwardingAddress] = useState('');
  const [pastDepositRefunded, setPastDepositRefunded] = useState<number>(0);
  const [pastDepositDeductions, setPastDepositDeductions] = useState<number>(0);
  const [pastDepositNotes, setPastDepositNotes] = useState('');
  const [pastNotes, setPastNotes] = useState('');

  // Optional initial historical payment when recording a past tenant
  const [includeInitialPastPayment, setIncludeInitialPastPayment] = useState(true);
  const [histAmount, setHistAmount] = useState<number>(1450);
  const [histDate, setHistDate] = useState('2025-01-01');
  const [histPeriod, setHistPeriod] = useState('January 2025 Rent (Final Settlement)');
  const [histReceipt, setHistReceipt] = useState(`HIST-REC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [histMethod, setHistMethod] = useState<Payment['paymentMethod']>('Bank Transfer');
  const [histPaymentNotes, setHistPaymentNotes] = useState('Final rent payment and key handover completed.');

  // State: Add Note Modal
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState<TenantNote['category']>('Payment History');

  // State: Add Past Payment Modal
  const [paymentAmount, setPaymentAmount] = useState<number>(1500);
  const [paymentDate, setPaymentDate] = useState('2024-12-01');
  const [paymentPeriod, setPaymentPeriod] = useState('');
  const [paymentReceiptNumber, setPaymentReceiptNumber] = useState(
    `HIST-REC-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Bank Transfer');
  const [paymentExpense, setPaymentExpense] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState('');

  // State: Move Out Modal
  const [moveOutDate, setMoveOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [moveOutReason, setMoveOutReason] = useState('Lease expired; relocated');
  const [moveOutExitNotes, setMoveOutExitNotes] = useState('Keys returned, meter inspected, no damage to walls.');
  const [moveOutDepositRefunded, setMoveOutDepositRefunded] = useState<number>(1450);
  const [moveOutDepositDeductions, setMoveOutDepositDeductions] = useState<number>(0);
  const [moveOutDepositNotes, setMoveOutDepositNotes] = useState('Full security deposit refunded upon successful inspection.');
  const [moveOutForwardingAddress, setMoveOutForwardingAddress] = useState('');

  const availableUnits = units.filter((u) => u.status === 'Available');

  // Filtered displayed tenants
  const displayedTenants =
    activeTab === 'pending'
      ? pendingTenants
      : activeTab === 'active'
      ? activeTenants
      : activeTab === 'past'
      ? pastTenants
      : tenants;

  const filteredTenants = displayedTenants.filter((t) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = t.name.toLowerCase().includes(q);
    const contactMatch = t.contact.toLowerCase().includes(q);
    const kycMatch = t.kycIdPassport && t.kycIdPassport.toLowerCase().includes(q);
    const unitMatch =
      (t.formerUnitNumber && t.formerUnitNumber.toLowerCase().includes(q)) ||
      (t.requestedUnitNumber && t.requestedUnitNumber.toLowerCase().includes(q));
    const reasonMatch = t.departureReason && t.departureReason.toLowerCase().includes(q);
    const notesMatch = t.notes && t.notes.toLowerCase().includes(q);
    const historyNotesMatch = t.historyNotes?.some((n) => n.text.toLowerCase().includes(q));
    return (
      nameMatch ||
      contactMatch ||
      kycMatch ||
      unitMatch ||
      reasonMatch ||
      notesMatch ||
      historyNotesMatch
    );
  });

  const toggleUnitSelection = (unitId: string) => {
    if (activeSelectedUnitIds.includes(unitId)) {
      setActiveSelectedUnitIds(activeSelectedUnitIds.filter((id) => id !== unitId));
    } else {
      setActiveSelectedUnitIds([...activeSelectedUnitIds, unitId]);
    }
  };

  // Open Approval Modal for a specific applicant
  const handleOpenApproveModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);

    // Try to preselect requested unit
    let targetUnitId = tenant.requestedUnitId;
    if (!targetUnitId && tenant.requestedUnitNumber) {
      const match = units.find(
        (u) => u.unitNumber.toLowerCase() === tenant.requestedUnitNumber?.toLowerCase()
      );
      if (match) targetUnitId = match.id;
    }

    if (!targetUnitId && availableUnits.length > 0) {
      targetUnitId = availableUnits[0].id;
    }

    const selectedUnitObj = units.find((u) => u.id === targetUnitId);
    const standardRent = selectedUnitObj ? selectedUnitObj.rentAmount : tenant.agreedRent || 1450;

    setApproveUnitId(targetUnitId || '');
    setApproveAgreedRent(standardRent);
    setApproveSecurityDeposit(standardRent);
    setApproveNotes(
      `Tenant application approved for Unit ${selectedUnitObj ? selectedUnitObj.unitNumber : tenant.requestedUnitNumber || ''}. Identity & Omang verification complete.`
    );
    setShowApproveModal(true);
  };

  // When approving unit selection changes, update the standard rent
  const handleApproveUnitChange = (unitId: string) => {
    setApproveUnitId(unitId);
    const u = units.find((un) => un.id === unitId);
    if (u) {
      setApproveAgreedRent(u.rentAmount);
      setApproveSecurityDeposit(u.rentAmount);
    }
  };

  // Submit Approval
  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !approveUnitId) return;

    const chosenUnit = units.find((u) => u.id === approveUnitId);

    if (onApproveTenant) {
      onApproveTenant(selectedTenant.id, {
        unitId: approveUnitId,
        unitNumber: chosenUnit?.unitNumber,
        leaseStart: approveLeaseStart,
        leaseEnd: approveLeaseEnd,
        agreedRent: Number(approveAgreedRent),
        securityDeposit: Number(approveSecurityDeposit),
        notes: approveNotes,
      });
    }

    setShowApproveModal(false);
  };

  // Submit Rejection
  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    const fullReason = rejectCustomNotes.trim()
      ? `${rejectReason} - ${rejectCustomNotes.trim()}`
      : rejectReason;

    if (onRejectTenant) {
      onRejectTenant(selectedTenant.id, { reason: fullReason });
    }

    setShowRejectModal(false);
  };

  // Submit Active Tenant
  const handleActiveTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeName || !activeContact || !activeBankDetails) return;

    onAddTenant({
      name: activeName,
      contact: activeContact,
      email: activeEmail,
      bankDetails: activeBankDetails,
      kycIdPassport: activeKycIdPassport,
      leaseStart: activeLeaseStart,
      leaseEnd: activeLeaseEnd,
      unitIds: activeSelectedUnitIds,
      isPastTenant: false,
      approvalStatus: activeSelectedUnitIds.length > 0 ? 'Approved' : 'Pending',
      initialNote: activeInitialNote,
    });

    setActiveName('');
    setActiveContact('');
    setActiveEmail('');
    setActiveBankDetails('');
    setActiveKycIdPassport('');
    setActiveSelectedUnitIds([]);
    setActiveInitialNote('');
    setShowActiveModal(false);
  };

  // Submit Past Tenant
  const handlePastTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastName || !pastContact) return;

    const initialPaymentPayload = includeInitialPastPayment
      ? {
          amount: Number(histAmount),
          date: histDate,
          receiptNumber: histReceipt,
          paymentMethod: histMethod,
          notes: histPaymentNotes,
          periodCovered: histPeriod,
        }
      : undefined;

    onAddTenant({
      name: pastName,
      contact: pastContact,
      email: pastEmail,
      bankDetails: pastBankDetails || 'N/A',
      kycIdPassport: pastKycIdPassport,
      leaseStart: pastLeaseStart,
      moveOutDate: pastMoveOutDate,
      departureReason: pastDepartureReason,
      forwardingAddress: pastForwardingAddress,
      formerPropertyName: pastFormerProperty,
      formerUnitNumber: pastFormerUnit,
      depositRefunded: pastDepositRefunded,
      depositDeductions: pastDepositDeductions,
      depositNotes: pastDepositNotes,
      notes: pastNotes,
      isPastTenant: true,
      status: 'Past',
      initialNote: pastNotes,
      initialPayment: initialPaymentPayload,
    });

    setPastName('');
    setPastContact('');
    setPastEmail('');
    setPastBankDetails('');
    setPastKycIdPassport('');
    setPastFormerProperty('');
    setPastFormerUnit('');
    setPastLeaseStart('');
    setPastMoveOutDate('');
    setPastDepartureReason('Completed 12-month lease term');
    setPastForwardingAddress('');
    setPastDepositRefunded(0);
    setPastDepositDeductions(0);
    setPastDepositNotes('');
    setPastNotes('');
    setShowPastModal(false);
  };

  // Submit Note
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !noteText.trim()) return;

    if (onAddTenantNote) {
      onAddTenantNote(selectedTenant.id, noteText.trim(), noteCategory);
    }
    setNoteText('');
    setShowAddNoteModal(false);
  };

  // Submit Past Payment
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !paymentAmount || !paymentDate || !paymentReceiptNumber) return;

    if (onLogPayment) {
      onLogPayment({
        tenantId: selectedTenant.id,
        amount: Number(paymentAmount),
        expense: Number(paymentExpense) || 0,
        date: paymentDate,
        receiptNumber: paymentReceiptNumber,
        paymentMethod,
        notes: paymentNotes,
        isHistorical: true,
        periodCovered: paymentPeriod || 'Historical Payment',
      });
    }

    setPaymentAmount(1500);
    setPaymentExpense(0);
    setPaymentNotes('');
    setPaymentPeriod('');
    setPaymentReceiptNumber(`HIST-REC-${Math.floor(1000 + Math.random() * 9000)}`);
    setShowAddPaymentModal(false);
  };

  // Submit Move Out
  const handleMoveOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    if (onMoveOutTenant) {
      onMoveOutTenant(selectedTenant.id, {
        moveOutDate,
        departureReason: moveOutReason,
        exitNotes: moveOutExitNotes,
        depositRefunded: Number(moveOutDepositRefunded) || 0,
        depositDeductions: Number(moveOutDepositDeductions) || 0,
        depositNotes: moveOutDepositNotes,
        forwardingAddress: moveOutForwardingAddress,
      });
    }
    setShowMoveOutModal(false);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Users className="w-5 h-5" />
            </div>
            <span>Tenant Management & Unit Approvals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve applicant unit allocations, manage active leases, review past tenancy history, and track payment ledgers
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Reset Demo Data Button */}
          {onResetData && (
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition"
              title="Reset all demo data to clean testing state with 1 pending applicant"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Demo Data</span>
            </button>
          )}

          <button
            onClick={() => setShowPastModal(true)}
            className="px-3.5 py-2.5 rounded-xl liquid-glass border border-amber-400/30 hover:border-amber-400/60 text-amber-200 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-amber-500/10 transition"
          >
            <History className="w-4 h-4 text-amber-300" />
            <span>Record Past History</span>
          </button>

          <button
            onClick={() => setShowActiveModal(true)}
            className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-cyan-200" />
            <span>Onboard Tenant</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar & Stats Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab 1: Pending Approvals */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'pending'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${pendingTenants.length > 0 ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
            <span>Pending Approvals</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono border ${
                pendingTenants.length > 0
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-white/10'
              }`}
            >
              {pendingTenants.length}
            </span>
          </button>

          {/* Tab 2: Active Tenants */}
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Tenants</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 text-[10px] text-cyan-300 border border-cyan-500/30 font-mono">
              {activeTenants.length}
            </span>
          </button>

          {/* Tab 3: Past Tenants History */}
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'past'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Past Tenants History</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-950/60 text-[10px] text-indigo-300 border border-indigo-500/30 font-mono">
              {pastTenants.length}
            </span>
          </button>

          {/* Tab 4: All Directory */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white border border-white/20 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>All Records</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] text-slate-300 border border-white/10 font-mono">
              {tenants.length}
            </span>
          </button>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-amber-300/90 font-mono">
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
            <span>{pendingTenants.length} Awaiting Unit Approval</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-emerald-300 font-mono">
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>{availableUnits.length} Units Available</span>
          </span>
        </div>
      </div>

      {/* Priority Banner if there are pending approvals */}
      {pendingTenants.length > 0 && activeTab !== 'pending' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              <strong>Action Required:</strong> You have {pendingTenants.length} tenant application(s) awaiting unit number approval.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('pending')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer shrink-0"
          >
            Review Pending Approvals &rarr;
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by tenant name, phone, unit number, requested property, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full liquid-glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Tenants Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTenants.length === 0 ? (
          <div className="col-span-full liquid-glass-card rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 mx-auto flex items-center justify-center">
              {activeTab === 'pending' ? <Clock className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-bold text-white">
              {activeTab === 'pending'
                ? 'No Pending Tenant Approvals'
                : 'No Tenant Records Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {activeTab === 'pending'
                ? 'All tenant applications have been reviewed and approved with their unit numbers! New applicants from the registration page will appear here.'
                : 'No tenants matching your search query. You can onboard new tenants or switch tabs.'}
            </p>
            {activeTab === 'pending' && onResetData && (
              <button
                onClick={() => setShowResetModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data to Test Approval Flow</span>
              </button>
            )}
          </div>
        ) : (
          filteredTenants.map((t) => {
            const isPending =
              !t.isPastTenant &&
              t.status !== 'Past' &&
              (t.approvalStatus === 'Pending' || (!t.approvalStatus && t.assignedUnitIds.length === 0));
            const isPast = t.isPastTenant || t.status === 'Past';
            const assignedUnits = units.filter((u) => t.assignedUnitIds.includes(u.id));
            const tenantPayments = payments.filter((p) => p.tenantId === t.id);
            const notesCount = (t.historyNotes?.length || 0) + (t.notes ? 1 : 0);

            return (
              <div
                key={t.id}
                className={`liquid-glass-card rounded-2xl p-5 space-y-4 hover:border-cyan-400/30 transition group relative overflow-hidden ${
                  isPending
                    ? 'border-amber-400/40 bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-slate-950/90 shadow-lg shadow-amber-500/10'
                    : isPast
                    ? 'border-indigo-500/20 bg-gradient-to-br from-indigo-950/10 via-slate-900/60 to-slate-950/80'
                    : 'border-white/10'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base">{t.name}</h3>
                      {isPending ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 animate-pulse">
                          <Clock className="w-2.5 h-2.5" />
                          <span>PENDING APPROVAL</span>
                        </span>
                      ) : isPast ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                          <History className="w-2.5 h-2.5" />
                          <span>PAST TENANT</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>APPROVED &bull; ACTIVE</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.contact}</span>
                      {t.email && <span className="text-slate-500">&bull; {t.email}</span>}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase border shrink-0 ${
                      t.kycStatus === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>KYC {t.kycStatus}</span>
                  </span>
                </div>

                {/* Case 1: Pending Approval Box */}
                {isPending && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/25 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-amber-400" />
                        <span>Requested Unit Allocation:</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-bold font-mono">
                        {t.requestedUnitNumber || 'Unit Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>Property: <strong>{t.requestedPropertyName || 'Sunset Park Apartments'}</strong></span>
                      <span className="text-emerald-300 font-mono font-bold">
                        Rent: P{(t.agreedRent || 1450).toLocaleString()}/mo
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-amber-400/20">
                      <span className="text-[10px] text-slate-400">
                        Applied on {t.createdAt}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(t);
                            setShowRejectModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleOpenApproveModal(t)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-[11px] font-extrabold transition cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Assign Unit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 2: Past Tenant Details */}
                {isPast && (
                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-indigo-200 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          Former Unit: <strong>{t.formerUnitNumber || 'Past Residence'}</strong>
                          {t.formerPropertyName && ` (${t.formerPropertyName})`}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1">
                      <span>Tenancy: {t.leaseStart || 'Past'} &rarr; {t.moveOutDate || t.leaseEnd || 'Completed'}</span>
                      {t.depositRefunded !== undefined && (
                        <span className="text-emerald-400 font-bold font-mono">
                          Refund: P{t.depositRefunded.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {t.departureReason && (
                      <p className="text-[11px] text-amber-300/80 italic pt-1">
                        Exit Note: "{t.departureReason}"
                      </p>
                    )}
                  </div>
                )}

                {/* Case 3: Approved Active Tenant Units */}
                {!isPending && !isPast && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Assigned Unit Number:
                      </p>
                      {t.approvedBy && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Approved by {t.approvedBy}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assignedUnits.length > 0 ? (
                        assignedUnits.map((u) => {
                          const prop = properties.find((p) => p.id === u.propertyId);
                          return (
                            <span
                              key={u.id}
                              className="px-3 py-1 rounded-xl liquid-glass-pill text-cyan-300 border border-cyan-400/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                            >
                              <Home className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{prop?.name} &bull; <strong>{u.unitNumber}</strong></span>
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                (P{u.rentAmount}/mo)
                              </span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-500 text-xs italic">No units assigned</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank & KYC Card */}
                <div className="p-3 rounded-xl liquid-glass-subtle border border-white/10 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{t.bankDetails}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>KYC / Omang Ref: {t.kycIdPassport || 'National ID / Passport Unspecified'}</span>
                  </div>
                </div>

                {/* Notes & Tenancy History Preview */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tenancy History Notes ({notesCount})</span>
                    </p>
                    <button
                      onClick={() => {
                        setSelectedTenant(t);
                        setShowAddNoteModal(true);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Note</span>
                    </button>
                  </div>

                  {/* Recent notes preview */}
                  {t.historyNotes && t.historyNotes.length > 0 ? (
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {t.historyNotes.slice(0, 2).map((hn) => (
                        <div
                          key={hn.id}
                          className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-slate-300 flex items-start gap-2"
                        >
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] shrink-0 uppercase">
                            {hn.category}
                          </span>
                          <span className="line-clamp-1 flex-1">{hn.text}</span>
                          <span className="text-[9px] text-slate-500 shrink-0">{hn.date}</span>
                        </div>
                      ))}
                    </div>
                  ) : t.notes ? (
                    <p className="text-xs text-slate-400 italic bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      "{t.notes}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No notes recorded yet.</p>
                  )}
                </div>

                {/* Payments Overview Bar */}
                <div className="flex items-center justify-between text-xs bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tenantPayments.length} Payment(s) on record</span>
                  </span>
                  <span className="font-bold text-white font-mono">
                    Total: P{tenantPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons Toolbar on each Card */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* If pending, primary action is Approve */}
                    {isPending ? (
                      <button
                        onClick={() => handleOpenApproveModal(t)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Unit</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTenant(t);
                          setPaymentPeriod(isPast ? 'Historical Rent Settlement' : 'Current Rent');
                          setShowAddPaymentModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl liquid-glass border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        title={isPast ? 'Record historical rent payment' : 'Log rent payment'}
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isPast ? '+ Past Payment' : 'Log Rent'}</span>
                      </button>
                    )}

                    {!isPast && !isPending && (
                      <button
                        onClick={() => {
                          setSelectedTenant(t);
                          setMoveOutDate(new Date().toISOString().split('T')[0]);
                          setShowMoveOutModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl liquid-glass border border-amber-400/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        title="End tenancy and archive to past records"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Move Out</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTenant(t);
                      setShowHistoryDetailModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl liquid-glass text-cyan-300 hover:text-white border border-cyan-400/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>Full History & Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL: APPROVE TENANT & ASSIGN UNIT ================= */}
      {showApproveModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cyan-400/30 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Approve Tenant & Allocate Unit</h3>
                  <p className="text-xs text-slate-400">Confirm unit number and tenancy lease terms</p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Applicant Legal Name:</span>
                <span className="font-bold text-white text-sm">{selectedTenant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contact / Email:</span>
                <span className="font-mono text-cyan-300">{selectedTenant.contact}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Requested Unit:</span>
                <span className="font-mono font-bold text-amber-300">
                  {selectedTenant.requestedUnitNumber || 'Pending Allocation'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Omang / ID Ref:</span>
                <span className="font-mono text-slate-300">{selectedTenant.kycIdPassport || 'OMANG-VERIFIED'}</span>
              </div>
            </div>

            {/* Approval Form */}
            <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
              {/* Unit Selection Dropdown */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Confirm / Select Unit Number to Assign *
                </label>
                <select
                  required
                  value={approveUnitId}
                  onChange={(e) => handleApproveUnitChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white text-sm bg-slate-900 border border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="" disabled>-- Select Unit to Allocate --</option>
                  {/* First list available units */}
                  <optgroup label="Available Units (Ready for Allocation)" className="bg-slate-900 text-cyan-300">
                    {availableUnits.map((u) => {
                      const prop = properties.find((p) => p.id === u.propertyId);
                      return (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                          {u.unitNumber} &bull; {prop?.name} &mdash; P{u.rentAmount}/mo ({u.bedrooms || 2} Bed, {u.bathrooms || 1} Bath)
                        </option>
                      );
                    })}
                  </optgroup>

                  {/* Also list all other units if manager wants to reassign */}
                  <optgroup label="Other Units (Currently Occupied or Maintenance)" className="bg-slate-900 text-amber-300">
                    {units
                      .filter((u) => u.status !== 'Available')
                      .map((u) => {
                        const prop = properties.find((p) => p.id === u.propertyId);
                        return (
                          <option key={u.id} value={u.id} className="bg-slate-900 text-slate-300">
                            {u.unitNumber} &bull; {prop?.name} ({u.status}) &mdash; P{u.rentAmount}/mo
                          </option>
                        );
                      })}
                  </optgroup>
                </select>
                <p className="text-[11px] text-cyan-400 mt-1">
                  &bull; This unit will be marked as <strong>Occupied</strong> and assigned exclusively to {selectedTenant.name}.
                </p>
              </div>

              {/* Agreed Monthly Rent & Security Deposit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Monthly Rent (BWP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={approveAgreedRent}
                    onChange={(e) => setApproveAgreedRent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Security Deposit (BWP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={approveSecurityDeposit}
                    onChange={(e) => setApproveSecurityDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
              </div>

              {/* Lease Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Lease Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={approveLeaseStart}
                    onChange={(e) => setApproveLeaseStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Lease End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={approveLeaseEnd}
                    onChange={(e) => setApproveLeaseEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              {/* Approval Remarks */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Manager Approval Remarks & Audit Note
                </label>
                <textarea
                  rows={2}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 rounded-xl liquid-glass text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl liquid-btn-primary text-white font-bold transition cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Approval & Issue Unit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT TENANT APPLICATION ================= */}
      {showRejectModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-400/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-base">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Reject Tenant Application</span>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to decline the tenant application for <strong>{selectedTenant.name}</strong>?
            </p>

            <form onSubmit={handleConfirmRejection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Rejection Reason:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white bg-slate-900"
                >
                  <option value="Unit already allocated to another tenant">
                    Unit already allocated to another tenant
                  </option>
                  <option value="Failed KYC or employment verification">
                    Failed KYC or employment verification
                  </option>
                  <option value="Credit / banking requirements not met">
                    Credit / banking requirements not met
                  </option>
                  <option value="Applicant requested lease cancellation">
                    Applicant requested lease cancellation
                  </option>
                  <option value="Other criteria not satisfied">
                    Other criteria not satisfied
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Additional Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  value={rejectCustomNotes}
                  onChange={(e) => setRejectCustomNotes(e.target.value)}
                  placeholder="Additional context recorded in audit notes..."
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-2 rounded-xl liquid-glass text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-600/30"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET DEMO DATA ================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-400/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base border-b border-white/10 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <span>Reset Demo Data for Testing</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset the entire Homebase database back to a clean baseline state so you can test the entire tenant approval process from start to finish:
            </p>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Units reset to Available (Units 102, 201, 202, 301, Suite 4A, etc.)</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1 Active Tenant: Marcus Vance in Unit 101</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>1 Ready Pending Applicant: Kagiso Modise (Requested Unit 102)</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Past Tenant History: Thabo Mogorosi & Lesego Tau</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl liquid-glass text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetData) onResetData();
                  setShowResetModal(false);
                  setActiveTab('pending');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold transition cursor-pointer shadow-lg shadow-amber-500/25"
              >
                Reset System Data Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ONBOARD NEW ACTIVE TENANT ================= */}
      {showActiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Onboard New Tenant</span>
              </h3>
              <button
                onClick={() => setShowActiveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActiveTenantSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={activeName}
                    onChange={(e) => setActiveName(e.target.value)}
                    placeholder="e.g. Neo Morake"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={activeContact}
                    onChange={(e) => setActiveContact(e.target.value)}
                    placeholder="+267 71 000 000"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={activeEmail}
                    onChange={(e) => setActiveEmail(e.target.value)}
                    placeholder="tenant@example.com"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Omang / ID / Passport</label>
                  <input
                    type="text"
                    value={activeKycIdPassport}
                    onChange={(e) => setActiveKycIdPassport(e.target.value)}
                    placeholder="OMANG-BW-..."
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bank / Payment Method *</label>
                <input
                  type="text"
                  required
                  value={activeBankDetails}
                  onChange={(e) => setActiveBankDetails(e.target.value)}
                  placeholder="e.g. FNB Botswana - Acc **** 4892"
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                />
              </div>

              {/* Units to Allocate */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assign to Available Unit(s) *
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl liquid-glass-subtle border border-white/10">
                  {availableUnits.length === 0 ? (
                    <p className="text-slate-400 italic p-2">No units currently available. You can add without unit and allocate later.</p>
                  ) : (
                    availableUnits.map((u) => {
                      const prop = properties.find((p) => p.id === u.propertyId);
                      const isSelected = activeSelectedUnitIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleUnitSelection(u.id)}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold'
                              : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Home className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{prop?.name} &bull; {u.unitNumber}</span>
                          </span>
                          <span className="font-mono text-cyan-300 font-bold">P{u.rentAmount}/mo</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Lease Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lease Start</label>
                  <input
                    type="date"
                    value={activeLeaseStart}
                    onChange={(e) => setActiveLeaseStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lease End</label>
                  <input
                    type="date"
                    value={activeLeaseEnd}
                    onChange={(e) => setActiveLeaseEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Tenancy Note</label>
                <textarea
                  rows={2}
                  value={activeInitialNote}
                  onChange={(e) => setActiveInitialNote(e.target.value)}
                  placeholder="Optional onboarding remarks..."
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowActiveModal(false)}
                  className="px-4 py-2 rounded-xl liquid-glass text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl liquid-btn-primary text-white font-bold"
                >
                  Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAST TENANT HISTORY ================= */}
      {showPastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-amber-400/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Record Past Tenant History</h3>
                  <p className="text-xs text-slate-400">Input historical payments, departure remarks, and references</p>
                </div>
              </div>
              <button
                onClick={() => setShowPastModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePastTenantSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Past Tenant Name *</label>
                  <input
                    type="text"
                    required
                    value={pastName}
                    onChange={(e) => setPastName(e.target.value)}
                    placeholder="e.g. Thabo Mogorosi"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={pastContact}
                    onChange={(e) => setPastContact(e.target.value)}
                    placeholder="+267 72 000 000"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Former Property Name</label>
                  <input
                    type="text"
                    value={pastFormerProperty}
                    onChange={(e) => setPastFormerProperty(e.target.value)}
                    placeholder="e.g. Sunset Park Apartments"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Former Unit Number</label>
                  <input
                    type="text"
                    value={pastFormerUnit}
                    onChange={(e) => setPastFormerUnit(e.target.value)}
                    placeholder="e.g. 101 - Garden View"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tenancy Start Date</label>
                  <input
                    type="date"
                    value={pastLeaseStart}
                    onChange={(e) => setPastLeaseStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Move-Out Date</label>
                  <input
                    type="date"
                    value={pastMoveOutDate}
                    onChange={(e) => setPastMoveOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Departure / Exit</label>
                <input
                  type="text"
                  value={pastDepartureReason}
                  onChange={(e) => setPastDepartureReason(e.target.value)}
                  placeholder="e.g. Completed 12-month lease; relocated to Francistown"
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Security Deposit Refunded (BWP)</label>
                  <input
                    type="number"
                    value={pastDepositRefunded}
                    onChange={(e) => setPastDepositRefunded(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deposit Deductions (BWP)</label>
                  <input
                    type="number"
                    value={pastDepositDeductions}
                    onChange={(e) => setPastDepositDeductions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Historical Tenancy Notes & Reference Review</label>
                <textarea
                  rows={2}
                  value={pastNotes}
                  onChange={(e) => setPastNotes(e.target.value)}
                  placeholder="Payment reliability notes, apartment condition, reference for future landlords..."
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white resize-none"
                />
              </div>

              {/* Initial Historical Payment Entry */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/20 space-y-2.5">
                <label className="flex items-center gap-2 font-bold text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInitialPastPayment}
                    onChange={(e) => setIncludeInitialPastPayment(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                  />
                  <span>Record an Initial Historical Rent Payment Record</span>
                </label>

                {includeInitialPastPayment && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase">Amount (BWP)</label>
                        <input
                          type="number"
                          value={histAmount}
                          onChange={(e) => setHistAmount(Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg liquid-glass-input text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase">Date Paid</label>
                        <input
                          type="date"
                          value={histDate}
                          onChange={(e) => setHistDate(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg liquid-glass-input text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase">Receipt #</label>
                        <input
                          type="text"
                          value={histReceipt}
                          onChange={(e) => setHistReceipt(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg liquid-glass-input text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPastModal(false)}
                  className="px-4 py-2 rounded-xl liquid-glass text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
                >
                  Save Past Tenant History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TENANT NOTE ================= */}
      {showAddNoteModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-indigo-400/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>Add Note for {selectedTenant.name}</span>
              </div>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white bg-slate-900"
                >
                  <option value="General">General Remark</option>
                  <option value="Payment History">Payment History & Reliability</option>
                  <option value="Condition & Move-Out">Condition & Inspection</option>
                  <option value="Reference & Conduct">Reference & Conduct</option>
                  <option value="Deposit Settlement">Deposit Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Note Details *</label>
                <textarea
                  required
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record note details, inspection findings, payment notes..."
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl liquid-glass text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl liquid-btn-primary text-white font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD HISTORICAL PAYMENT ================= */}
      {showAddPaymentModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-400/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Log Payment for {selectedTenant.name}</span>
              </div>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (BWP) *</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expense / Deductible</label>
                  <input
                    type="number"
                    value={paymentExpense}
                    onChange={(e) => setPaymentExpense(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date Paid *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Receipt Number *</label>
                  <input
                    type="text"
                    required
                    value={paymentReceiptNumber}
                    onChange={(e) => setPaymentReceiptNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Period Covered</label>
                <input
                  type="text"
                  value={paymentPeriod}
                  onChange={(e) => setPaymentPeriod(e.target.value)}
                  placeholder="e.g. August 2026 Rent"
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white bg-slate-900"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online Portal">Online Tenant Portal</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Remarks / Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Notes recorded with this transaction..."
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 rounded-xl liquid-glass text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold"
                >
                  Log Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MOVE OUT & ARCHIVE ================= */}
      {showMoveOutModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-400/30 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
                <LogOut className="w-5 h-5 text-amber-400" />
                <span>Move Out & Archive: {selectedTenant.name}</span>
              </div>
              <button
                onClick={() => setShowMoveOutModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Moving out will free their currently assigned unit back to <strong>Available</strong> and transfer their complete tenancy record into Past Tenants History.
            </p>

            <form onSubmit={handleMoveOutSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Move-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Departure Reason</label>
                  <input
                    type="text"
                    value={moveOutReason}
                    onChange={(e) => setMoveOutReason(e.target.value)}
                    placeholder="e.g. Lease expired; relocated"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Security Deposit Refunded (BWP)</label>
                  <input
                    type="number"
                    value={moveOutDepositRefunded}
                    onChange={(e) => setMoveOutDepositRefunded(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deductions (BWP)</label>
                  <input
                    type="number"
                    value={moveOutDepositDeductions}
                    onChange={(e) => setMoveOutDepositDeductions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Exit Inspection Notes</label>
                <textarea
                  rows={2}
                  value={moveOutExitNotes}
                  onChange={(e) => setMoveOutExitNotes(e.target.value)}
                  placeholder="Keys returned, meter reading, property condition..."
                  className="w-full px-3 py-2 rounded-xl liquid-glass-input text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMoveOutModal(false)}
                  className="px-4 py-2 rounded-xl liquid-glass text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold"
                >
                  Confirm Move-Out & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL HISTORY & LEDGER DETAIL ================= */}
      {showHistoryDetailModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-cyan-400/30 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Tenancy History & Payment Ledger: {selectedTenant.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  ID: {selectedTenant.id} &bull; KYC: {selectedTenant.kycStatus} &bull; {selectedTenant.contact}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryDetailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tenancy Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Audit & Tenancy Notes Log</span>
                </h4>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedTenant.historyNotes && selectedTenant.historyNotes.length > 0 ? (
                  selectedTenant.historyNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono uppercase font-bold">
                          {n.category}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {n.date} &bull; {n.author}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed pt-0.5">{n.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    No timeline notes recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Payments Ledger Section */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Payments & Receipts Ledger</span>
                </h4>
                <button
                  onClick={() => {
                    setPaymentPeriod('Rent Payment');
                    setShowAddPaymentModal(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Payment</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Receipt #</th>
                      <th className="p-2.5">Period / Remarks</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5 text-right">Amount (BWP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {payments.filter((p) => p.tenantId === selectedTenant.id).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500 italic font-sans">
                          No payment transactions recorded for this tenant yet.
                        </td>
                      </tr>
                    ) : (
                      payments
                        .filter((p) => p.tenantId === selectedTenant.id)
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 text-slate-300">{p.date}</td>
                            <td className="p-2.5 text-cyan-300 font-bold">{p.receiptNumber}</td>
                            <td className="p-2.5 text-slate-300 font-sans text-[11px]">
                              {p.periodCovered || p.notes || '-'}
                            </td>
                            <td className="p-2.5 text-slate-400">{p.paymentMethod}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-400">
                              P{p.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowHistoryDetailModal(false)}
                className="px-5 py-2 rounded-xl liquid-glass text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
