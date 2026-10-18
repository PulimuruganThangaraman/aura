import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Clock, Sparkles, CheckCircle2, Timer, 
  Moon, Sun, Sunrise, Sunset, Coffee, ShieldAlert, X, CalendarCheck, AlertTriangle
} from 'lucide-react';
import apiClient from '../api/client';
import Pagination from '../components/Pagination';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    start_time: '09:00', 
    end_time: '17:00',
    break_minutes: 30,
    grace_minutes: 15,
    category: 'Day Shift (Standard)'
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/shifts');
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingShift(null);
    setForm({ 
      name: '', 
      start_time: '09:00', 
      end_time: '17:00',
      break_minutes: 30,
      grace_minutes: 15,
      category: 'Day Shift (Standard)'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingShift(s);
    setForm({ 
      name: s.name, 
      start_time: s.start_time, 
      end_time: s.end_time,
      break_minutes: s.break_minutes ?? 30,
      grace_minutes: s.grace_minutes ?? 15,
      category: s.name.toLowerCase().includes('night') || s.name.toLowerCase().includes('graveyard') 
        ? 'Overnight Graveyard (+25%)'
        : s.name.toLowerCase().includes('evening')
        ? 'Evening Shift (+15%)'
        : 'Day Shift (Standard)'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        break_minutes: parseInt(form.break_minutes) || 0,
        grace_minutes: parseInt(form.grace_minutes) || 0
      };
      if (editingShift) {
        await apiClient.put(`/shifts/${editingShift.id}`, payload);
      } else {
        await apiClient.post('/shifts', payload);
      }
      setModalOpen(false);
      fetchShifts();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  // Helper calculations
  const calculateTotalMinutes = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60; // Next-day overnight shift
    return diff;
  };

  const isOvernightShift = (start, end) => {
    if (!start || !end) return false;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) <= (sh * 60 + sm);
  };

  const formatMinutes = (totalMins) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
  };

  const format12Hour = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${period}`;
  };

  const getShiftIcon = (name, start) => {
    const lower = (name || '').toLowerCase();
    const hour = parseInt(start?.split(':')[0] || '9');
    if (lower.includes('night') || lower.includes('graveyard') || hour >= 21 || hour < 5) {
      return <Moon className="w-4 h-4 text-indigo-500" />;
    }
    if (lower.includes('evening') || (hour >= 16 && hour < 21)) {
      return <Sunset className="w-4 h-4 text-amber-500" />;
    }
    if (hour >= 5 && hour < 10) {
      return <Sunrise className="w-4 h-4 text-teal-600" />;
    }
    return <Sun className="w-4 h-4 text-emerald-600" />;
  };

  const filtered = shifts.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedShifts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Live preview metrics in Modal
  const previewGrossMins = calculateTotalMinutes(form.start_time, form.end_time);
  const previewNetMins = Math.max(0, previewGrossMins - (parseInt(form.break_minutes) || 0));
  const isOvernight = isOvernightShift(form.start_time, form.end_time);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Shift Windows & Roster Time Slots
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Roster Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard working windows, overnight graveyard shifts, break deductions, and attendance grace rules.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Shift</span>
        </button>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shifts by name..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold">Total: <strong className="text-slate-900">{filtered.length}</strong> Shift Windows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Shift Name & Type</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4 text-center">Gross Duration</th>
                <th className="py-3 px-4 text-center">Paid Working Hours</th>
                <th className="py-3 px-4">Break & Grace Rules</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No shift windows found</p>
                      <p className="text-xs text-slate-400">Click '+ Create Shift' to add standardized roster shifts.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedShifts.map((s) => {
                  const grossMins = calculateTotalMinutes(s.start_time, s.end_time);
                  const netMins = Math.max(0, grossMins - (s.break_minutes || 0));
                  const isOver = isOvernightShift(s.start_time, s.end_time);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {getShiftIcon(s.name, s.start_time)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-slate-900 leading-snug">{s.name}</p>
                              {isOver && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[9px] rounded border border-indigo-200">
                                  +1 Day (Overnight)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {format12Hour(s.start_time)} – {format12Hour(s.end_time)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {s.start_time} <span className="text-[10px] text-slate-400 font-normal">({format12Hour(s.start_time)})</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {s.end_time} <span className="text-[10px] text-slate-400 font-normal">({format12Hour(s.end_time)})</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md border border-slate-200">
                          {formatMinutes(grossMins)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 font-bold text-[10px] rounded-full border border-teal-200">
                          {formatMinutes(netMins)} Payable
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                          <span className="font-semibold">{s.break_minutes ?? 30}m break</span>
                          <span>•</span>
                          <span className="text-slate-500">{s.grace_minutes ?? 15}m grace</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 ml-auto font-semibold text-[11px] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
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
          itemLabel="shifts"
        />
      </div>

      {/* Enterprise Shift Window Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-8 relative border border-slate-100 overflow-hidden">
            
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
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {editingShift ? "Edit Shift Window" : "Create Shift Window"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Configure shift operating windows, automatic break deductions, and roster rules.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Live Shift Visualizer Card */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl border border-teal-200/70 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Timer className="w-3.5 h-3.5 text-teal-600" />
                    <span>Live Shift Schedule Preview</span>
                  </span>
                  {isOvernight && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full border border-indigo-200 flex items-center space-x-1">
                      <Moon className="w-3 h-3" />
                      <span>Overnight Shift (Next Day)</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {form.name || "Unnamed Shift Window"}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {form.start_time} ({format12Hour(form.start_time)}) → {form.end_time} ({format12Hour(form.end_time)})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Gross Duration</span>
                      <span className="text-xs font-bold text-slate-700">{formatMinutes(previewGrossMins)}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div>
                      <span className="text-[10px] text-teal-600 block">Payable Time</span>
                      <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {formatMinutes(previewNetMins)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Shift Title & Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shift Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="e.g. Morning Clinical Care (07:00 - 15:00)" 
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium" 
                />
              </div>

              {/* SECTION 2: Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time (24h Clock) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="time" 
                    value={form.start_time} 
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })} 
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-bold" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Displays as: <strong>{format12Hour(form.start_time)}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time (24h Clock) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="time" 
                    value={form.end_time} 
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })} 
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-bold" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Displays as: <strong>{format12Hour(form.end_time)}</strong>
                  </span>
                </div>
              </div>

              {/* SECTION 3: Break Deductions & Grace Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unpaid Break Deduction
                  </label>
                  <select 
                    value={form.break_minutes} 
                    onChange={(e) => setForm({ ...form, break_minutes: parseInt(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                  >
                    <option value={0}>☕ No Break Deduction (0 mins)</option>
                    <option value={15}>☕ 15 Minutes Short Break</option>
                    <option value={30}>☕ 30 Minutes Standard Meal Break</option>
                    <option value={45}>☕ 45 Minutes Break</option>
                    <option value={60}>☕ 60 Minutes Full Meal Break</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clock-in Grace Tolerance
                  </label>
                  <select 
                    value={form.grace_minutes} 
                    onChange={(e) => setForm({ ...form, grace_minutes: parseInt(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                  >
                    <option value={5}>⏱️ 5 Minutes Grace</option>
                    <option value={10}>⏱️ 10 Minutes Grace</option>
                    <option value={15}>⏱️ 15 Minutes Standard Grace</option>
                    <option value={30}>⏱️ 30 Minutes Extended Grace</option>
                  </select>
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
                  <span>{editingShift ? "Update Shift Window" : "Save Shift Window"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
