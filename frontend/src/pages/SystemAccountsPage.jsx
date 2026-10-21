import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ToggleLeft, ToggleRight, UserCog, ShieldCheck, 
  Mail, Phone, Shield, Building2, MapPin, Check, KeyRound, Lock, 
  Sparkles, CheckCircle2, UserCheck, AlertCircle, Laptop
} from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';
import Pagination from '../components/Pagination';

export default function SystemAccountsPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Expanded Form State
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone: '', 
    role: 'Company Admin', 
    branch_location: 'Melbourne Operations Centre',
    facility_scope: 'All Facilities & Wards',
    enforce_2fa: true,
    send_welcome_email: true,
    password: '123456' 
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const rolesList = [
    { value: 'Company Admin', label: 'Company Admin (Full Agency & Roster Access)', badge: 'Full Access', color: 'teal', permissions: ['Create & Publish Rosters', 'Carer Dispatch & Scheduling', 'Facility QR Codes', 'Timesheets & Payroll Export', 'Audit Log Access'] },
    { value: 'Client Location Manager', label: 'Client Location Manager (Facility Lead)', badge: 'Facility Lead', color: 'blue', permissions: ['Facility Shift Oversight', 'Carer Check-In Verification', 'On-Site Incident Reporting', 'Work Location QR Management'] },
    { value: 'Supervisor', label: 'Supervisor (Roster Coordinator)', badge: 'Coordinator', color: 'indigo', permissions: ['Shift Roster Scheduling', 'Carer Re-Assignment', 'Broadcast Shift Alerts'] },
    { value: 'Compliance Officer', label: 'Compliance & Quality Officer', badge: 'Compliance', color: 'emerald', permissions: ['Worker Qualification Audits', 'NDIS Screening Oversight', 'Incident & Shift Compliance Reports'] }
  ];

  const facilityScopes = [
    'All Facilities & Wards',
    'Melbourne Central Health Facility',
    'Sydney Community Care Centre',
    'Brisbane Supported Living Hub',
    'Regional Disability Accommodation (SIL)'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/system-users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm({ 
      first_name: '', 
      last_name: '', 
      email: '', 
      phone: '', 
      role: 'Company Admin', 
      branch_location: 'Melbourne Operations Centre',
      facility_scope: 'All Facilities & Wards',
      enforce_2fa: true,
      send_welcome_email: true,
      password: '123456' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({ 
      first_name: u.first_name, 
      last_name: u.last_name, 
      email: u.email, 
      phone: u.phone || '', 
      role: u.role || 'Company Admin', 
      branch_location: 'Melbourne Operations Centre',
      facility_scope: 'All Facilities & Wards',
      enforce_2fa: true,
      send_welcome_email: false,
      password: '' 
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        password: form.password || undefined
      };

      if (editingUser) {
        await apiClient.put(`/system-users/${editingUser.id}`, payload);
      } else {
        await apiClient.post('/system-users', payload);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const handleConfirmToggle = async () => {
    if (!targetUser) return;
    try {
      await apiClient.post(`/system-users/${targetUser.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Status toggle failed");
    }
  };

  const currentSelectedRole = rolesList.find(r => r.value === form.role) || rolesList[0];

  const filtered = users.filter(u => {
    const matchesSearch = 
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getRoleBadgeStyle = (roleStr) => {
    const r = roleStr.toLowerCase();
    if (r.includes('admin')) {
      return 'bg-teal-50 text-teal-800 border-teal-200';
    } else if (r.includes('manager') || r.includes('location')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (r.includes('supervisor')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    } else {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Administrative & Supervisor Accounts
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              AuraForcz RBAC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System managers, facility supervisors, and client coordinators with administrative and rostering privileges.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Administrator</span>
        </button>
      </div>

      {/* Directory Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supervisors by name, email, or role..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-teal-500"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Company Admin</option>
                <option value="Manager">Location Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Compliance">Compliance Officer</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
            Showing {filtered.length} of {users.length} Administrative Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Account User</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Access Role & Scope</th>
                <th className="py-3 px-4">Phone Contact</th>
                <th className="py-3 px-4 text-center">Security 2FA</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <UserCog className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No administrative accounts match your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${!u.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 font-black text-xs flex items-center justify-center shrink-0 border border-slate-700 shadow-2xs">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{u.first_name} {u.last_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">ID: ADM-{u.id.toString().padStart(3, '0')}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Building2 className="w-2.5 h-2.5 text-slate-400" />
                              {u.company_name || "Melbourne Operations"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-teal-700">
                      <a href={`mailto:${u.email}`} className="hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{u.email}</span>
                      </a>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md border inline-flex items-center gap-1 ${getRoleBadgeStyle(u.role)}`}>
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Scope: All Facilities
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.phone ? (
                        <a href={`tel:${u.phone}`} className="hover:text-teal-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </a>
                      ) : <span className="text-slate-400">N/A</span>}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Enforced ✓</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-medium">{u.modified_by || "System Admin"}</td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'badge-tomato'
                      }`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetUser(u); setDeactivateModalOpen(true); }}
                          className={`px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer ${
                            u.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span>{u.is_active ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="accounts"
        />
      </div>

      {/* Modern ShiftCare Administrative Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 relative border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {editingUser ? "Edit Administrative Account" : "Add New Administrative Account"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure enterprise supervisor authority, facility delegation, and security credentials.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 shrink-0">
                AuraForcz RBAC
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Section 1: User Identity & Contact */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Identity & Contact Information
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                    <input 
                      required 
                      value={form.first_name} 
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
                      placeholder="e.g. Jackson"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                    <input 
                      required 
                      value={form.last_name} 
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
                      placeholder="e.g. Campbell"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Work Email *</label>
                    <input 
                      required 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      placeholder="admin@shiftcare.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone Contact</label>
                    <input 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      placeholder="0480 501 335"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Operations Office</label>
                  <input 
                    value={form.branch_location} 
                    onChange={(e) => setForm({ ...form, branch_location: e.target.value })} 
                    placeholder="Melbourne Operations Centre"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                  />
                </div>
              </div>

              {/* Section 2: Administrative Role & Access Scope */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Role Delegation & Scope
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Access Role *</label>
                    <select 
                      value={form.role} 
                      onChange={(e) => setForm({ ...form, role: e.target.value })} 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-bold"
                    >
                      {rolesList.map((r, i) => (
                        <option key={i} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Delegation Scope</label>
                    <select 
                      value={form.facility_scope} 
                      onChange={(e) => setForm({ ...form, facility_scope: e.target.value })} 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      {facilityScopes.map((f, i) => (
                        <option key={i} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role Capabilities Preview Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Authorized Operational Capabilities:</span>
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {currentSelectedRole.badge}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {currentSelectedRole.permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-700">
                        <Check className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate font-medium">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Security & Notification Defaults */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Security Credentials & Policies
                </span>

                {!editingUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Temporary Password *</label>
                    <input 
                      required 
                      type="password" 
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
                      placeholder="•••••••• (default: 123456)"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.enforce_2fa} 
                      onChange={(e) => setForm({ ...form, enforce_2fa: e.target.checked })} 
                      className="accent-teal-600 w-3.5 h-3.5 rounded" 
                    />
                    <span className="font-semibold">Enforce Two-Factor Authentication (2FA) on login</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.send_welcome_email} 
                      onChange={(e) => setForm({ ...form, send_welcome_email: e.target.checked })} 
                      className="accent-teal-600 w-3.5 h-3.5 rounded" 
                    />
                    <span className="font-medium text-slate-600">Send ShiftCare welcome activation email with credentials</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  {editingUser ? "Update Account" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetUser?.is_active ? "Deactivate Supervisor" : "Activate Supervisor"}
        message={`Are you sure you want to ${targetUser?.is_active ? 'deactivate' : 'activate'} ${targetUser?.first_name} ${targetUser?.last_name}?`}
        isDeactivating={targetUser?.is_active}
      />
    </div>
  );
}

