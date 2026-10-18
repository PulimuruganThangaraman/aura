import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ChevronDown, ChevronUp, CalendarDays, 
  CheckCircle, Clock, AlertTriangle, RefreshCw, Calendar, 
  List, ChevronLeft, ChevronRight, User, MapPin, Sparkles, CheckSquare, Layers,
  Briefcase, Trash2, Check, Play, UserCheck, Eye, Filter, ArrowRight
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

export default function ScheduleTasksPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isProfessional = user?.role === 'Professional' || user?.role === 'professional';
  const isCompanyAdmin = !isSuperAdmin && !isProfessional;

  const [jobs, setJobs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const [search, setSearch] = useState('');
  const [professionalFilter, setProfessionalFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create / Edit Job Modal State
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedWorkLocation, setSelectedWorkLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [selectedProfs, setSelectedProfs] = useState([]);
  const [modalTasks, setModalTasks] = useState([
    { task_name: '', category_name: 'General', estimated_minutes: 30, priority: 'Normal' }
  ]);
  const [savingJob, setSavingJob] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate, professionalFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, professionalFilter, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query params based on role scoping
      let url = '/task-management/jobs?';
      if (isProfessional) {
        url += `user_email=${encodeURIComponent(user?.email || '')}&role=Professional&`;
      } else if (user?.company_id) {
        url += `company_id=${user.company_id}&`;
      }

      if (professionalFilter !== 'All') {
        url += `professional=${encodeURIComponent(professionalFilter)}&`;
      }
      if (dateFilter) {
        url += `scheduled_date=${dateFilter}&`;
      }
      if (statusFilter !== 'All') {
        url += `status=${statusFilter}&`;
      }

      const [jobsRes, tmplRes, locRes, wlRes, profRes] = await Promise.all([
        apiClient.get(url),
        apiClient.get('/task-management/job-templates'),
        apiClient.get('/locations'),
        apiClient.get('/work-locations'),
        apiClient.get('/professionals')
      ]);

      setJobs(jobsRes.data);
      setTemplates(tmplRes.data);
      setLocations(locRes.data);
      setWorkLocations(wlRes.data);
      setProfessionals(profRes.data);

      if (locRes.data.length > 0 && !selectedLocation) {
        setSelectedLocation(locRes.data[0].id);
        const wls = wlRes.data.filter(w => w.location_id === locRes.data[0].id);
        if (wls.length > 0) setSelectedWorkLocation(wls[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (locId) => {
    setSelectedLocation(locId);
    const availableWls = workLocations.filter(wl => wl.location_id === parseInt(locId));
    if (availableWls.length > 0) {
      setSelectedWorkLocation(availableWls[0].name);
    } else {
      setSelectedWorkLocation('');
    }
  };

  const handleTemplateSelect = (tmplId) => {
    setSelectedTemplate(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find(t => t.id === parseInt(tmplId));
    if (tmpl) {
      if (!jobTitle) setJobTitle(tmpl.name);
      if (tmpl.default_start_time) setStartTime(tmpl.default_start_time);
      if (tmpl.default_end_time) setEndTime(tmpl.default_end_time);

      if (tmpl.items && tmpl.items.length > 0) {
        setModalTasks(tmpl.items.map(item => ({
          task_name: item.task_name,
          category_name: item.category_name || 'General',
          estimated_minutes: item.estimated_minutes || 30,
          priority: item.priority || 'Normal'
        })));
      }
    }
  };

  const addModalTaskRow = () => {
    setModalTasks([...modalTasks, { task_name: '', category_name: 'General', estimated_minutes: 30, priority: 'Normal' }]);
  };

  const removeModalTaskRow = (idx) => {
    if (modalTasks.length <= 1) return;
    setModalTasks(modalTasks.filter((_, i) => i !== idx));
  };

  const updateModalTaskField = (idx, field, value) => {
    const updated = [...modalTasks];
    updated[idx][field] = value;
    setModalTasks(updated);
  };

  const toggleSelectProf = (profName) => {
    if (selectedProfs.includes(profName)) {
      setSelectedProfs(selectedProfs.filter(p => p !== profName));
    } else {
      setSelectedProfs([...selectedProfs, profName]);
    }
  };

  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      alert("Please provide a Job Title.");
      return;
    }
    if (selectedProfs.length === 0) {
      alert("Please assign at least one care professional.");
      return;
    }

    const validTasks = modalTasks.filter(t => t.task_name && t.task_name.trim());
    if (validTasks.length === 0) {
      alert("Please add at least one valid Task under this Job.");
      return;
    }

    setSavingJob(true);
    try {
      const payload = {
        title: jobTitle,
        template_id: selectedTemplate ? parseInt(selectedTemplate) : null,
        location_id: parseInt(selectedLocation),
        work_location_name: selectedWorkLocation,
        scheduled_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        assigned_professionals: selectedProfs,
        tasks: validTasks
      };

      await apiClient.post('/task-management/jobs', payload);
      setJobModalOpen(false);
      resetJobForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to create Job.");
    } finally {
      setSavingJob(false);
    }
  };

  const resetJobForm = () => {
    setJobTitle('');
    setSelectedTemplate('');
    setStartTime('09:00');
    setEndTime('11:00');
    setSelectedProfs([]);
    setModalTasks([{ task_name: '', category_name: 'General', estimated_minutes: 30, priority: 'Normal' }]);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await apiClient.put(`/task-management/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteJob = async (jobId, jobCode) => {
    if (!window.confirm(`Are you sure you want to delete Job ${jobCode} and all its nested tasks?`)) return;
    try {
      await apiClient.delete(`/task-management/jobs/${jobId}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete job");
    }
  };

  // Filtering
  const filteredJobs = jobs.filter(j => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (j.job_id && j.job_id.toLowerCase().includes(term)) ||
      (j.title && j.title.toLowerCase().includes(term)) ||
      (j.location_name && j.location_name.toLowerCase().includes(term)) ||
      (j.assigned_professionals && j.assigned_professionals.some(p => p.toLowerCase().includes(term))) ||
      (j.tasks && j.tasks.some(t => t.task_id.toLowerCase().includes(term) || t.task_name.toLowerCase().includes(term)));

    return matchesSearch;
  });

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isProfessional ? "My Assigned Jobs & Tasks" : "Jobs & Tasks Operations Roster"}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              {isProfessional ? "Personal Care Roster" : "Live Scheduler"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isProfessional
              ? "Your personal schedule of jobs and checklist tasks with custom time windows."
              : "Manage jobs with customized time windows (e.g. 09:00 AM - 11:00 AM). Each Job contains multiple Tasks assigned to professionals."}
          </p>
        </div>

        {isCompanyAdmin && (
          <button
            onClick={() => { resetJobForm(); setJobModalOpen(true); }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Scheduled Job</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Job ID, Task ID, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[11px] text-teal-600 hover:underline cursor-pointer"
            >
              Clear Date
            </button>
          )}

          {/* Professional Filter (Company Admin only) */}
          {isCompanyAdmin && (
            <select
              value={professionalFilter}
              onChange={(e) => setProfessionalFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="All">All Professionals</option>
              {professionals.map(p => (
                <option key={p.id} value={`${p.first_name} ${p.last_name}`}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500 self-end md:self-auto">
          Total Jobs: <strong className="text-slate-900">{filteredJobs.length}</strong>
        </div>
      </div>

      {/* Jobs & Nested Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading scheduled jobs & tasks...</p>
          </div>
        ) : paginatedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs text-slate-400 text-xs">
            No jobs found matching your criteria.
          </div>
        ) : (
          paginatedJobs.map((job) => {
            const isExpanded = expandedJobId === job.id;
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                {/* Job Header Row */}
                <div 
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                >
                  <div className="flex items-start md:items-center space-x-3.5">
                    {/* Job ID Tag */}
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-600 text-white shadow-xs">
                        {job.job_id}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-black text-slate-900">{job.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          job.status === 'InProgress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      {/* Meta info: Date, Customized Time, Location, Staff */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-800">{job.scheduled_date}</strong>
                        </span>

                        {/* Custom Time Slot */}
                        <span className="flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>{job.start_time} - {job.end_time}</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location_name} ({job.work_location_name})</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {job.assigned_professionals?.length > 0 ? job.assigned_professionals.join(', ') : 'Unassigned'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Expand Chevron */}
                  <div className="flex items-center space-x-2 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {job.tasks?.length || 0} Tasks
                    </span>

                    {isCompanyAdmin && (
                      <button
                        title="Delete Job"
                        onClick={() => handleDeleteJob(job.id, job.job_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nested Tasks Accordion */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Tasks Under Job {job.job_id} ({job.tasks?.length || 0} Procedures):
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Scheduled Window: {job.start_time} - {job.end_time}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(job.tasks || []).map((t) => (
                        <div key={t.id} className="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-start space-x-3">
                            {/* Task ID Tag */}
                            <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {t.task_id}
                            </span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-black text-slate-900">{t.task_name}</h4>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  t.priority === 'High' || t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {t.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Category: <strong className="text-slate-700">{t.category_name}</strong> • Duration: {t.estimated_minutes} mins
                              </p>
                              {t.description && (
                                <p className="text-[11px] text-slate-600 italic mt-0.5">{t.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Task Status & Action */}
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            {t.status === 'Completed' || t.status === 'Ended' ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  t.status === 'InProgress' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {t.status}
                                </span>

                                <button
                                  disabled={updatingTaskId === t.id}
                                  onClick={() => handleUpdateTaskStatus(t.id, 'InProgress')}
                                  title="Mark In Progress"
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Play className="w-2.5 h-2.5" />
                                  <span>Start</span>
                                </button>

                                <button
                                  disabled={updatingTaskId === t.id}
                                  onClick={() => handleUpdateTaskStatus(t.id, 'Completed')}
                                  title="Mark Completed"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Sign Off</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        <Pagination
          totalItems={filteredJobs.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ======================================================== */}
      {/* CREATE JOB MODAL (Company Admin only) */}
      {/* ======================================================== */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8 animate-in fade-in duration-150 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setJobModalOpen(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Create Scheduled Job</h2>
                <p className="text-xs text-slate-500">Configure customized job time and add tasks under it.</p>
              </div>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-4">
              {/* Optional: Load from Job Template */}
              <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100">
                <label className="block text-xs font-bold text-teal-900 mb-1">
                  Optional: Quick Load from Job Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-teal-200 rounded-xl outline-none focus:border-teal-500 text-slate-800 cursor-pointer"
                >
                  <option value="">-- Choose a Job Template to Auto-Fill Tasks --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.task_count} Tasks)</option>
                  ))}
                </select>
              </div>

              {/* Job Title & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                  <input
                    required
                    placeholder="e.g. Morning Medical & Hygiene Protocol"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    required
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Customized Job Times: Start & End Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Custom Job Start Time *
                  </label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Custom Job End Time *
                  </label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Location & Work Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility Location *</label>
                  <select
                    required
                    value={selectedLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800 cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Location (QR Zone) *</label>
                  <input
                    required
                    placeholder="e.g. Suite 302, Restroom B"
                    value={selectedWorkLocation}
                    onChange={(e) => setSelectedWorkLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-teal-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Assign Professionals (Staff can have multiple jobs per day) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Care Professional(s) *
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                  {professionals.map(p => {
                    const fullName = `${p.first_name} ${p.last_name}`;
                    const isSelected = selectedProfs.includes(fullName);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggleSelectProf(fullName)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{fullName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tasks Under this Job */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800">
                    Tasks Under This Job ({modalTasks.length})
                  </label>
                  <button
                    type="button"
                    onClick={addModalTaskRow}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {modalTasks.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 font-mono w-5">#{idx + 1}</span>
                      <input
                        required
                        placeholder="Task procedure name..."
                        value={t.task_name}
                        onChange={(e) => updateModalTaskField(idx, 'task_name', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 text-slate-800"
                      />
                      <input
                        placeholder="Category"
                        value={t.category_name}
                        onChange={(e) => updateModalTaskField(idx, 'category_name', e.target.value)}
                        className="w-24 text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-800"
                      />
                      <select
                        value={t.priority}
                        onChange={(e) => updateModalTaskField(idx, 'priority', e.target.value)}
                        className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-800"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      {modalTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModalTaskRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingJob ? "Saving Job..." : "Publish Job & Tasks"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
