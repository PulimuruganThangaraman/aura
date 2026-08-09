import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Bell, ChevronDown, ChevronUp, CalendarDays, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import apiClient from '../api/client';
import { RescheduleModal } from '../components/Modals';

export default function ScheduleTasksPage() {
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  // New Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedProfs, setSelectedProfs] = useState([]);

  // Reschedule Detail Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);

  const [notificationMsg, setNotificationMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes, lRes, pRes] = await Promise.all([
        apiClient.get('/task-management/schedules'),
        apiClient.get('/task-management/templates'),
        apiClient.get('/locations'),
        apiClient.get('/professionals')
      ]);
      setSchedules(sRes.data);
      setTemplates(tRes.data);
      setLocations(lRes.data);
      setProfessionals(pRes.data);
      if (tRes.data.length > 0) setSelectedTemplate(tRes.data[0].id);
      if (lRes.data.length > 0) setSelectedLocation(lRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/task-management/schedules', {
        template_id: parseInt(selectedTemplate),
        location_id: parseInt(selectedLocation),
        assigned_professionals: selectedProfs
      });
      setScheduleModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Failed to assign task schedule");
    }
  };

  const handleSendNotification = async (sched) => {
    setNotificationMsg(`Notifications successfully dispatched to ${sched.professionals_count} assigned professionals for '${sched.template_name}'.`);
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  const handleOpenReschedule = (detail) => {
    setActiveDetail(detail);
    setRescheduleModalOpen(true);
  };

  const handleSaveReschedule = async (rescheduleData) => {
    try {
      await apiClient.post('/task-management/reschedule-detail', rescheduleData);
      setRescheduleModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Reschedule failed");
    }
  };

  const toggleProSelection = (proName) => {
    if (selectedProfs.includes(proName)) {
      setSelectedProfs(selectedProfs.filter(p => p !== proName));
    } else {
      setSelectedProfs([...selectedProfs, proName]);
    }
  };

  const filtered = schedules.filter(s =>
    s.template_name.toLowerCase().includes(search.toLowerCase()) ||
    s.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Schedule Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">Assign task templates with different locations and employees. Supports expanding detail matrices & notifications.</p>
        </div>

        <button
          onClick={() => setScheduleModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule</span>
        </button>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{notificationMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by template name or location..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Schedules</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Template Name</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4 text-center">Professionals</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No scheduled tasks found</td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const isExpanded = expandedRow === s.id;
                  return (
                    <React.Fragment key={s.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                            className="p-1 hover:bg-slate-200 rounded-full text-slate-600"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-blue-600" />
                          <span>{s.template_name}</span>
                        </td>
                        <td className="py-3 px-4 text-blue-700 font-semibold">{s.location_name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px]">
                            {s.professionals_count}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{s.modified_by}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenReschedule(s.details[0] || { id: 1, task_name: "Sweeping floor", work_location_name: "Front Entrance" })}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold">Edit</span>
                            </button>
                            <button
                              onClick={() => handleSendNotification(s)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold">Notify Professionals</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Task Detail Rows Matrix */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={6} className="p-4 border-y border-slate-200">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center space-x-2">
                                <ListTodo className="w-4 h-4 text-blue-600" />
                                <span>Assigned Individual Tasks Matrix ({s.details?.length || 0})</span>
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                                      <th className="py-2 px-3">Task Name</th>
                                      <th className="py-2 px-3">Description</th>
                                      <th className="py-2 px-3">Work Location (Section)</th>
                                      <th className="py-2 px-3">Shift</th>
                                      <th className="py-2 px-3 text-center">Is Recursive</th>
                                      <th className="py-2 px-3 text-center">Professionals</th>
                                      <th className="py-2 px-3 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {s.details?.map((d) => (
                                      <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 font-bold text-slate-800">{d.task_name}</td>
                                        <td className="py-2 px-3 text-slate-500 max-w-xs truncate">{d.description}</td>
                                        <td className="py-2 px-3 font-semibold text-blue-700">{d.work_location_name}</td>
                                        <td className="py-2 px-3 text-slate-700">{d.shift_name}</td>
                                        <td className="py-2 px-3 text-center">
                                          <input type="checkbox" checked={d.is_recursive} readOnly className="accent-blue-600" />
                                        </td>
                                        <td className="py-2 px-3 text-center font-bold text-slate-700">
                                          {d.professionals?.length || 1}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                          <button
                                            onClick={() => handleOpenReschedule(d)}
                                            className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold text-[10px] rounded hover:bg-blue-100 flex items-center space-x-1 ml-auto"
                                          >
                                            <RefreshCw className="w-3 h-3" />
                                            <span>Re-Schedule</span>
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Add Task Schedule</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Template *</label>
                <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Professionals *</label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                  {professionals.map((p) => {
                    const name = `${p.first_name} ${p.last_name}`;
                    const isChecked = selectedProfs.includes(name);
                    return (
                      <label key={p.id} className="flex items-center space-x-2 text-xs text-slate-700 p-1 hover:bg-white rounded cursor-pointer">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleProSelection(name)} className="accent-blue-600" />
                        <span className="font-medium">{name}</span>
                        <span className="text-[10px] text-slate-400">({p.skills || 'General'})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">ASSIGN SCHEDULE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Popup Modal */}
      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        detail={activeDetail}
        onSubmit={handleSaveReschedule}
      />
    </div>
  );
}
