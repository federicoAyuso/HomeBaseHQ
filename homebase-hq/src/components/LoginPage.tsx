import React, { useState, useEffect } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Home,
  Mail,
  Phone,
  FileCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

interface RegistrationUnit {
  id: string;
  unitNumber: string;
  propertyName: string;
  address: string;
  status: string;
  rentAmount: number;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In state
  const [username, setUsername] = useState(() => localStorage.getItem('homebase_saved_username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Tenant Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUnitId, setRegUnitId] = useState('');
  const [regCustomUnit, setRegCustomUnit] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regKycId, setRegKycId] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  // Units list for registration dropdown
  const [availableUnits, setAvailableUnits] = useState<RegistrationUnit[]>([]);

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch available units for registration
  useEffect(() => {
    fetch('/api/auth/registration-units')
      .then((res) => res.json())
      .then((data) => {
        if (data.units && Array.isArray(data.units)) {
          setAvailableUnits(data.units);
          if (data.units.length > 0) {
            setRegUnitId(data.units[0].id);
          }
        }
      })
      .catch((err) => console.warn('Could not preload registration units:', err));
  }, []);

  // Handle Standard Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Please verify your username and password.');
      }

      if (rememberMe) {
        localStorage.setItem('homebase_saved_username', username.trim());
      } else {
        localStorage.removeItem('homebase_saved_username');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Tenant Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!regAgreeTerms) {
      setErrorMessage('Please accept the tenant portal terms to complete registration.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          phone: regPhone.trim(),
          unitId: regUnitId === 'custom' ? '' : regUnitId,
          unitNumber: regUnitId === 'custom' ? regCustomUnit.trim() : undefined,
          kycIdPassport: regKycId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please check your information.');
      }

      setSuccessMessage(
        data.message ||
          'Registration submitted! Awaiting manager approval by Miranda & Federico for your requested unit.'
      );
      if (rememberMe) {
        localStorage.setItem('homebase_saved_username', regEmail.trim());
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration could not be completed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200 liquid-bg-mesh relative overflow-hidden">
      {/* Floating Ambient Chromatic Liquid Light Spheres */}
      <div className="w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[130px] fixed -top-28 -left-28 pointer-events-none animate-liquid-orb-1" />
      <div className="w-[460px] h-[460px] rounded-full bg-cyan-500/15 blur-[120px] fixed -bottom-24 -right-24 pointer-events-none animate-liquid-orb-2" />
      <div className="w-[380px] h-[380px] rounded-full bg-fuchsia-600/10 blur-[140px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500 my-6">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle Top Specular Shine Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3 group cursor-default">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-2xl shadow-cyan-500/30 bg-slate-900 mx-auto">
                <img
                  src="/logo.png"
                  alt="Homebase Logo"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              Homebase HQ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Botswana Rental & Property Management Platform
            </p>
          </div>

          {/* Dual Tab Mode Switcher: Sign In vs Tenant Registration */}
          <div className="flex p-1 bg-slate-900/60 rounded-2xl border border-white/10 mb-6 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Tenant Registration</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* ================= SIGN IN TAB ================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900/60 text-cyan-500 focus:ring-cyan-400/40 cursor-pointer accent-cyan-500"
                  />
                  <span>Remember this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => setErrorMessage('For password recovery, please contact your workspace administrator.')}
                  className="text-cyan-400 hover:text-cyan-300 transition font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl liquid-btn-primary font-bold text-sm flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Are you a new tenant? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Register your account here
                </button>
              </div>
            </form>
          )}

          {/* ================= TENANT REGISTRATION TAB ================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-200 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Create your tenant account to track lease terms, view rent receipts, and submit requests.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mpho Sebele"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tenant@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone / Mobile *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+267 71 234 567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Unit / Apartment
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <select
                    value={regUnitId}
                    onChange={(e) => setRegUnitId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium bg-slate-900/90 appearance-none cursor-pointer"
                  >
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.unitNumber} - {u.propertyName} ({u.status})
                      </option>
                    ))}
                    <option value="custom" className="bg-slate-900 text-white">
                      Other / Custom Unit Number
                    </option>
                    <option value="" className="bg-slate-900 text-white">
                      Not yet assigned / Pending allocation
                    </option>
                  </select>
                </div>
              </div>

              {regUnitId === 'custom' && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Enter Unit or Building Name
                  </label>
                  <input
                    type="text"
                    value={regCustomUnit}
                    onChange={(e) => setRegCustomUnit(e.target.value)}
                    placeholder="e.g. Unit 4B - Gaborone West Block 6"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Omang / National ID or Passport (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regKycId}
                    onChange={(e) => setRegKycId(e.target.value)}
                    placeholder="For KYC identity verification"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition font-medium"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={regAgreeTerms}
                    onChange={(e) => setRegAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-white/20 bg-slate-900/60 text-cyan-500 focus:ring-cyan-400/40 cursor-pointer accent-cyan-500 shrink-0"
                  />
                  <span className="leading-relaxed">
                    I agree to the Homebase Botswana Tenant Lease & Privacy Terms.
                  </span>
                </label>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Approval Notice:</strong> Tenant accounts require unit number confirmation and approval by property managers (Federico / Miranda) before lease activation.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl liquid-btn-primary font-bold text-sm flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Tenant Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration & Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage(null);
                  }}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Secure Environment Badge - strictly NO names at bottom */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
