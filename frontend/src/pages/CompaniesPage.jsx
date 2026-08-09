import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Building2, ExternalLink } from 'lucide-react';
import apiClient from '../api/client';
import { CompanyModal, DeactivateModal } from '../components/Modals';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
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
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_name && c.contact_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Companies</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage registered tenant organization accounts & services</p>
        </div>

        <button
          onClick={() => { setEditingCompany(null); setModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Company</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Filter / Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, code or contact..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Companies</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Shipping Address</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No companies found</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50 transition-colors ${!c.is_active ? 'row-inactive' : ''}`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center space-x-2">
                        <Building2 className={`w-4 h-4 ${c.is_active ? 'text-blue-600' : 'text-red-500'}`} />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">{c.code}</td>
                    <td className="py-3 px-4 text-slate-600">{c.industry_type || "General"}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {c.shipping_address1 ? `${c.shipping_address1}, ${c.shipping_city || ''}` : "Not specified"}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold">{c.contact_name || "N/A"}</div>
                      <div className="text-[10px] text-slate-400">{c.contact_email}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_active ? 'bg-emerald-100 text-emerald-800' : 'badge-tomato'
                      }`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingCompany(c); setModalOpen(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetCompany(c); setDeactivateModalOpen(true); }}
                          className={`p-1 rounded-lg transition-colors flex items-center space-x-1 ${
                            c.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {c.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{c.is_active ? "Deactivate" : "Activate"}</span>
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

      {/* Modals */}
      <CompanyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveCompany}
        initialData={editingCompany}
      />

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={targetCompany?.is_active ? "Deactivate Company" : "Activate Company"}
        message={`Are you sure you want to ${targetCompany?.is_active ? 'deactivate' : 'activate'} ${targetCompany?.name}?`}
        warningAlert={targetCompany?.is_active ? "You cannot create any other entities (users, locations, tasks) for deactivated companies until activated." : null}
        isDeactivating={targetCompany?.is_active}
      />
    </div>
  );
}
