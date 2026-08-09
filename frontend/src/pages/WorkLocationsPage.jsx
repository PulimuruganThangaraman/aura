import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../api/client';
import { DeactivateModal, QRPrintModal } from '../components/Modals';

export default function WorkLocationsPage() {
  const [workLocations, setWorkLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWL, setEditingWL] = useState(null);
  const [form, setForm] = useState({ location_id: '', name: '', description: '', latitude: '', longitude: '' });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetWL, setTargetWL] = useState(null);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const [isBulkPrint, setIsBulkPrint] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
    setForm({ location_id: locations[0]?.id || '', name: '', description: '', latitude: '', longitude: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (wl) => {
    setEditingWL(wl);
    setForm({
      location_id: wl.location_id,
      name: wl.name,
      description: wl.description || '',
      latitude: wl.latitude || '',
      longitude: wl.longitude || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        location_id: parseInt(form.location_id),
        name: form.name,
        description: form.description,
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

  const handleSinglePrint = (wl) => {
    setPrintTarget(wl);
    setIsBulkPrint(false);
    setPrintModalOpen(true);
  };

  const handleBulkPrint = () => {
    setIsBulkPrint(true);
    setPrintModalOpen(true);
  };

  const filtered = workLocations.filter(wl =>
    wl.name.toLowerCase().includes(search.toLowerCase()) ||
    (wl.location_name && wl.location_name.toLowerCase().includes(search.toLowerCase())) ||
    (wl.qr_code_data && wl.qr_code_data.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Work Locations (Section)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Individual places inside a location (e.g. 1st floor Men's Restroom at Sydney Airport)</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleBulkPrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print All QR Codes</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Location</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work locations or QR code data..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Work Locations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Latitude</th>
                <th className="py-3 px-4">Longitude</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">QR Code</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">No work locations found</td>
                </tr>
              ) : (
                filtered.map((wl) => (
                  <tr key={wl.id} className={`hover:bg-slate-50 transition-colors ${!wl.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-800">{wl.name}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{wl.location_name || "General"}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{wl.latitude || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{wl.longitude || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{wl.description || "N/A"}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                        <QRCodeSVG value={wl.qr_code_data || "AURA-WL-DEMO"} size={36} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{wl.modified_by || "Sid Tamilselvan"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wl.is_active ? 'bg-emerald-100 text-emerald-800' : 'badge-tomato'
                      }`}>
                        {wl.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleSinglePrint(wl)}
                          className="p-1 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Print</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(wl)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetWL(wl); setDeactivateModalOpen(true); }}
                          className={`p-1 rounded-lg transition-colors flex items-center space-x-1 ${
                            wl.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {wl.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{wl.is_active ? "Deactivate" : "Activate"}</span>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              {editingWL ? "Edit Work Location (Section)" : "Create Work Location (Section)"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Location *</label>
                <select required value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location (Section) Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. First Floor Men's Restroom" className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">{editingWL ? "UPDATE" : "CREATE"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QRPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        item={printTarget}
        items={workLocations}
        isBulk={isBulkPrint}
      />

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetWL?.is_active ? "Deactivate Work Location" : "Activate Work Location"}
        message={`Are you sure you want to ${targetWL?.is_active ? 'deactivate' : 'activate'} ${targetWL?.name}?`}
        warningAlert="Note: We cannot deactivate work location which is already assigned to some tasks."
        isDeactivating={targetWL?.is_active}
      />
    </div>
  );
}
