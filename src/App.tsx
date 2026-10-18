import React, { useState, useEffect } from 'react';
import {
  User,
  Region,
  Property,
  Unit,
  Tenant,
  Payment,
  MaintenanceTicket,
  Reminder,
  SystemNotification,
  GoogleSyncConfig,
  FinancialStats,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { RegionsAndProperties } from './components/RegionsAndProperties';
import { UnitsGrid } from './components/UnitsGrid';
import { TenantOnboarding } from './components/TenantOnboarding';
import { PaymentLedger } from './components/PaymentLedger';
import { PrintableReceiptModal } from './components/PrintableReceiptModal';
import { RemindersCenter } from './components/RemindersCenter';
import { MaintenanceDesk } from './components/MaintenanceDesk';
import { GoogleCloudSyncPanel } from './components/GoogleCloudSyncPanel';
import { MobileNotificationTray } from './components/MobileNotificationTray';
import { AiPropertyAssistant } from './components/AiPropertyAssistant';
import { LoginPage } from './components/LoginPage';
import { PendingTenantView } from './components/PendingTenantView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [googleConfig, setGoogleConfig] = useState<GoogleSyncConfig>({
    isConnected: false,
    driveFolderId: 'homebase_hq_backup_folder',
    spreadsheetId: 'homebase_hq_financial_ledger_2026',
    autoSyncEnabled: true,
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [autoHideEnabled, setAutoHideEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('homebase_sidebar_autohide');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleToggleAutoHide = () => {
    setAutoHideEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('homebase_sidebar_autohide', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Load Initial Data from Backend Server API
  const fetchAllData = async () => {
    try {
      const [uRes, rRes, pRes, unRes, tRes, payRes, tickRes, remRes, notifRes, gRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()).catch(() => ({ user: null })),
        fetch('/api/regions').then((r) => r.json()).catch(() => []),
        fetch('/api/properties').then((r) => r.json()).catch(() => []),
        fetch('/api/units').then((r) => r.json()).catch(() => []),
        fetch('/api/tenants').then((r) => r.json()).catch(() => []),
        fetch('/api/payments').then((r) => r.json()).catch(() => []),
        fetch('/api/tickets').then((r) => r.json()).catch(() => []),
        fetch('/api/reminders').then((r) => r.json()).catch(() => []),
        fetch('/api/notifications').then((r) => r.json()).catch(() => []),
        fetch('/api/google/status').then((r) => r.json()).catch(() => null),
      ]);

      if (uRes && uRes.user) {
        setUser(uRes.user);
      } else {
        // Check if there is an active saved session
        try {
          const savedSession = localStorage.getItem('homebase_user_session');
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.username) {
              const switchRes = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: parsed.username }),
              }).then((r) => r.json()).catch(() => null);

              if (switchRes && switchRes.user) {
                setUser(switchRes.user);
              } else {
                localStorage.removeItem('homebase_user_session');
                setUser(null);
              }
            }
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }

      if (Array.isArray(rRes)) setRegions(rRes);
      if (Array.isArray(pRes)) setProperties(pRes);
      if (Array.isArray(unRes)) setUnits(unRes);
      if (Array.isArray(tRes)) setTenants(tRes);
      if (Array.isArray(payRes)) setPayments(payRes);
      if (Array.isArray(tickRes)) setTickets(tickRes);
      if (Array.isArray(remRes)) setReminders(remRes);
      if (Array.isArray(notifRes)) setNotifications(notifRes);
      if (gRes) setGoogleConfig(gRes);
    } catch (e) {
      console.error('Failed to load backend data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      localStorage.setItem('homebase_user_session', JSON.stringify(loggedInUser));
    } catch (e) {
      console.error(e);
    }
    fetchAllData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem('homebase_user_session');
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute Financial & Portfolio Stats
  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = payments.reduce((s, p) => s + (p.expense || 0), 0);
  const netRevenue = totalIncome - totalExpenses;
  const occupiedUnits = units.filter((u) => u.status === 'Occupied').length;
  const availableUnits = units.filter((u) => u.status === 'Available').length;
  const maintenanceUnits = units.filter((u) => u.status === 'Maintenance').length;
  const occupancyRate = units.length > 0 ? (occupiedUnits / units.length) * 100 : 0;
  const openTicketsCount = tickets.filter((t) => t.status !== 'Closed' && t.status !== 'Resolved').length;
  const pendingRemindersCount = reminders.filter((r) => r.status === 'Scheduled').length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const financialStats: FinancialStats = {
    totalIncome,
    totalExpenses,
    netRevenue,
    occupancyRate,
    totalUnits: units.length,
    occupiedUnits,
    availableUnits,
    maintenanceUnits,
    pendingRentCount: pendingRemindersCount,
    openTicketsCount,
  };

  // Actions
  const handleSwitchUser = async (username: string) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRegion = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const newRegion = await res.json();
      setRegions((prev) => [...prev, newRegion]);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRegion = async (id: string) => {
    try {
      await fetch(`/api/regions/${id}`, { method: 'DELETE' });
      setRegions((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProperty = async (name: string, address: string, regionId: string, imageUrl?: string) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, regionId, imageUrl }),
      });
      const newProp = await res.json();
      setProperties((prev) => [...prev, newProp]);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUnit = async (
    unitNumber: string,
    propertyId: string,
    meterSerial: string,
    waterMeterSerial: string,
    rentAmount: number,
    bedrooms: number,
    bathrooms: number
  ) => {
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitNumber, propertyId, meterSerial, waterMeterSerial, rentAmount, bedrooms, bathrooms }),
      });
      const newUnit = await res.json();
      setUnits((prev) => [...prev, newUnit]);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUnit = async (id: string, updates: Partial<Unit>) => {
    try {
      const res = await fetch(`/api/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)));
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTenant = async (tenantData: any) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData),
      });
      const newTenant = await res.json();
      setTenants((prev) => [...prev, newTenant]);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTenantNote = async (tenantId: string, text: string, category?: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, author: user?.name || 'Manager' }),
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveOutTenant = async (
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
  ) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/move-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveTenant = async (
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
  ) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, approvedBy: user?.name || 'Federico' }),
      });
      if (res.ok) {
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to approve tenant.');
      }
    } catch (e) {
      console.error('Approval error:', e);
    }
  };

  const handleRejectTenant = async (
    tenantId: string,
    data: { reason: string }
  ) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, rejectedBy: user?.name || 'Federico' }),
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Rejection error:', e);
    }
  };

  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  const handleLogPayment = async (paymentData: {
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
  }) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      const newPay = await res.json();
      setPayments((prev) => [newPay, ...prev]);
      setActiveReceiptPayment(newPay);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTicket = async (ticketData: {
    unitId: string;
    propertyId?: string;
    title: string;
    description: string;
    category: MaintenanceTicket['category'];
    priority: MaintenanceTicket['priority'];
    assignedTo?: string;
    imageUrl?: string;
  }) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      const newTicket = await res.json();
      setTickets((prev) => [newTicket, ...prev]);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTicket = async (id: string, status: MaintenanceTicket['status'], updateText?: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updateText }),
      });
      const updated = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReminder = async (reminderData: {
    tenantId: string;
    dueDate: string;
    amount: number;
    message: string;
    channel: Reminder['channel'];
    tone: Reminder['tone'];
  }) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });
      const newRem = await res.json();
      setReminders((prev) => [newRem, ...prev]);
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (data.reminder) {
        setReminders((prev) => prev.map((r) => (r.id === id ? data.reminder : r)));
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmGoogleAccount = async (email: string) => {
    try {
      const res = await fetch('/api/google/confirm-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.googleConfig) {
        setGoogleConfig(data.googleConfig);
        if (user) setUser({ ...user, googleConnected: true, googleEmail: email });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnectGoogleAccount = async () => {
    try {
      const res = await fetch('/api/google/disconnect-account', { method: 'POST' });
      const data = await res.json();
      if (data.googleConfig) {
        setGoogleConfig(data.googleConfig);
        if (user) setUser({ ...user, googleConnected: false, googleEmail: undefined });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncDrive = async () => {
    const res = await fetch('/api/google/sync-drive', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setGoogleConfig((prev) => ({
        ...prev,
        lastSyncedAt: data.lastSyncedAt,
        backupFileCount: data.backupFileCount,
      }));
      fetchAllData();
    }
  };

  const handleSyncSheets = async () => {
    const res = await fetch('/api/google/sync-sheets', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setGoogleConfig((prev) => ({
        ...prev,
        lastSyncedAt: data.lastSyncedAt,
      }));
      fetchAllData();
    }
  };

  const handleTriggerTestNotification = async () => {
    try {
      const res = await fetch('/api/notifications/trigger-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Mobile Payment Alert',
          message: 'Rent payment of $1,450 logged for Unit 101. Auto-backed to Google Drive.',
          type: 'payment',
        }),
      });
      const data = await res.json();
      if (data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotifsRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRunAiAnalysis = async () => {
    const res = await fetch('/api/ai/analyze', { method: 'POST' });
    const data = await res.json();
    return data.analysis;
  };

  const handleOpenQuickAction = (action: string) => {
    if (action === 'payment') setActiveView('payments');
    if (action === 'tenant') setActiveView('tenants');
    if (action === 'ticket') setActiveView('tickets');
    if (action === 'reminder') setActiveView('reminders');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center liquid-bg-mesh">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Loading Homebase HQ...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render the Liquid Glass Login Page (without names at bottom)
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged-in user is a tenant with pending approval, show the PendingTenantView
  if (user.role === 'tenant' && user.approvalStatus === 'Pending') {
    return (
      <PendingTenantView
        user={user}
        onLogout={handleLogout}
        onRefresh={fetchAllData}
        onSwitchToManager={() => handleSwitchUser('Federico')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 liquid-bg-mesh relative overflow-x-hidden">
      {/* Ambient Floating Chromatic Liquid Light Spheres for Authentic Glass Refraction */}
      <div className="w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] fixed -top-24 -left-24 pointer-events-none animate-liquid-orb-1" />
      <div className="w-[450px] h-[450px] rounded-full bg-cyan-500/12 blur-[120px] fixed top-1/3 -right-24 pointer-events-none animate-liquid-orb-2" />
      <div className="w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[130px] fixed -bottom-24 left-1/4 pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        user={user}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => setActiveView('notifications')}
        onOpenGoogleSync={() => setActiveView('google')}
        onOpenQuickAction={handleOpenQuickAction}
        activeView={activeView}
        setActiveView={setActiveView}
        onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        autoHideEnabled={autoHideEnabled}
        onToggleAutoHide={handleToggleAutoHide}
        onResetData={handleResetData}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto relative z-10">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          unreadNotifCount={unreadNotifCount}
          openTicketsCount={openTicketsCount}
          pendingRemindersCount={pendingRemindersCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          autoHideEnabled={autoHideEnabled}
          onToggleAutoHide={handleToggleAutoHide}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {activeView === 'dashboard' && (
            <DashboardOverview
              stats={financialStats}
              payments={payments}
              tickets={tickets}
              units={units}
              tenants={tenants}
              notifications={notifications}
              onOpenReceipt={(p) => setActiveReceiptPayment(p)}
              onNavigate={(v) => setActiveView(v)}
              onOpenQuickAction={handleOpenQuickAction}
              isGoogleConnected={googleConfig.isConnected}
            />
          )}

          {activeView === 'properties' && (
            <RegionsAndProperties
              regions={regions}
              properties={properties}
              onAddRegion={handleAddRegion}
              onAddProperty={handleAddProperty}
              onDeleteRegion={handleDeleteRegion}
            />
          )}

          {activeView === 'units' && (
            <UnitsGrid
              units={units}
              properties={properties}
              tenants={tenants}
              onAddUnit={handleAddUnit}
              onUpdateUnit={handleUpdateUnit}
            />
          )}

          {activeView === 'tenants' && (
            <TenantOnboarding
              tenants={tenants}
              units={units}
              properties={properties}
              payments={payments}
              onAddTenant={handleAddTenant}
              onAddTenantNote={handleAddTenantNote}
              onMoveOutTenant={handleMoveOutTenant}
              onLogPayment={handleLogPayment}
              onApproveTenant={handleApproveTenant}
              onRejectTenant={handleRejectTenant}
              onResetData={handleResetData}
            />
          )}

          {activeView === 'payments' && (
            <PaymentLedger
              payments={payments}
              tenants={tenants}
              units={units}
              properties={properties}
              onLogPayment={handleLogPayment}
              onOpenReceipt={(p) => setActiveReceiptPayment(p)}
            />
          )}

          {activeView === 'reminders' && (
            <RemindersCenter
              reminders={reminders}
              tenants={tenants}
              units={units}
              onCreateReminder={handleCreateReminder}
              onSendReminder={handleSendReminder}
            />
          )}

          {activeView === 'tickets' && (
            <MaintenanceDesk
              tickets={tickets}
              units={units}
              properties={properties}
              tenants={tenants}
              onCreateTicket={handleCreateTicket}
              onUpdateTicket={handleUpdateTicket}
            />
          )}

          {activeView === 'google' && (
            <GoogleCloudSyncPanel
              user={user}
              config={googleConfig}
              onConfirmGoogleAccount={handleConfirmGoogleAccount}
              onDisconnectGoogleAccount={handleDisconnectGoogleAccount}
              onSyncDrive={handleSyncDrive}
              onSyncSheets={handleSyncSheets}
            />
          )}

          {activeView === 'notifications' && (
            <MobileNotificationTray
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifsRead}
              onTriggerTestNotification={handleTriggerTestNotification}
            />
          )}

          {activeView === 'ai' && <AiPropertyAssistant onAnalyze={handleRunAiAnalysis} />}
        </main>
      </div>

      {/* Printable Receipt Modal */}
      <PrintableReceiptModal
        payment={activeReceiptPayment}
        tenants={tenants}
        units={units}
        properties={properties}
        onClose={() => setActiveReceiptPayment(null)}
      />
    </div>
  );
}
