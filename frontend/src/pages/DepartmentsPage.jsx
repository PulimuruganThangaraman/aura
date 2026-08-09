import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Grid } from 'lucide-react';
import apiClient from '../api/client';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', parent_id: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setForm({ name: '', description: '', parent_id: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDept(d);
    setForm({ name: d.name, description: d.description || '', parent_id: d.parent_id || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        parent_id: form.parent_id ? parseInt(form.parent_id) : null
      };
      if (editingDept) {
        await apiClient.put(`/departments/${editingDept.id}`, payload);
      } else {
        await apiClient.post('/departments', payload);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return "None";
    const found = departments.find(d => d.id === parentId);
    return found ? found.name : "None";
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Departments (Skill Groups)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sections of an organization providing services. Supports parent-child department hierarchy.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Department</span>
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
              placeholder="Search departments..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Departments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Department (Skill Group) Name</th>
                <th className="py-3 px-4">Parent Department</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No departments found</td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                      <Grid className="w-4 h-4 text-blue-600" />
                      <span>{d.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{getParentName(d.parent_id)}</td>
                    <td className="py-3 px-4 text-slate-500">{d.description || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-500">{d.modified_by || "Ushan Lokuge"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1 ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              {editingDept ? "Edit Department (Skill Group)" : "Create Department (Skill Group)"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department (Skill Group) Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Department</label>
                <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                  <option value="">None (Top Level)</option>
                  {departments.filter(d => d.id !== editingDept?.id).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">{editingDept ? "UPDATE" : "CREATE"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
