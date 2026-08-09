import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', contact_person: '', contact_email: '', contact_phone: '',
    city: '', state: '', zip_code: '', latitude: '', longitude: ''
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetLoc, setTargetLoc] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

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
    setForm({ name: '', description: '', contact_person: '', contact_email: '', contact_phone: '', city: '', state: '', zip_code: '', latitude: '', longitude: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (l) => {
    setEditingLoc(l);
    setForm({
      name: l.name, description: l.description || '', contact_person: l.contact_person || '', contact_email: l.contact_email || '',
      contact_phone: l.contact_phone || '', city: l.city || '', state: l.state || '', zip_code: l.zip_code || '',
      latitude: l.latitude || '', longitude: l.longitude || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
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
    (l.state && l.state.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Locations</h1>
          <p className="text-xs text-slate-500 mt-0.5">Places where professionals carry out tasks (e.g. Sydney Airport, The Glen Mall)</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Location</span>
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
              placeholder="Search locations by name, city or state..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Locations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">ZipCode</th>
                <th className="py-3 px-4">Latitude</th>
                <th className="py-3 px-4">Longitude</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">No locations found</td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className={`hover:bg-slate-50 transition-colors ${!l.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{l.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{l.state || "VIC"}</td>
                    <td className="py-3 px-4 text-slate-600">{l.city || "Melbourne"}</td>
                    <td className="py-3 px-4 text-slate-600">{l.zip_code || "3150"}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.latitude || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.longitude || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-500">{l.modified_by || "Sid Tamilselvan"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.is_active ? 'bg-emerald-100 text-emerald-800' : 'badge-tomato'
                      }`}>
                        {l.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetLoc(l); setDeactivateModalOpen(true); }}
                          className={`p-1 rounded-lg transition-colors flex items-center space-x-1 ${
                            l.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {l.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{l.is_active ? "Deactivate" : "Activate"}</span>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              {editingLoc ? "Edit Location" : "Create Location"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input required value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input required type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input required value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code *</label>
                  <input required value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
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

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">{editingLoc ? "UPDATE" : "CREATE"}</button>
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
        warningAlert={targetLoc?.is_active ? "Note: A location cannot be deleted if assigned to a task. Once deactivated, all associated work locations will also get deactivated." : null}
        isDeactivating={targetLoc?.is_active}
      />
    </div>
  );
}
