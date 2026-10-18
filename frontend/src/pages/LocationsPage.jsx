import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ToggleLeft, ToggleRight, MapPin, Mail, Phone, 
  Building2, Navigation, Users, ShieldCheck, CheckCircle2, Check
} from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';
import Pagination from '../components/Pagination';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [form, setForm] = useState({
    name: '', 
    description: '', 
    facility_type: 'Supported Independent Living (SIL)',
    contact_person: '', 
    contact_email: '', 
    contact_phone: '',
    city: '', 
    state: 'VIC', 
    zip_code: '', 
    capacity_beds: '12',
    latitude: '', 
    longitude: ''
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetLoc, setTargetLoc] = useState(null);

  const facilityTypes = [
    'Supported Independent Living (SIL)',
    'Residential Aged Care Facility',
    'Specialist Disability Accommodation (SDA)',
    'Community Health & Therapy Hub',
    'Hospital & Clinical Ward',
    'Corporate Operations Head Office'
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/locations');
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setForm({ 
      name: '', 
      description: '', 
      facility_type: 'Supported Independent Living (SIL)',
      contact_person: '', 
      contact_email: '', 
      contact_phone: '', 
      city: 'Melbourne', 
      state: 'VIC', 
      zip_code: '3000', 
      capacity_beds: '12',
      latitude: '-37.8136', 
      longitude: '144.9631' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (l) => {
    setEditingLoc(l);
    setForm({
      name: l.name, 
      description: l.description || '', 
      facility_type: 'Supported Independent Living (SIL)',
      contact_person: l.contact_person || '', 
      contact_email: l.contact_email || '',
      contact_phone: l.contact_phone || '', 
      city: l.city || 'Melbourne', 
      state: l.state || 'VIC', 
      zip_code: l.zip_code || '3000',
      capacity_beds: '12',
      latitude: l.latitude ? l.latitude.toString() : '', 
      longitude: l.longitude ? l.longitude.toString() : ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        contact_person: form.contact_person,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null
      };
      if (editingLoc) {
        await apiClient.put(`/locations/${editingLoc.id}`, payload);
      } else {
        await apiClient.post('/locations', payload);
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const handleConfirmToggle = async () => {
    if (!targetLoc) return;
    try {
      await apiClient.post(`/locations/${targetLoc.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetLoc(null);
      fetchLocations();
    } catch (err) {
      alert(err.response?.data?.detail || "Status toggle failed");
    }
  };

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.city && l.city.toLowerCase().includes(search.toLowerCase())) ||
    (l.contact_person && l.contact_person.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedLocations = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Facility Locations & Residences
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              ShiftCare Sites
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical facilities, residential care centers, SIL group homes, and client service locations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Facility Location</span>
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
              placeholder="Search locations by title, city, or manager..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold">Total: {filtered.length} Locations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Contact Manager</th>
                <th className="py-3 px-4">Contact Channels</th>
                <th className="py-3 px-4 text-center">Geo-Fence</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No facility locations found</p>
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((l) => (
                  <tr key={l.id} className={`hover:bg-slate-50/80 transition-colors ${!l.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{l.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: LOC-{l.id.toString().padStart(3, '0')}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{l.city || "Melbourne"}, {l.state || "VIC"} {l.zip_code || "3000"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      <span className="font-bold text-slate-900 block leading-tight">{l.contact_person || "Facility Lead"}</span>
                      <span className="text-[10px] text-slate-400">Operations Manager</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <a href={`mailto:${l.contact_email}`} className="text-teal-700 hover:underline flex items-center gap-1 font-medium text-[11px] truncate max-w-[180px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{l.contact_email || "facility@shiftcare.com"}</span>
                        </a>
                        {l.contact_phone && (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            {l.contact_phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-200 inline-flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-teal-600" />
                        <span>GPS Active</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-medium">{l.modified_by || "System Admin"}</td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'badge-tomato'
                      }`}>
                        {l.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetLoc(l); setDeactivateModalOpen(true); }}
                          className={`px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer ${
                            l.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {l.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span>{l.is_active ? "Deactivate" : "Activate"}</span>
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
          itemLabel="locations"
        />
      </div>

      {/* Modern ShiftCare Facility Location Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 animate-in fade-in duration-150 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {editingLoc ? "Edit Facility Location" : "Add Facility Location"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure residential care sites, contact managers, and GPS geo-fenced boundaries.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200 shrink-0">
                Care Sites
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Section 1: Facility Title & Category */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. Facility Identification & Classification
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility / Site Title *</label>
                    <input 
                      required 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="e.g. Box Hill Central Corporate Hub" 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facility Type</label>
                    <select 
                      value={form.facility_type} 
                      onChange={(e) => setForm({ ...form, facility_type: e.target.value })} 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium"
                    >
                      {facilityTypes.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Management */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. Facility Contact & Operations Lead
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Manager</label>
                    <input 
                      value={form.contact_person} 
                      onChange={(e) => setForm({ ...form, contact_person: e.target.value })} 
                      placeholder="e.g. Diana Prince"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      value={form.contact_email} 
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })} 
                      placeholder="diana@shiftcare.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone</label>
                    <input 
                      value={form.contact_phone} 
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} 
                      placeholder="03 9890 1234"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Physical Address & Geolocation */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Address & GPS Coordinates
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Suburb</label>
                    <input 
                      value={form.city} 
                      onChange={(e) => setForm({ ...form, city: e.target.value })} 
                      placeholder="Box Hill"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State / Region</label>
                    <input 
                      value={form.state} 
                      onChange={(e) => setForm({ ...form, state: e.target.value })} 
                      placeholder="VIC"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                    <input 
                      value={form.zip_code} 
                      onChange={(e) => setForm({ ...form, zip_code: e.target.value })} 
                      placeholder="3128"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white text-slate-800 font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Latitude Coordinate</label>
                    <input 
                      value={form.latitude} 
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })} 
                      placeholder="-37.818"
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white font-mono text-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Longitude Coordinate</label>
                    <input 
                      value={form.longitude} 
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })} 
                      placeholder="145.123"
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 bg-white font-mono text-slate-800" 
                    />
                  </div>
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
                  {editingLoc ? "Update Facility" : "Save Facility"}
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
        title={targetLoc?.is_active ? "Deactivate Location" : "Activate Location"}
        message={`Are you sure you want to ${targetLoc?.is_active ? 'deactivate' : 'activate'} ${targetLoc?.name}?`}
        isDeactivating={targetLoc?.is_active}
      />
    </div>
  );
}

