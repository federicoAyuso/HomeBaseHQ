import React, { useState } from 'react';
import { GoogleSyncConfig, User } from '../types';
import {
  Cloud,
  CloudCheck,
  HardDrive,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Download,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface GoogleCloudSyncPanelProps {
  user: User | null;
  config: GoogleSyncConfig;
  onConfirmGoogleAccount: (email: string) => void;
  onDisconnectGoogleAccount?: () => void;
  onSyncDrive: () => Promise<void>;
  onSyncSheets: () => Promise<void>;
}

export const GoogleCloudSyncPanel: React.FC<GoogleCloudSyncPanelProps> = ({
  user,
  config,
  onConfirmGoogleAccount,
  onDisconnectGoogleAccount,
  onSyncDrive,
  onSyncSheets,
}) => {
  const [googleEmailInput, setGoogleEmailInput] = useState(user?.googleEmail || '');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const isMainAccount = user?.role === 'main';

  const handleConfirmAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    onConfirmGoogleAccount(googleEmailInput);
    setSyncStatusMsg(`Google Account set to ${googleEmailInput}. Private cloud sync enabled.`);
  };

  const handleDisconnect = () => {
    if (onDisconnectGoogleAccount) {
      onDisconnectGoogleAccount();
      setSyncStatusMsg('Google Account unlinked. Enter an email when ready to connect cloud storage.');
      setGoogleEmailInput('');
    }
  };

  const handleTriggerDriveBackup = async () => {
    setIsSyncingDrive(true);
    setSyncStatusMsg(null);
    try {
      await onSyncDrive();
      setSyncStatusMsg('Transaction ledger, KYC receipts, and tenancy contracts successfully saved to Google Drive.');
    } catch (e) {
      setSyncStatusMsg('Sync error occurred.');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleTriggerSheetsSync = async () => {
    setIsSyncingSheets(true);
    setSyncStatusMsg(null);
    try {
      await onSyncSheets();
      setSyncStatusMsg('Financial ledger rows exported to Google Sheets in real-time.');
    } catch (e) {
      setSyncStatusMsg('Sync error occurred.');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <HardDrive className="w-5 h-5" />
          </div>
          <span>Private Cloud Storage & Google Drive / Sheets Integration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Securely sync property transactions, rent payments (P), and tenant KYC documents to your main account's private Google Cloud storage
        </p>
      </div>

      {/* Account Confirmation Panel */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3.5 rounded-2xl border ${
                config.isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              }`}
            >
              {config.isConnected ? (
                <CloudCheck className="w-8 h-8" />
              ) : (
                <Cloud className="w-8 h-8 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Main Account Google Connection</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    config.isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {config.isConnected ? 'CONNECTED & SECURE' : 'CONFIRMATION REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {config.isConnected
                  ? `Main account linked to: ${config.userEmail}`
                  : 'Account unlinked. Enter your preferred Google email below to connect when ready.'}
              </p>
            </div>
          </div>

          {config.isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 liquid-glass-pill hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-400/40 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition shrink-0 cursor-pointer"
            >
              Disconnect Account
            </button>
          ) : (
            isMainAccount && (
              <form onSubmit={handleConfirmAccount} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="Enter Google Account Email"
                  required
                  className="liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none min-w-[200px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                >
                  Connect Account
                </button>
              </form>
            )
          )}
        </div>

        {syncStatusMsg && (
          <div className="p-3.5 rounded-xl liquid-glass-subtle border border-cyan-400/30 text-xs text-cyan-200 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium">{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Cloud Storage Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Google Drive Backups */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Google Drive Storage Vault</h3>
                <p className="text-xs text-slate-400 font-mono">Folder ID: {config.driveFolderId}</p>
              </div>
            </div>

            <span className="text-[10px] liquid-glass-pill text-cyan-300 border border-cyan-400/20 px-2.5 py-1 rounded-lg font-mono font-semibold">
              {config.backupFileCount || 14} Backup Archives
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Automatically packages rent payment receipts (Pula), tenant lease agreements, and KYC passport scans into encrypted backup archives inside your private Google Drive storage.
          </p>

          <div className="pt-3 flex items-center justify-between border-t border-white/10">
            <span className="text-[11px] text-slate-400">
              Last Synced: {config.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : 'Just Now'}
            </span>

            <button
              onClick={handleTriggerDriveBackup}
              disabled={isSyncingDrive || !config.isConnected}
              className="px-3.5 py-2 rounded-xl liquid-btn-primary disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
              <span>{isSyncingDrive ? 'Saving...' : 'Backup Now to Drive'}</span>
            </button>
          </div>
        </div>

        {/* Module 2: Google Sheets Financial Ledger */}
        <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Google Sheets Financial Ledger</h3>
                <p className="text-xs text-slate-400 font-mono">Sheet ID: {config.spreadsheetId}</p>
              </div>
            </div>

            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              Live Spreadsheet
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Syncs structured rent income transactions, maintenance deductible lines, and regional portfolio revenue straight into your personal Google Sheets spreadsheet.
          </p>

          <div className="pt-3 flex items-center justify-between border-t border-white/10">
            <span className="text-[11px] text-slate-400 font-medium">
              Auto Sync: <strong className="text-emerald-400">{config.autoSyncEnabled ? 'Enabled' : 'Disabled'}</strong>
            </span>

            <button
              onClick={handleTriggerSheetsSync}
              disabled={isSyncingSheets || !config.isConnected}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'Syncing...' : 'Sync to Google Sheets'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
