import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ToggleLeft, ToggleRight, Printer, QrCode, 
  MapPin, Grid, Building2, Compass, Layers, ShieldCheck, 
  Info, X, Sparkles, CheckCircle2, Sliders, KeyRound, ExternalLink, Navigation
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../api/client';
import { DeactivateModal, QRPrintModal } from '../components/Modals';
import Pagination from '../components/Pagination';

export default function WorkLocationsPage() {
  const [workLocations, setWorkLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWL, setEditingWL] = useState(null);
  const [form, setForm] = useState({ 
    location_id: '', 
    name: '', 
    description: '', 
    latitude: '', 
    longitude: '',
    zone_code: '',
    section_type: 'Patient Room',
    geo_radius: '25m',
    access_req: 'Standard'
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetWL, setTargetWL] = useState(null);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const [isBulkPrint, setIsBulkPrint] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFacilityFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wlRes, locRes] = await Promise.all([
        apiClient.get('/work-locations'),
        apiClient.get('/locations')
      ]);
      setWorkLocations(wlRes.data);
      setLocations(locRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingWL(null);
    const defaultLoc = locations[0];
    setForm({ 
      location_id: defaultLoc?.id || '', 
      name: '', 
      description: '', 
      latitude: defaultLoc?.latitude || '', 
      longitude: defaultLoc?.longitude || '',
      zone_code: '',
      section_type: 'Patient / Resident Room',
      geo_radius: '25m (Standard)',
      access_req: 'Standard Keycard'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (wl) => {
    setEditingWL(wl);
    setForm({
      location_id: wl.location_id,
      name: wl.name,
      description: wl.description || '',
      latitude: wl.latitude || '',
      longitude: wl.longitude || '',
      zone_code: wl.name.split(' - ')[1] || 'ZONE-' + (wl.id || '101'),
      section_type: 'Clinical & Operational Zone',
      geo_radius: '25m (Standard)',
      access_req: 'Standard Keycard'
    });
    setModalOpen(true);
  };

  const handleInheritParentGPS = () => {
    const parentLoc = locations.find(l => String(l.id) === String(form.location_id));
    if (parentLoc && (parentLoc.latitude || parentLoc.longitude)) {
      setForm(prev => ({
        ...prev,
        latitude: parentLoc.latitude || '',
        longitude: parentLoc.longitude || ''
      }));
    } else {
      alert("Parent facility does not have GPS coordinates configured yet.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        location_id: parseInt(form.location_id),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null
      };
      if (editingWL) {
        await apiClient.put(`/work-locations/${editingWL.id}`, payload);
      } else {
        await apiClient.post('/work-locations', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const handleConfirmToggle = async () => {
    if (!targetWL) return;
    try {
      await apiClient.post(`/work-locations/${targetWL.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetWL(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Status toggle failed");
    }
  };

  const handleOpenPrintSingle = (wl) => {
    setPrintTarget(wl);
    setIsBulkPrint(false);
    setPrintModalOpen(true);
  };

  const handleOpenPrintAll = () => {
    setIsBulkPrint(true);
    setPrintModalOpen(true);
  };

  const filtered = workLocations.filter(wl => {
    const matchesSearch = 
      wl.name.toLowerCase().includes(search.toLowerCase()) ||
      (wl.location_name && wl.location_name.toLowerCase().includes(search.toLowerCase())) ||
      (wl.qr_code_data && wl.qr_code_data.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFacility = selectedFacilityFilter === 'ALL' || String(wl.location_id) === String(selectedFacilityFilter);
    return matchesSearch && matchesFacility;
  });

  const paginatedWorkLocations = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selected parent location object for modal preview
  const selectedParentLocation = locations.find(l => String(l.id) === String(form.location_id));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Work Locations & Facility Sections
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              QR Geo-Tags
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Wards, rooms, mechanical plants, and printable high-res QR tags for GPS-verified worker attendance.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={handleOpenPrintAll}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print All QRs</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Section</span>
          </button>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search section name, facility, or QR code..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedFacilityFilter}
                onChange={(e) => setSelectedFacilityFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-medium"
              >
                <option value="ALL">🏢 All Facility Locations ({locations.length})</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-bold self-end md:self-auto shrink-0">
            Total: <strong className="text-slate-900">{filtered.length}</strong> Work Locations
          </span>
        </div>

        {/* Work Locations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center">QR Scan</th>
                <th className="py-3 px-4">Section Name & Details</th>
                <th className="py-3 px-4">Parent Facility</th>
                <th className="py-3 px-4">QR Token</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <QrCode className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No work locations match your criteria</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or parent facility filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedWorkLocations.map((wl) => (
                  <tr key={wl.id} className={`hover:bg-slate-50/80 transition-colors ${!wl.is_active ? 'row-inactive opacity-60' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <div 
                        onClick={() => handleOpenPrintSingle(wl)}
                        title="Click to preview & print QR badge"
                        className="w-10 h-10 border border-slate-200 hover:border-teal-400 rounded-xl p-1 bg-white shadow-2xs mx-auto flex items-center justify-center cursor-pointer group transition-all"
                      >
                        <QRCodeSVG value={wl.qr_code_data || "AURA-WL-" + wl.id} size={32} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-start space-x-2">
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{wl.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{wl.description || "Designated Shift Checkpoint & Care Area"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-semibold text-teal-800">{wl.location_name || "Facility"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {wl.qr_code_data || `QR-${wl.id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {wl.latitude && wl.longitude ? (
                        <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-600">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{Number(wl.latitude).toFixed(4)}, {Number(wl.longitude).toFixed(4)}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No GPS set</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{wl.modified_by || "System Admin"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        wl.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'badge-tomato'
                      }`}>
                        {wl.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenPrintSingle(wl)}
                          title="Print QR Badge"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(wl)}
                          className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetWL(wl); setDeactivateModalOpen(true); }}
                          className={`px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer ${
                            wl.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {wl.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span>{wl.is_active ? "Deactivate" : "Activate"}</span>
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
          itemLabel="work locations"
        />
      </div>

      {/* Modern Enterprise Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 relative border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
              <button 
                onClick={() => setModalOpen(false)} 
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {editingWL ? "Edit Work Location Section" : "Create Work Location Section"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Configure facility zones, GPS geo-fence checkpoints, and high-resolution QR scanning badges.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: Facility Association & Section Identity */}
              <div>
                <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Facility Association & Section Identity
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent Facility Location <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={form.location_id} 
                      onChange={(e) => setForm({ ...form, location_id: e.target.value })} 
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          🏢 {l.name} {l.city ? `(${l.city}, ${l.state || ''})` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedParentLocation && (
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        <span>Registered Facility: <strong>{selectedParentLocation.name}</strong> • {selectedParentLocation.city || 'Standard Hub'}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section / Room Title <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        required 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        placeholder="e.g. Memory Care Ward Room 104" 
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Zone / Room Classification
                      </label>
                      <select 
                        value={form.section_type} 
                        onChange={(e) => setForm({ ...form, section_type: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                      >
                        <option value="Patient / Resident Room">🛏️ Patient / Resident Room</option>
                        <option value="Clinical Nursing Station">🩺 Clinical Nursing Station</option>
                        <option value="Maintenance & Plant Room">⚙️ Maintenance & Plant Room</option>
                        <option value="Fire Pump & Emergency Control">🔥 Fire Pump & Emergency Control</option>
                        <option value="Common Lounge / Recreation">🛋️ Common Lounge / Recreation</option>
                        <option value="Pharmacy & Medical Storage">💊 Pharmacy & Medical Storage</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: QR Checkpoint & Geo-Tag Configuration */}
              <div>
                <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. QR Checkpoint & Geo-Tag Configuration
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  
                  {/* Left Column: Coordinates */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">GPS Geo-Fence Coordinates</span>
                      <button
                        type="button"
                        onClick={handleInheritParentGPS}
                        className="text-[11px] text-teal-700 hover:text-teal-800 font-bold flex items-center space-x-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <Navigation className="w-3 h-3 text-teal-600" />
                        <span>Copy Facility GPS</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Latitude</label>
                        <input 
                          type="number"
                          step="any"
                          value={form.latitude} 
                          onChange={(e) => setForm({ ...form, latitude: e.target.value })} 
                          placeholder="-37.8136" 
                          className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Longitude</label>
                        <input 
                          type="number"
                          step="any"
                          value={form.longitude} 
                          onChange={(e) => setForm({ ...form, longitude: e.target.value })} 
                          placeholder="144.9631" 
                          className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Geo-Fence Check-in Tolerance</label>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
                        {['15m (Strict)', '30m (Standard)', '50m (Wide)'].map((rad) => (
                          <button
                            key={rad}
                            type="button"
                            onClick={() => setForm({ ...form, geo_radius: rad })}
                            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-[11px] ${
                              form.geo_radius === rad 
                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {rad}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live QR Preview Card */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
                    <div className="p-2 border border-slate-200 rounded-lg bg-white shadow-xs mb-1.5">
                      <QRCodeSVG 
                        value={form.name ? `AURA-SCAN-${form.name.replace(/\s+/g, '-').toUpperCase()}` : "AURA-WORK-LOCATION"} 
                        size={64} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 tracking-tight block truncate max-w-[140px]">
                      {form.name || "Live QR Badge"}
                    </span>
                    <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 mt-1">
                      Ready to Scan
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Wayfinding Notes & Staff Instructions */}
              <div>
                <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
                  <Info className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Wayfinding Guide & Staff Access Notes
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description / Location Guide for Workers
                    </label>
                    <textarea 
                      rows={2} 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })} 
                      placeholder="e.g. Enter via South Elevators to Level 2. QR barcode is affixed next to the master equipment cabinet." 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Access Credentials Required
                      </label>
                      <select
                        value={form.access_req}
                        onChange={(e) => setForm({ ...form, access_req: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                      >
                        <option value="Standard">Standard Facility Access</option>
                        <option value="Keycard Required">Keycard / FOB Required</option>
                        <option value="PPE Required">PPE Mask & Gown Required</option>
                        <option value="Escort Required">Authorized Escort Required</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-800">QR Check-in Enforced</p>
                        <p className="text-[10px] text-slate-500">Require camera scan upon arrival</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingWL ? "Update Work Location" : "Save & Generate QR"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Print Modal */}
      <QRPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        item={printTarget}
        items={workLocations}
        isBulk={isBulkPrint}
      />

      {/* Deactivate/Activate Confirmation Modal */}
      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetWL?.is_active ? "Deactivate Section" : "Activate Section"}
        message={`Are you sure you want to ${targetWL?.is_active ? 'deactivate' : 'activate'} ${targetWL?.name}? Shift workers will no longer be able to scan into deactivated sections.`}
        isDeactivating={targetWL?.is_active}
      />
    </div>
  );
}
