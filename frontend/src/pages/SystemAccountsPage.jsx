import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, UserCog, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';

export default function SystemAccountsPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', role: 'Client Location Manager', password: '123456' });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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
    setForm({ first_name: '', last_name: '', email: '', phone: '', role: 'Client Location Manager', password: '123456' });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiClient.put(`/system-users/${editingUser.id}`, form);
      } else {
        await apiClient.post('/system-users', form);
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

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">System Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage operational users with rights to create task templates, tasks & assign professionals</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Account</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user email, name or role..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No system accounts found</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-blue-700">{u.email}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{u.first_name} {u.last_name}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-200 text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.phone || "N/A"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'badge-tomato'
                      }`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetUser(u); setDeactivateModalOpen(true); }}
                          className={`p-1 rounded-lg transition-colors flex items-center space-x-1 ${
                            u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{u.is_active ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              {editingUser ? "Edit Account" : "Create Account"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                  <option value="Client Admin">Client Admin</option>
                  <option value="Client Location Manager">Client Location Manager</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">{editingUser ? "UPDATE" : "CREATE"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetUser?.is_active ? "Deactivate User" : "Activate User"}
        message={`Are you sure you want to ${targetUser?.is_active ? 'deactivate' : 'activate'} ${targetUser?.email}?`}
        warningAlert="Note: A system account can be only deactivated by their parents or their super parents."
        isDeactivating={targetUser?.is_active}
      />
    </div>
  );
}
