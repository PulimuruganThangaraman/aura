import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, KeyRound, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import apiClient from '../api/client';
import { AuraLogo } from './LandingPage';

export default function LoginPage({ onBackToLanding }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('super.admin@auralinks.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleFastLogin = async (targetEmail, targetPassword) => {
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

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-md transition-all cursor-pointer z-20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <AuraLogo className="w-12 h-12 mb-2" textClassName="text-3xl font-black" />
          <p className="text-xs text-slate-500 font-medium mt-1">Enterprise Facility & Workforce Platform</p>
        </div>

        {/* Quick Demo Login Selectors */}
        <div className="bg-slate-50 rounded-2xl p-3 mb-6 border border-slate-200">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">Fast Demo Account Login (Click to Sign In)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFastLogin('super.admin@auralinks.com', '123456')}
              className="px-2.5 py-2 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-slate-700 text-xs font-medium rounded-xl text-left shadow-2xs transition-all group cursor-pointer"
            >
              <div className="font-bold text-blue-700 group-hover:text-blue-800">Super Admin</div>
              <div className="text-[10px] text-slate-500 truncate">super.admin@auralinks.com</div>
              <div className="text-[9px] text-blue-600 font-semibold mt-1">Pass: 123456 (Click to Login) →</div>
            </button>
            <button
              type="button"
              onClick={() => handleFastLogin('ushanlokuge@msn.com', '123456')}
              className="px-2.5 py-2 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-slate-700 text-xs font-medium rounded-xl text-left shadow-2xs transition-all group cursor-pointer"
            >
              <div className="font-bold text-emerald-700 group-hover:text-emerald-800">Company Admin</div>
              <div className="text-[10px] text-slate-500 truncate">ushanlokuge@msn.com</div>
              <div className="text-[9px] text-emerald-600 font-semibold mt-1">Pass: 123456 (Click to Login) →</div>
            </button>
          </div>
        </div>


        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@auralinks.com"
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? <span>Signing in...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Forgot Password</h3>
            <p className="text-xs text-slate-500 mb-4">Enter your registered email address to receive your password via email.</p>

            {forgotMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                >
                  Request Password
                </button>
              </form>
            )}

            <button
              onClick={() => { setShowForgot(false); setForgotMessage(''); }}
              className="mt-3 w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
