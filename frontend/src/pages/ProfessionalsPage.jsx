import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, UserCheck, ShieldAlert } from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', skills: 'Cleaning' });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetPro, setTargetPro] = useState(null);
  const [activeTaskWarning, setActiveTaskWarning] = useState('');

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/professionals');
      setProfessionals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPro(null);
    setForm({ first_name: '', last_name: '', email: '', phone_number: '', skills: 'Cleaning' });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPro(p);
    setForm({ first_name: p.first_name, last_name: p.last_name, email: p.email, phone_number: p.phone_number || '', skills: p.skills || 'Cleaning' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPro) {
        await apiClient.put(`/professionals/${editingPro.id}`, form);
      } else {
        await apiClient.post('/professionals', form);
      }
      setModalOpen(false);
      fetchProfessionals();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const handleOpenDeactivate = async (p) => {
    setTargetPro(p);
    setActiveTaskWarning('');
    if (p.is_active) {
      try {
        const check = await apiClient.get(`/professionals/${p.id}/check-active-tasks`);
        if (check.data.warning_message) {
          setActiveTaskWarning(check.data.warning_message);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setDeactivateModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetPro) return;
    try {
      await apiClient.post(`/professionals/${targetPro.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetPro(null);
      fetchProfessionals();
    } catch (err) {
      alert(err.response?.data?.detail || "Status toggle failed");
    }
  };

  const filtered = professionals.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.skills && p.skills.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Professionals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Assigned field personnel with expertise in specialized skills (Cleaning, Security, Plumbing)</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Professional</span>
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
              placeholder="Search professionals by name, email or skills..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Professionals</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">First Name</th>
                <th className="py-3 px-4">Last Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">No professionals found</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.first_name}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.last_name}</td>
                    <td className="py-3 px-4 text-slate-600">{p.phone_number || "N/A"}</td>
                    <td className="py-3 px-4 font-semibold text-blue-700">{p.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.skills ? p.skills.split(',').map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold text-[10px] rounded-md border border-blue-200">
                            {skill.trim()}
                          </span>
                        )) : <span className="text-slate-400">General</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.modified_by || "System"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.is_active ? 'bg-emerald-100 text-emerald-800' : 'badge-tomato'
                      }`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenDeactivate(p)}
                          className={`p-1 rounded-lg transition-colors flex items-center space-x-1 ${
                            p.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {p.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{p.is_active ? "Deactivate" : "Activate"}</span>
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
              {editingPro ? "Edit Professional" : "Add Professional"}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input required value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (Comma-separated) *</label>
                <input required value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Cleaning, Security, Plumbing" className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">{editingPro ? "UPDATE" : "CREATE"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetPro?.is_active ? "Deactivate Employee" : "Activate Employee"}
        message={`Are you sure you want to ${targetPro?.is_active ? 'deactivate' : 'activate'} ${targetPro?.first_name} ${targetPro?.last_name}?`}
        warningAlert={activeTaskWarning || (targetPro?.is_active ? "A warning mail will be sent to respective admins/supervisors if assigned to active jobs." : null)}
        isDeactivating={targetPro?.is_active}
      />
    </div>
  );
}
