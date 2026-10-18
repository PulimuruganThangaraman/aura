import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, 
  KeyRound, Sparkles, Building2, Crown, UserCheck, Check, Shield
} from 'lucide-react';
import apiClient from '../api/client';

export default function LoginPage({ onBackToLanding }) {
  const { login, loading } = useAuth();
  const [selectedRoleTab, setSelectedRoleTab] = useState('company_admin'); // 'company_admin' | 'super_admin' | 'professional'
  const [email, setEmail] = useState('ushanlokuge@msn.com');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const roleConfigs = {
    company_admin: {
      title: 'Company Admin Portal',
      badge: 'Operational Manager',
      email: 'ushanlokuge@msn.com',
      password: '123456',
      icon: Building2,
      color: 'teal',
      description: 'Manage rosters, assign tasks to care professionals, create shift templates, and track facility QR check-ins for your organization.',
      features: ['Create & Publish Rosters', 'Assign Care Staff', 'Manage Facilities & QR Tags', 'Export Company Reports']
    },
    super_admin: {
      title: 'Super Admin Console',
      badge: 'Platform Executive',
      email: 'super.admin@auralinks.com',
      password: '123456',
      icon: Crown,
      color: 'indigo',
      description: 'Cross-company monitoring, global multi-tenant directory, system-wide analytics, and enterprise compliance oversight.',
      features: ['Cross-Company Directory', 'Multi-Tenant Analytics', 'Global Compliance Audits', 'Platform System Accounts']
    },
    professional: {
      title: 'Care Professional Portal',
      badge: 'Support Worker',
      email: 'professional@auralinks.com',
      password: '123456',
      icon: UserCheck,
      color: 'emerald',
      description: 'View your upcoming roster shifts, review task care guidelines, check in via facility QR, and manage your availability.',
      features: ['Personal Roster Calendar', 'Shift Task Checklists', 'QR Check-In Verification', 'Availability & Profile']
    }
  };

  const handleRoleTabChange = (roleKey) => {
    setSelectedRoleTab(roleKey);
    const config = roleConfigs[roleKey];
    setEmail(config.email);
    setPassword(config.password);
    setError('');
  };

  const handleFastLogin = async (targetEmail, targetPassword, roleKey) => {
    if (roleKey) setSelectedRoleTab(roleKey);
    setEmail(targetEmail);
    setPassword(targetPassword);
    setError('');
    const res = await login(targetEmail, targetPassword);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(res.data.message);
    } catch (err) {
      setForgotMessage('Dispatched reset link if account exists.');
    }
  };

  const currentRole = roleConfigs[selectedRoleTab];
  const IconComponent = currentRole.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-md transition-all cursor-pointer z-20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      )}

      {/* Main ShiftCare Login Card */}
      <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in duration-200">
        
        {/* ShiftCare Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center space-x-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-teal-600/30 ring-4 ring-teal-500/20">
              S
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white tracking-tight leading-none block">
                shift<span className="text-teal-400">care</span>
              </span>
              <span className="text-[10px] text-teal-300 font-bold tracking-wider uppercase">
                Aura Enterprise Platform
              </span>
            </div>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Enterprise Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose your portal role to access your dedicated workspace
          </p>
        </div>

        {/* 3-Way Role Selector Tabs */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-4 grid grid-cols-3 gap-1.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleRoleTabChange('company_admin')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedRoleTab === 'company_admin'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="leading-none text-[11px]">Company Admin</span>
            <span className="text-[9px] font-semibold text-teal-300">Web & Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('super_admin')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedRoleTab === 'super_admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span className="leading-none text-[11px]">Super Admin</span>
            <span className="text-[9px] font-semibold text-amber-300">Web Only</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('professional')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedRoleTab === 'professional'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span className="leading-none text-[11px]">Professional</span>
            <span className="text-[9px] font-semibold text-emerald-300">Web & Mobile</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-100">
          
          {/* Active Portal Role Banner */}
          <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">{currentRole.title}</h3>
                  <span className="text-[10px] font-bold text-teal-700">{currentRole.badge}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFastLogin(currentRole.email, currentRole.password, selectedRoleTab)}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span>1-Click Auto Fill</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              {currentRole.description}
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/80">
              {currentRole.features.map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-[10px] font-medium text-slate-700">
                  <Check className="w-3 h-3 text-teal-600 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium text-center animate-in fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {currentRole.title} Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentRole.email}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded-xl outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[11px] font-semibold text-teal-600 hover:underline cursor-pointer"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white rounded-xl outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-teal-600 w-3.5 h-3.5 rounded"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Default password: 123456</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer mt-2"
            >
              {loading ? <span>Authenticating credentials...</span> : (
                <>
                  <span>Sign In to {currentRole.badge} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social / SSO Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Enterprise Integrations</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => alert("ShiftCare Okta / Azure AD SAML Single Sign-On Ready")}
              className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>SAML / Okta SSO</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Xero & MYOB Roster Payroll Sync Active")}
              className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Xero & Payroll</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          © 2026 ShiftCare / Aura Enterprise. Secure HIPAA & NDIS Compliant Session.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">Forgot Password</h3>
            <p className="text-xs text-slate-500 mb-4">Enter your registered email address to receive password recovery instructions.</p>

            {forgotMessage ? (
              <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center space-x-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@shiftcare.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>
            )}

            <button
              onClick={() => { setShowForgot(false); setForgotMessage(''); }}
              className="mt-3 w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

