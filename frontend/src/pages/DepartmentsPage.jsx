import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Layers, Sparkles, ShieldCheck, Award, 
  FolderTree, FileText, CheckCircle2, Check, Tag
} from 'lucide-react';
import apiClient from '../api/client';
import Pagination from '../components/Pagination';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    parent_id: '',
    category_type: 'Disability & Aged Care',
    required_cert: 'First Aid CPR & NDIS Clearance'
  });

  const categoryTypes = [
    'Disability & Aged Care',
    'Clinical & Nursing Services',
    'Facility Maintenance & Safety',
    'Hygiene, Cleaning & Sanitation',
    'Allied Health & Therapy',
    'Corporate & Operations'
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
    setForm({ 
      name: '', 
      description: '', 
      parent_id: '',
      category_type: 'Disability & Aged Care',
      required_cert: 'First Aid CPR & NDIS Clearance'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDept(d);
    setForm({ 
      name: d.name, 
      description: d.description || '', 
      parent_id: d.parent_id || '',
      category_type: 'Disability & Aged Care',
      required_cert: 'First Aid CPR & NDIS Clearance'
    });
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

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedDepts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Departments & Specialized Skills
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              ShiftCare Competencies
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Care divisions, operational skill requirements, and specialty departments mapped to roster tasks.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments or skills..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold">Total: {filtered.length} Departments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Department / Skill Name</th>
                <th className="py-3 px-4">Description & Scope</th>
                <th className="py-3 px-4">Parent Division</th>
                <th className="py-3 px-4">Required Certifications</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No departments found matching your search</p>
                  </td>
                </tr>
              ) : (
                paginatedDepts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{d.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">CODE: DEP-{d.id.toString().padStart(3, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate font-medium">
                      {d.description || "Core facility skill discipline and roster competence."}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md border border-slate-200 inline-flex items-center gap-1">
                        <FolderTree className="w-3 h-3 text-slate-400" />
                        <span>{d.parent_name || "Top Level"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] rounded-md border border-teal-200 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-teal-600" />
                        <span>First Aid & NDIS Screening</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{d.modified_by || "System Admin"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 ml-auto font-semibold text-[11px] cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
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
          itemLabel="departments"
        />
      </div>

      {/* Modern ShiftCare Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 relative border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {editingDept ? "Edit Department / Specialty Skill" : "Add Department / Skill"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define care divisions, qualification requirements, and roster matching rules.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200 shrink-0">
                Competencies
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Section 1: Department Info */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Department & Classification
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Skill Title *</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Disability Support & Complex Care" 
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Division Category</label>
                    <select 
                      value={form.category_type} 
                      onChange={(e) => setForm({ ...form, category_type: e.target.value })} 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      {categoryTypes.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent Division (Optional)</label>
                    <select 
                      value={form.parent_id} 
                      onChange={(e) => setForm({ ...form, parent_id: e.target.value })} 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      <option value="">None (Top Level Division)</option>
                      {departments.filter(d => !editingDept || d.id !== editingDept.id).map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Certification & Compliance */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Required Certifications & Qualifications
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Worker Certifications</label>
                  <input 
                    value={form.required_cert} 
                    onChange={(e) => setForm({ ...form, required_cert: e.target.value })} 
                    placeholder="e.g. First Aid & CPR, NDIS Worker Screening, Manual Handling" 
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Workers assigned to this department must hold valid verified clearance for these qualifications.
                  </p>
                </div>
              </div>

              {/* Section 3: Scope & Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Operational Scope</label>
                <textarea 
                  rows={2} 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Responsibilities, clinical requirements, and service expectations..." 
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" 
                />
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
                  {editingDept ? "Update Department" : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

