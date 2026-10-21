import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Lock, CheckCircle2, Shield, Mail, Phone, Building2, 
  MapPin, Calendar, Clock, Bell, ShieldCheck, KeyRound, Sparkles, 
  Check, Smartphone, Laptop, AlertCircle, Award, Eye, FileText, 
  ToggleLeft, ToggleRight, History, RefreshCw
} from 'lucide-react';
import apiClient from '../api/client';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Info Form State
  const [firstName, setFirstName] = useState(user?.first_name || 'Ushan');
  const [lastName, setLastName] = useState(user?.last_name || 'Lokuge');
  const [phone, setPhone] = useState(user?.phone || '0435 159 335');
  const [dob, setDob] = useState('1994-05-15');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('120 Collins Street, Melbourne, VIC 3000');
  const [emergencyContact, setEmergencyContact] = useState('Sarah Campbell - 0411 223 344');
  const [timezone, setTimezone] = useState('Australia/Melbourne (AEST UTC+10)');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification Preferences State
  const [notifPreferences, setNotifPreferences] = useState({
    rosterAlerts: true,
    smsDispatch: true,
    dailySummary: true,
    preShiftReminder: true,
    complianceExpiries: true,
    qrCheckinBroadcast: false
  });

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const isSuperAdmin = user?.role === 'Super Admin';
  const isCompanyAdmin = user?.role === 'Company Admin' || (!isSuperAdmin && user?.role !== 'Professional');
  const roleLabel = isSuperAdmin ? 'Super Admin' : (isCompanyAdmin ? 'Company Admin' : 'Care Professional');
  const companyName = user?.company_name || (isSuperAdmin ? 'Platform Global Platform' : 'Aura Disability & Aged Care Pty Ltd');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/auth/profile?user_id=${user?.id || 1}`, {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: user?.email
      });
      updateUserProfile({ first_name: firstName, last_name: lastName, phone: phone });
      setProfileMsg('Personal details and preferences updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    try {
      await apiClient.post(`/auth/reset-password?user_id=${user?.id || 1}`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setPasswordMsg('Security credentials and password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to reset password. Verify current password.");
    }
  };

  const toggleNotif = (key) => {
    setNotifPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ShiftCare Hero Profile Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Avatar with Status Ring */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-teal-600/30 border-2 border-teal-300/40">
                {firstName ? firstName[0] : 'U'}{lastName ? lastName[0] : 'L'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px]">
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {firstName} {lastName}
                </h1>
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{roleLabel}</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-semibold">
                  Verified Primary ✓
                </span>
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span>{user?.email || 'ushanlokuge@msn.com'}</span>
                <span>•</span>
                <span className="text-teal-300 font-medium">{companyName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Melbourne, Australia
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  AEST (UTC+10)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Session Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-stretch md:self-auto">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Health</span>
              <span className="text-xs font-black text-teal-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected (2FA)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* ShiftCare Modern Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-5 py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
              activeTab === 'personal'
                ? 'border-teal-600 text-teal-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal & Contact Details</span>
          </button>

          <button
            onClick={() => setActiveTab('organization')}
            className={`px-5 py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
              activeTab === 'organization'
                ? 'border-teal-600 text-teal-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organization & Role Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-teal-600 text-teal-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Passwords</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-teal-600 text-teal-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification & Shift Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-5 py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
              activeTab === 'activity'
                ? 'border-teal-600 text-teal-700 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit & Activity Log</span>
          </button>
        </div>

        {/* Tab 1: Personal & Contact Details */}
        {activeTab === 'personal' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500">Update your primary identity, contact details, and location timezone.</p>
              </div>

              {profileMsg && (
                <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">{profileMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Email (Verified)</label>
                    <div className="relative">
                      <input
                        disabled
                        value={user?.email || 'ushanlokuge@msn.com'}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-100/80 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Verified ✓
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0400 000 000"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, Suburb, State, Postcode"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                    <input
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Name & Contact Phone"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roster Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium bg-white"
                  >
                    <option value="Australia/Melbourne (AEST UTC+10)">Australia/Melbourne (AEST UTC+10)</option>
                    <option value="Australia/Sydney (AEST UTC+10)">Australia/Sydney (AEST UTC+10)</option>
                    <option value="Australia/Brisbane (AEST UTC+10)">Australia/Brisbane (AEST UTC+10)</option>
                    <option value="Australia/Perth (AWST UTC+8)">Australia/Perth (AWST UTC+8)</option>
                    <option value="Australia/Adelaide (ACST UTC+9:30)">Australia/Adelaide (ACST UTC+9:30)</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFirstName(user?.first_name || 'Ushan');
                      setLastName(user?.last_name || 'Lokuge');
                      setPhone(user?.phone || '0435 159 335');
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Organization & Role Permissions Matrix */}
        {activeTab === 'organization' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Organization & Permissions</h3>
              <p className="text-xs text-slate-500">Your assigned organizational authority and operational capability matrix.</p>
            </div>

            {/* Org Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Organization</span>
                <p className="text-xs font-black text-slate-900 mt-1">{companyName}</p>
                <span className="text-[10px] text-slate-500">Tenant ID: TEN-00{user?.company_id || 1}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">NDIS Provider Registration</span>
                <p className="text-xs font-black text-teal-800 mt-1">NDIS-PROV-4098231</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Active & Approved ✓</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Access Role</span>
                <p className="text-xs font-black text-slate-900 mt-1">{roleLabel}</p>
                <span className="text-[10px] text-teal-600 font-semibold">
                  {isSuperAdmin ? 'Global Platform Monitoring' : (isCompanyAdmin ? 'Full Operational Roster Authority' : 'Personal Shift Access')}
                </span>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Role Operational Permissions Matrix</h4>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {roleLabel} Scope
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { title: 'Create & Publish Rosters', desc: 'Build weekly schedules, assign care workers, and set shift times.', compAdmin: true, superAdmin: true, pro: false },
                  { title: 'Assign Care Professionals', desc: 'Directly dispatch tasks and shifts to qualified support staff.', compAdmin: true, superAdmin: true, pro: false },
                  { title: 'Manage Facility QR Codes', desc: 'Generate and configure location QR check-in tags.', compAdmin: true, superAdmin: true, pro: false },
                  { title: 'Deactivate / Activate Staff', desc: 'Toggle worker availability and monitor active assignment warnings.', compAdmin: true, superAdmin: true, pro: false },
                  { title: 'Cross-Company Global Monitoring', desc: 'Monitor tenant accounts across multiple organizational instances.', compAdmin: false, superAdmin: true, pro: false },
                  { title: 'Shift Check-In & Task Checklists', desc: 'Execute on-ground tasks and scan facility QR codes.', compAdmin: true, superAdmin: true, pro: true },
                  { title: 'Export Payroll & Compliance Audits', desc: 'Generate timesheets, award rate calculations, and incident logs.', compAdmin: true, superAdmin: true, pro: false }
                ].map((item, idx) => {
                  const hasAccess = isSuperAdmin ? item.superAdmin : (isCompanyAdmin ? item.compAdmin : item.pro);
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        hasAccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {hasAccess ? <><Check className="w-3 h-3 text-emerald-600" /> Authorized</> : 'Restricted'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Passwords */}
        {activeTab === 'security' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security Credentials & 2FA</h3>
                <p className="text-xs text-slate-500">Keep your account secure by rotating your password and maintaining 2-Factor Authentication.</p>
              </div>

              {passwordMsg && (
                <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">{passwordMsg}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{passwordError}</span>
                </div>
              )}

              {/* Password Change Form */}
              <form onSubmit={handleResetPassword} className="space-y-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-bold text-slate-800 block">Change Account Password</span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
                  <input
                    required
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password (demo: 123456)"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                    <input
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                    <input
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">Must include minimum 6 alphanumeric characters.</span>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Two Factor Authentication Card */}
              <div className="p-5 bg-teal-50/40 border border-teal-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-500">Require an authenticator code (Google Authenticator / Authy) on sign in.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className="cursor-pointer text-teal-700"
                >
                  {twoFactorEnabled ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full border border-slate-200">
                      Disabled
                    </span>
                  )}
                </button>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Active Login Sessions</h4>
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
                  <div className="p-3.5 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-3">
                      <Laptop className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="font-bold text-slate-800">Chrome on Windows 11 (Current Terminal)</p>
                        <p className="text-[10px] text-slate-400">IP: 127.0.0.1 • Melbourne, Australia • Active now</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                      Current
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="font-bold text-slate-800">AuraForcz Mobile App (iOS / Android)</p>
                        <p className="text-[10px] text-slate-400">Device ID: APP-8941 • Synced 2 hours ago</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => alert("Session revoked.")}
                      className="text-[10px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notification & Shift Preferences */}
        {activeTab === 'notifications' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notification & Roster Alert Preferences</h3>
                <p className="text-xs text-slate-500">Configure how and when AuraForcz dispatches roster changes, SMS broadcasts, and compliance alerts.</p>
              </div>

              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
                {[
                  { key: 'rosterAlerts', title: 'Real-Time Roster Publishing Alerts', desc: 'Receive instant notifications when new weekly care schedules are published.' },
                  { key: 'smsDispatch', title: 'SMS Emergency Fill-In Dispatch', desc: 'Send urgent SMS notifications to qualified carers when a shift becomes unassigned.' },
                  { key: 'dailySummary', title: 'Daily Shift Summary Email', desc: 'Receive a digest every morning at 07:00 AM with today scheduled care visits.' },
                  { key: 'preShiftReminder', title: 'Pre-Shift Worker Reminders (2h prior)', desc: 'Automatically send automated push alerts to workers 2 hours before shift start.' },
                  { key: 'complianceExpiries', title: 'NDIS Screening & First Aid Expiry Notices', desc: 'Alert managers 30 days prior to care worker certification expiration.' },
                  { key: 'qrCheckinBroadcast', title: 'Facility QR Code Check-In Notifications', desc: 'Receive live notifications when a care professional scans in on-site.' }
                ].map((item) => (
                  <div key={item.key} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="pr-4">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotif(item.key)}
                      className="cursor-pointer shrink-0"
                    >
                      {notifPreferences[item.key] ? (
                        <span className="px-3 py-1 bg-teal-600 text-white font-bold text-xs rounded-full shadow-2xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full border border-slate-200">
                          Muted
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => alert("Notification rules saved successfully!")}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Audit & Activity Log */}
        {activeTab === 'activity' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security & Operational Activity History</h3>
                <p className="text-xs text-slate-500">Immutable audit log of administrative actions, roster edits, and security events.</p>
              </div>
              <button 
                type="button"
                onClick={() => alert("Activity log refreshed.")}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
              {[
                { event: 'Published Weekly Roster Schedule', detail: 'Assigned 8 care professionals across 4 facility locations', time: 'Today at 10:45 AM', type: 'roster' },
                { event: 'Dispatched Shift Notification Broadcast', detail: 'Broadcast sent to all active carers for Morning Care shift', time: 'Today at 09:20 AM', type: 'broadcast' },
                { event: 'Updated Care Professional Profile', detail: 'Added NDIS clearance screening ID for Jackson Campbell', time: 'Yesterday at 03:15 PM', type: 'staff' },
                { event: 'Facility QR Code Generated', detail: 'Generated work location QR code for North Wing Ward B', time: '2 days ago', type: 'facility' },
                { event: 'Security Credentials Verified', detail: 'Successful multi-factor authentication sign in from Chrome Windows', time: '3 days ago', type: 'security' },
                { event: 'Exported NDIS Compliance Report', detail: 'Generated quarterly audit summary for management review', time: '5 days ago', type: 'report' }
              ].map((log, idx) => (
                <div key={idx} className="p-4 flex items-start justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{log.event}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{log.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-4">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

