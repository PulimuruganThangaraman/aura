import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, AlertTriangle, Printer, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';

// 1. Generic Deactivate / Activate Confirmation Modal
export function DeactivateModal({ isOpen, onClose, onConfirm, title, message, warningAlert, isDeactivating }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-150 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-red-600 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{title || "Confirm Action"}</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {message || "Are you sure you want to proceed with this status change?"}
        </p>

        {warningAlert && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-800 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{warningAlert}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-colors ${
              isDeactivating ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isDeactivating ? "Yes, Deactivate This" : "Yes, Activate This"}
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
    name: '', company_code: '', industry_type: 'Cleaning Services', contact_name: '', contact_email: '', phone_number: '', website: '',
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 my-8 animate-in fade-in duration-150 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          {initialData ? "Edit Company" : "Create Company"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Code</label>
              <input name="company_code" value={form.company_code} onChange={handleChange} placeholder="Auto-generated if empty" className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Type *</label>
              <select name="industry_type" value={form.industry_type} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Cleaning Services">Cleaning Services</option>
                <option value="Security Services">Security Services</option>
                <option value="Facility Management">Facility Management</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
              <input required name="contact_name" value={form.contact_name} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
              <input required type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input required name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-800 mb-2">Billing Address</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input name="billing_address1" value={form.billing_address1} onChange={handleChange} placeholder="Address 1" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="billing_address2" value={form.billing_address2} onChange={handleChange} placeholder="Address 2" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="billing_city" value={form.billing_city} onChange={handleChange} placeholder="City" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="billing_state" value={form.billing_state} onChange={handleChange} placeholder="State" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="billing_zipcode" value={form.billing_zipcode} onChange={handleChange} placeholder="Zipcode" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="website" value={form.website} onChange={handleChange} placeholder="Website" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-800 mb-2">Shipping Address</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input name="shipping_address1" value={form.shipping_address1} onChange={handleChange} placeholder="Address 1" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="shipping_address2" value={form.shipping_address2} onChange={handleChange} placeholder="Address 2" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="shipping_city" value={form.shipping_city} onChange={handleChange} placeholder="City" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="shipping_state" value={form.shipping_state} onChange={handleChange} placeholder="State" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              <input name="shipping_zipcode" value={form.shipping_zipcode} onChange={handleChange} placeholder="Zipcode" className="text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">{initialData ? "UPDATE" : "CREATE"}</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in duration-150 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 no-print">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between no-print">
          <span>Select QR Code Size</span>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT ALL</span>
          </button>
        </h3>

        <div className="mb-4 no-print">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Paper / QR Display Size</label>
          <select
            value={qrSize}
            onChange={(e) => setQrSize(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none"
          >
            <option value="Small">Small (Pocket / Door Label)</option>
            <option value="Medium">Medium (Wall Badge)</option>
            <option value="A4">A4 Full Page Poster</option>
          </select>
        </div>

        {/* Printable Area */}
        <div className="printable-area max-h-96 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center">
            {listToPrint.map((wl, idx) => (
              <div key={idx} className="bg-white border border-slate-300 rounded-xl p-4 flex flex-col items-center text-center shadow-xs">
                <p className="text-xs font-bold text-slate-900 mb-1">{wl.name}</p>
                <p className="text-[10px] text-slate-500 mb-2">{wl.location_name || "AuraLinks Location"}</p>
                
                <div className={`border-2 border-slate-800 rounded-lg bg-white ${getDimensionClass()}`}>
                  <QRCodeSVG value={wl.qr_code_data || "AURA-WL-DEMO"} size={160} className="w-full h-full" />
                </div>

                <p className="text-[11px] font-mono font-bold text-blue-700 mt-2">{wl.qr_code_data}</p>
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
  const [shiftName, setShiftName] = useState(detail?.shift_name || "Evening Shift (18:00 - 22:00)");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ detail_id: detail.id, shift_name: shiftName, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-150 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          Add/Edit Task Schedule
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="w-20 h-20 border border-slate-300 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center">
              <QRCodeSVG value={`TASK-${detail?.id || '01'}`} size={70} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{detail?.task_name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{detail?.category_name}</p>
              <p className="text-[11px] font-medium text-blue-600 mt-1">Location: {detail?.work_location_name}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Shift *</label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none"
            >
              <option value="Morning Shift (9AM-12PM)">Morning Shift (9AM-12PM)</option>
              <option value="Morning Second Shift">Morning Second Shift (12:00-14:00)</option>
              <option value="Noon Shift (2PM-6PM)">Noon Shift (2PM-6PM)</option>
              <option value="Evening Shift (18:00 - 22:00)">Evening Shift (18:00 - 22:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional worker instructions..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">UPDATE TASK</button>
          </div>
        </form>
      </div>
    </div>
  );
}
