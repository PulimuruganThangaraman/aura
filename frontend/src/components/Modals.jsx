import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, AlertTriangle, Printer, Plus, Trash2, Edit3, ShieldAlert, CheckCircle2, Clock, UserCog, Lock, UserCheck } from 'lucide-react';
import apiClient from '../api/client';

// 1. Generic Deactivate / Activate Confirmation Modal
export function DeactivateModal({ isOpen, onClose, onConfirm, title, message, warningAlert, isDeactivating }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDeactivating ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900">{title || "Confirm Status Change"}</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {message || "Are you sure you want to proceed with this status change?"}
        </p>

        {warningAlert && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-xs text-amber-800 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-medium">{warningAlert}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-colors cursor-pointer ${
              isDeactivating ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isDeactivating ? "Yes, Deactivate" : "Yes, Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Create / Edit Company Modal
export function CompanyModal({ isOpen, onClose, onSubmit, initialData }) {
  if (!isOpen) return null;
  const [form, setForm] = useState(initialData || {
    name: '', company_code: '', industry_type: 'Disability & Aged Care', contact_name: '', contact_email: '', phone_number: '', website: '',
    billing_address1: '', billing_address2: '', billing_city: '', billing_state: '', billing_zipcode: '',
    shipping_address1: '', shipping_address2: '', shipping_city: '', shipping_state: '', shipping_zipcode: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 my-8 animate-in fade-in duration-150 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 mb-4">
          {initialData ? "Edit Care Organization" : "Create Care Organization"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Code</label>
              <input name="company_code" value={form.company_code} onChange={handleChange} placeholder="Auto-generated if empty" className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector *</label>
              <select name="industry_type" value={form.industry_type} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 outline-none text-slate-800">
                <option value="Disability & Aged Care">Disability & Aged Care</option>
                <option value="NDIS Support Services">NDIS Support Services</option>
                <option value="Residential Health Facility">Residential Health Facility</option>
                <option value="Community Care & Nursing">Community Care & Nursing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact *</label>
              <input required name="contact_name" value={form.contact_name} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email *</label>
              <input required type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input required name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 outline-none text-slate-800" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-800 mb-2">Billing Address</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input name="billing_address1" value={form.billing_address1} onChange={handleChange} placeholder="Address 1" className="text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" />
              <input name="billing_address2" value={form.billing_address2} onChange={handleChange} placeholder="Address 2" className="text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" />
              <input name="billing_city" value={form.billing_city} onChange={handleChange} placeholder="City" className="text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" />
              <input name="billing_state" value={form.billing_state} onChange={handleChange} placeholder="State" className="text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" />
              <input name="billing_zipcode" value={form.billing_zipcode} onChange={handleChange} placeholder="Zipcode" className="text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" />
              <input name="website" value={form.website} onChange={handleChange} placeholder="Website URL" className="text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer">{initialData ? "Update Organization" : "Create Organization"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. QR Code Printable Modal (PDF / Grid Print Layout)
export function QRPrintModal({ isOpen, onClose, item, items, isBulk }) {
  if (!isOpen) return null;
  const [qrSize, setQrSize] = useState('Small'); // Small, Medium, A4

  const handlePrint = () => {
    window.print();
  };

  const listToPrint = isBulk ? (items || []) : (item ? [item] : []);

  const getDimensionClass = () => {
    if (qrSize === 'Small') return 'w-24 h-24 p-2';
    if (qrSize === 'Medium') return 'w-40 h-40 p-4';
    return 'w-64 h-64 p-6'; // A4
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 no-print cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between no-print">
          <span>AuraForcz QR Location Labels</span>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Badges</span>
          </button>
        </h3>

        <div className="mb-4 no-print">
          <label className="block text-xs font-bold text-slate-700 mb-1">Paper & Badge Dimension Size</label>
          <select
            value={qrSize}
            onChange={(e) => setQrSize(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800"
          >
            <option value="Small">Small (Door Badge / Pocket Badge)</option>
            <option value="Medium">Medium (Room Wall Plaque)</option>
            <option value="A4">A4 Full Poster Sheet</option>
          </select>
        </div>

        {/* Printable Area */}
        <div className="printable-area max-h-96 overflow-y-auto border border-slate-200 rounded-2xl p-4 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center">
            {listToPrint.map((wl, idx) => (
              <div key={idx} className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs w-full">
                <p className="text-xs font-bold text-slate-900 mb-0.5">{wl.name}</p>
                <p className="text-[10px] text-slate-500 mb-2">{wl.location_name || "AuraForcz Facility"}</p>
                
                <div className={`border-2 border-slate-800 rounded-xl bg-white ${getDimensionClass()}`}>
                  <QRCodeSVG value={wl.qr_code_data || "AURAFORCZ-WL-DEMO"} size={160} className="w-full h-full" />
                </div>

                <p className="text-[11px] font-mono font-bold text-teal-700 mt-2">{wl.qr_code_data}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Re-Schedule Task Modal with QR Code display
export function RescheduleModal({ isOpen, onClose, detail, onSubmit }) {
  if (!isOpen) return null;
  const [shiftName, setShiftName] = useState(detail?.shift_name || "Morning Shift (09:00 - 12:00)");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ detail_id: detail.id, shift_name: shiftName, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 mb-4">
          Reschedule Shift Task
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="w-20 h-20 border border-slate-300 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-2xs">
              <QRCodeSVG value={`TASK-${detail?.id || '01'}`} size={70} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{detail?.task_name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{detail?.category_name}</p>
              <p className="text-[11px] font-bold text-teal-700 mt-1">Section: {detail?.work_location_name}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Shift Slot *</label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800"
            >
              <option value="Morning Shift (09:00 - 12:00)">Morning Shift (09:00 - 12:00)</option>
              <option value="Afternoon Shift (13:00 - 17:00)">Afternoon Shift (13:00 - 17:00)</option>
              <option value="Evening Shift (18:00 - 22:00)">Evening Shift (18:00 - 22:00)</option>
              <option value="Night Care Shift (22:00 - 06:00)">Night Care Shift (22:00 - 06:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Worker Notes / Specific Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter special care instructions or checklist changes..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer">Update Roster Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. Super Admin -> Company Admin Creation & Management Modal
export function CompanyAdminModal({ isOpen, onClose, company, onAdminSaved }) {
  if (!isOpen || !company) return null;
  const [form, setForm] = useState({
    first_name: company.admin_name && company.admin_name !== 'Unassigned' ? company.admin_name.split(' ')[0] : (company.contact_name ? company.contact_name.split(' ')[0] : 'Admin'),
    last_name: company.admin_name && company.admin_name !== 'Unassigned' && company.admin_name.split(' ').length > 1 ? company.admin_name.split(' ').slice(1).join(' ') : 'Manager',
    email: company.admin_email && company.admin_email !== 'N/A' ? company.admin_email : (company.contact_email || `admin@${company.code.toLowerCase()}.com`),
    phone: company.admin_phone && company.admin_phone !== 'N/A' ? company.admin_phone : (company.phone_number || ''),
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/companies/${company.id}/admin`, form);
      if (onAdminSaved) onAdminSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save Company Admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-150 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Manage Company Admin</h2>
            <p className="text-xs text-slate-500 font-semibold">{company.name} ({company.code})</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input required name="first_name" value={form.first_name} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input required name="last_name" value={form.last_name} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-slate-800" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email (Login Username) *</label>
            <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password (Leave blank to keep current / 123456)</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 outline-none text-slate-800" />
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-800">
            <span className="font-bold">Super Admin Authority:</span> This user will receive full administrative authority to create Job Templates, manage Company Professionals, and assign Jobs & Tasks.
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer disabled:opacity-50">
              {loading ? "Saving..." : "Save Company Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

