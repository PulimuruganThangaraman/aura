import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ToggleLeft, ToggleRight, UserCheck, ShieldAlert, 
  Mail, Phone, Sparkles, User, Tag, ShieldCheck, DollarSign, MapPin, 
  Award, Briefcase, HeartHandshake, AlertCircle, FileCheck
} from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';
import Pagination from '../components/Pagination';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState(null);
  
  // Expanded Care Professional Form Fields
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone_number: '', 
    department: 'Aged & Disability Care',
    employment_type: 'Casual',
    hourly_rate: '42.50',
    ndis_clearance_id: '',
    city_suburb: 'Melbourne, VIC',
    emergency_contact: '',
    compliance_status: 'Verified',
    skills: 'NDIS Support, Manual Handling, First Aid CPR' 
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetPro, setTargetPro] = useState(null);
  const [activeTaskWarning, setActiveTaskWarning] = useState('');

  const departmentsList = [
    'Aged & Disability Care',
    'Nursing & Clinical',
    'Facility Maintenance',
    'Cleaning & Sanitation',
    'Allied Health',
    'Administration'
  ];

  const employmentTypes = ['Casual', 'Full-Time', 'Part-Time', 'Contractor'];

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDeptFilter]);

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
    setForm({ 
      first_name: '', 
      last_name: '', 
      email: '', 
      phone_number: '', 
      department: 'Aged & Disability Care',
      employment_type: 'Casual',
      hourly_rate: '42.50',
      ndis_clearance_id: `NDIS-${Math.floor(100000 + Math.random() * 900000)}`,
      city_suburb: 'Melbourne, VIC',
      emergency_contact: '',
      compliance_status: 'Verified',
      skills: 'NDIS Support, Manual Handling, First Aid CPR' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPro(p);
    
    // Extract metadata from skills string if structured
    let skillsVal = p.skills || 'NDIS Support, Aged Care';
    let dept = 'Aged & Disability Care';
    let empType = 'Casual';
    let rate = '42.50';
    let ndisId = `NDIS-${p.id.toString().padStart(6, '0')}`;
    let city = 'Melbourne, VIC';
    let status = 'Verified';

    if (skillsVal.includes('[') && skillsVal.includes(']')) {
      const metaPart = skillsVal.match(/\[(.*?)\]/);
      if (metaPart) {
        const parts = metaPart[1].split('|').map(s => s.trim());
        parts.forEach(part => {
          if (part.startsWith('Dept:')) dept = part.replace('Dept:', '').trim();
          if (part.startsWith('Type:')) empType = part.replace('Type:', '').trim();
          if (part.startsWith('Rate:')) rate = part.replace('Rate:', '').replace('$/hr', '').trim();
          if (part.startsWith('NDIS:')) ndisId = part.replace('NDIS:', '').trim();
          if (part.startsWith('City:')) city = part.replace('City:', '').trim();
          if (part.startsWith('Status:')) status = part.replace('Status:', '').trim();
        });
      }
      skillsVal = skillsVal.replace(/\[.*?\]/, '').trim();
    }

    setForm({ 
      first_name: p.first_name, 
      last_name: p.last_name, 
      email: p.email, 
      phone_number: p.phone_number || '', 
      department: dept,
      employment_type: empType,
      hourly_rate: rate,
      ndis_clearance_id: ndisId,
      city_suburb: city,
      emergency_contact: '',
      compliance_status: status,
      skills: skillsVal 
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Pack rich metadata into structured string to maintain complete DB & API compatibility
      const metaTag = `[Dept: ${form.department} | Type: ${form.employment_type} | Rate: $${form.hourly_rate}/hr | NDIS: ${form.ndis_clearance_id} | City: ${form.city_suburb} | Status: ${form.compliance_status}]`;
      const combinedSkills = `${form.skills.trim()} ${metaTag}`;

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        skills: combinedSkills
      };

      if (editingPro) {
        await apiClient.put(`/professionals/${editingPro.id}`, payload);
      } else {
        await apiClient.post('/professionals', payload);
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

  // Helper to parse display fields from stored record
  const getProDetails = (p) => {
    let cleanSkills = p.skills || 'Support Worker';
    let dept = 'Aged & Disability Care';
    let empType = 'Casual';
    let rate = '$42.50/hr';
    let ndisId = `NDIS-${(p.id * 18341 % 900000 + 100000).toString()}`;
    let city = 'Melbourne, VIC';
    let compStatus = 'Verified';

    if (cleanSkills.includes('[') && cleanSkills.includes(']')) {
      const metaPart = cleanSkills.match(/\[(.*?)\]/);
      if (metaPart) {
        const parts = metaPart[1].split('|').map(s => s.trim());
        parts.forEach(part => {
          if (part.startsWith('Dept:')) dept = part.replace('Dept:', '').trim();
          if (part.startsWith('Type:')) empType = part.replace('Type:', '').trim();
          if (part.startsWith('Rate:')) rate = part.replace('Rate:', '').trim();
          if (part.startsWith('NDIS:')) ndisId = part.replace('NDIS:', '').trim();
          if (part.startsWith('City:')) city = part.replace('City:', '').trim();
          if (part.startsWith('Status:')) compStatus = part.replace('Status:', '').trim();
        });
      }
      cleanSkills = cleanSkills.replace(/\[.*?\]/, '').trim();
    }

    return { cleanSkills, dept, empType, rate, ndisId, city, compStatus };
  };

  const filtered = professionals.filter(p => {
    const details = getProDetails(p);
    const matchesSearch = 
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone_number && p.phone_number.includes(search)) ||
      details.cleanSkills.toLowerCase().includes(search.toLowerCase()) ||
      details.ndisId.toLowerCase().includes(search.toLowerCase()) ||
      details.dept.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDeptFilter === 'All' || details.dept === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const paginatedPros = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Support Workers & Care Professionals
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              AuraForcz Workforce
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage registered care workers, certified qualifications, NDIS screening clearances, and hourly pay rates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Care Professional</span>
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
                placeholder="Search by carer name, email, NDIS ID, or skill..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            {/* Department Quick Filter */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Dept:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700 focus:border-teal-500"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
            Showing {filtered.length} of {professionals.length} Professionals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Care Professional</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Department & Type</th>
                <th className="py-3 px-4">NDIS Clearance & Pay</th>
                <th className="py-3 px-4">Skills & Certifications</th>
                <th className="py-3 px-4 text-center">Compliance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No care professionals match your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedPros.map((p) => {
                  const details = getProDetails(p);
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${!p.is_active ? 'row-inactive' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center shrink-0 border border-teal-200/80 shadow-2xs">
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{p.first_name} {p.last_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">ID: PRO-{p.id.toString().padStart(3, '0')}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                {details.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <a href={`mailto:${p.email}`} className="text-teal-700 hover:underline flex items-center gap-1 font-medium truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{p.email}</span>
                          </a>
                          {p.phone_number ? (
                            <a href={`tel:${p.phone_number}`} className="hover:text-teal-600 flex items-center gap-1 font-mono text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{p.phone_number}</span>
                            </a>
                          ) : <span className="text-slate-400 text-[10px]">No phone listed</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-[10px] rounded-md border border-slate-200 inline-block">
                            {details.dept}
                          </span>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-600">
                              {details.empType}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-teal-600" />
                            <span className="font-mono text-[10px] font-bold text-slate-700">
                              {details.ndisId}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                            {details.rate}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {details.cleanSkills ? details.cleanSkills.split(',').slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-teal-50 text-teal-700 font-bold text-[9px] rounded border border-teal-200">
                              {skill.trim()}
                            </span>
                          )) : <span className="text-slate-400 text-[10px]">General Support</span>}
                          {details.cleanSkills.split(',').length > 3 && (
                            <span className="text-[9px] text-slate-400 font-semibold self-center">
                              +{details.cleanSkills.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          {details.compStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'badge-tomato'
                        }`}>
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenDeactivate(p)}
                            className={`px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer ${
                              p.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {p.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                            <span>{p.is_active ? "Deactivate" : "Activate"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          itemLabel="professionals"
        />
      </div>

      {/* Add / Edit Comprehensive Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 relative border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPro ? "Edit Care Professional Profile" : "Add Care Professional"}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in the complete certified profile for AuraForcz roster assignments.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                AuraForcz Workforce
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Section 1: Personal & Contact */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Personal & Contact Details
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                    <input 
                      required 
                      value={form.first_name} 
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
                      placeholder="e.g. Jackson"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                    <input 
                      required 
                      value={form.last_name} 
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
                      placeholder="e.g. Campbell"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input 
                      required 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      placeholder="worker@shiftcare.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input 
                      required 
                      value={form.phone_number} 
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })} 
                      placeholder="0400 000 000"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Suburb / City</label>
                    <input 
                      value={form.city_suburb} 
                      onChange={(e) => setForm({ ...form, city_suburb: e.target.value })} 
                      placeholder="Melbourne, VIC"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                    <input 
                      value={form.emergency_contact} 
                      onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} 
                      placeholder="Name & Contact Phone"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Department, Role & Pay Details */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Department, NDIS Clearance & Pay
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department / Specialty *</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      {departmentsList.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type *</label>
                    <select
                      value={form.employment_type}
                      onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      {employmentTypes.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate ($/hr) *</label>
                    <input 
                      required 
                      type="number" 
                      step="0.5" 
                      value={form.hourly_rate} 
                      onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} 
                      placeholder="42.50"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NDIS Clearance ID</label>
                    <input 
                      value={form.ndis_clearance_id} 
                      onChange={(e) => setForm({ ...form, ndis_clearance_id: e.target.value })} 
                      placeholder="NDIS-123456"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-mono" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Compliance Status</label>
                    <select
                      value={form.compliance_status}
                      onChange={(e) => setForm({ ...form, compliance_status: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      <option value="Verified">Verified ✓</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Renewing">Renewing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Skills & Certifications */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills & Certifications (Comma-separated) *
                </label>
                <input 
                  required 
                  value={form.skills} 
                  onChange={(e) => setForm({ ...form, skills: e.target.value })} 
                  placeholder="NDIS Support, Manual Handling, Medication Admin, First Aid" 
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" 
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Skills are automatically matched against roster task requirements during shift scheduling.
                </p>
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
                  {editingPro ? "Update Care Professional" : "Save Care Professional"}
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
        title={targetPro?.is_active ? "Deactivate Professional" : "Activate Professional"}
        message={`Are you sure you want to ${targetPro?.is_active ? 'deactivate' : 'activate'} ${targetPro?.first_name} ${targetPro?.last_name}?`}
        warningAlert={activeTaskWarning || (targetPro?.is_active ? "A warning notification will be sent to respective managers if assigned to active shifts." : null)}
        isDeactivating={targetPro?.is_active}
      />
    </div>
  );
}
