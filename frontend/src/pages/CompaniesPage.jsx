import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ToggleLeft, ToggleRight, Building2, ExternalLink, 
  Mail, Phone, UserCog, Users, Briefcase, ListTodo, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import apiClient from '../api/client';
import { CompanyModal, DeactivateModal, CompanyAdminModal } from '../components/Modals';
import Pagination from '../components/Pagination';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState(null);

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminCompany, setAdminCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/companies/overview/stats');
      setCompanies(res.data);
    } catch (err) {
      // Fallback
      try {
        const fallbackRes = await apiClient.get('/companies');
        setCompanies(fallbackRes.data);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (formData) => {
    try {
      if (editingCompany) {
        await apiClient.put(`/companies/${editingCompany.id}`, formData);
      } else {
        await apiClient.post('/companies', formData);
      }
      setModalOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetCompany) return;
    try {
      await apiClient.post(`/companies/${targetCompany.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetCompany(null);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.detail || "Status toggle failed");
    }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(search.toLowerCase())) ||
    (c.contact_name && c.contact_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.admin_name && c.admin_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.admin_email && c.admin_email.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedCompanies = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Companies & Company Admins
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Super Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create companies and assign Company Admins. Company Admins manage their own professionals, jobs, and tasks.
          </p>
        </div>

        <button
          onClick={() => { setEditingCompany(null); setModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Company & Admin</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, code, or admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span>Total Companies: <strong className="text-slate-900">{companies.length}</strong></span>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading companies directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Company Details</th>
                  <th className="py-3 px-4">Company Admin Credentials</th>
                  <th className="py-3 px-4 text-center">Professionals</th>
                  <th className="py-3 px-4 text-center">Jobs Created</th>
                  <th className="py-3 px-4 text-center">Tasks Created</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No companies found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Code: {c.code} • {c.industry_type || 'Care Facility'}</div>
                        {c.website && <div className="text-[10px] text-indigo-600 underline truncate max-w-xs">{c.website}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900">{c.admin_name || c.contact_name || 'Unassigned'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.admin_email || c.contact_email || 'No Email'}</span>
                        </div>
                        {c.admin_phone && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.admin_phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {c.professionals_count !== undefined ? c.professionals_count : 0} staff
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                          {c.jobs_count !== undefined ? c.jobs_count : 0} jobs
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          {c.tasks_count !== undefined ? c.tasks_count : 0} tasks
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Manage Company Admin Button */}
                          <button
                            title="Manage Company Admin"
                            onClick={() => { setAdminCompany(c); setAdminModalOpen(true); }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            <span>Admin</span>
                          </button>

                          {/* Edit Company */}
                          <button
                            title="Edit Company"
                            onClick={() => { setEditingCompany(c); setModalOpen(true); }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            title={c.is_active ? "Deactivate Company" : "Activate Company"}
                            onClick={() => { setTargetCompany(c); setDeactivateModalOpen(true); }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              c.is_active ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {c.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          totalItems={filtered.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal: Create/Edit Company */}
      <CompanyModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCompany(null); }}
        onSubmit={handleSaveCompany}
        initialData={editingCompany}
      />

      {/* Modal: Manage Company Admin (Super Admin only feature) */}
      <CompanyAdminModal
        isOpen={adminModalOpen}
        onClose={() => { setAdminModalOpen(false); setAdminCompany(null); }}
        company={adminCompany}
        onAdminSaved={fetchCompanies}
      />

      {/* Modal: Deactivate Company */}
      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => { setDeactivateModalOpen(false); setTargetCompany(null); }}
        onConfirm={handleConfirmToggleStatus}
        title={targetCompany?.is_active ? "Deactivate Company" : "Activate Company"}
        message={targetCompany?.is_active 
          ? `Are you sure you want to deactivate ${targetCompany?.name}? All associated staff accounts will be temporarily suspended.` 
          : `Activate ${targetCompany?.name}? Staff and company admin accounts will regain access.`
        }
        isDeactivating={targetCompany?.is_active}
      />

    </div>
  );
}
