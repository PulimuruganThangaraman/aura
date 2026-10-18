import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, UserCheck, Clock, Filter, 
  ArrowUpRight, TrendingUp, Calendar, CheckCircle2, AlertTriangle, 
  Sparkles, ArrowRight, ShieldCheck, ChevronRight, ChevronDown, ChevronUp,
  Briefcase, ListTodo, CheckSquare, CalendarDays, MapPin, Play, Check,
  X, UserCog, Mail, Phone, ExternalLink, Activity, Layers, RefreshCw, BarChart2, Plus,
  FileText
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import apiClient from '../api/client';
import Pagination from '../components/Pagination';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isProfessional = user?.role === 'Professional' || user?.role === 'professional';
  const isCompanyAdmin = !isSuperAdmin && !isProfessional;

  const [selectedCompany, setSelectedCompany] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companySearch, setCompanySearch] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1);
  const [companyPageSize, setCompanyPageSize] = useState(8);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobSearch, setJobSearch] = useState('');
  const [companyFilterStatus, setCompanyFilterStatus] = useState('All');

  useEffect(() => {
    fetchDashboard();
  }, [selectedCompany, user?.role, user?.email]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      if (isSuperAdmin) {
        const url = selectedCompany ? `/dashboard/super-admin?company_id=${selectedCompany}` : '/dashboard/super-admin';
        const res = await apiClient.get(url);
        setDashboardData(res.data);
      } else if (isProfessional) {
        const res = await apiClient.get(`/dashboard/professional?user_email=${encodeURIComponent(user?.email || '')}`);
        setDashboardData(res.data);
      } else {
        const companyId = user?.company_id || 1;
        const res = await apiClient.get(`/dashboard/company?company_id=${companyId}`);
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await apiClient.put(`/task-management/tasks/${taskId}/status`, { status: newStatus });
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Workspace Dashboard...</p>
        </div>
      </div>
    );
  }

  // ShiftCare Chart Color Palette
  const CHART_COLORS = ['#10B981', '#06B6D4', '#F59E0B'];

  // =========================================================================
  // 1. SUPER ADMIN DASHBOARD VIEW (SHIFTCARE MULTI-TENANT EDITION)
  // =========================================================================
  if (isSuperAdmin) {
    const { 
      kpi, 
      companies_overview = [], 
      task_status_chart = [], 
      companies_list = [],
      selected_company_name,
      selected_company_details,
      company_jobs = []
    } = dashboardData;

    // Filter companies list by search & status
    const filteredCompanies = companies_overview.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(companySearch.toLowerCase()) ||
        (c.admin_name && c.admin_name.toLowerCase().includes(companySearch.toLowerCase()));
      
      if (!matchesSearch) return false;
      if (companyFilterStatus === 'Active') return c.is_active;
      if (companyFilterStatus === 'Inactive') return !c.is_active;
      return true;
    });

    // Pagination for companies table
    const paginatedCompanies = filteredCompanies.slice(
      (companyCurrentPage - 1) * companyPageSize,
      companyCurrentPage * companyPageSize
    );

    // Filter company jobs by search
    const filteredJobs = company_jobs.filter(j => 
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.job_id.toLowerCase().includes(jobSearch.toLowerCase()) ||
      (j.company_name && j.company_name.toLowerCase().includes(jobSearch.toLowerCase())) ||
      (j.assigned_professionals && j.assigned_professionals.some(p => p.toLowerCase().includes(jobSearch.toLowerCase())))
    );

    return (
      <div className="space-y-6">
        {/* Top Header & Multi-Tenant Action Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Super Admin Platform Monitor
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                ShiftCare Multi-Tenant Console
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                Platform Executive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Global enterprise oversight: client organizations, verified care staff, custom-timed jobs, and procedural checklists across the platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Company Filter Dropdown */}
            {companies_list && (
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-xs font-bold text-slate-700">Filter Company:</span>
                <select
                  value={selectedCompany}
                  onChange={(e) => { setSelectedCompany(e.target.value); setCompanyCurrentPage(1); }}
                  className="text-xs bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer max-w-[220px] truncate"
                >
                  <option value="">All Companies (Global Overview)</option>
                  {companies_list.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
                {selectedCompany && (
                  <button
                    onClick={() => { setSelectedCompany(''); setCompanyCurrentPage(1); }}
                    title="Clear filter and view all companies"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Action Navigation */}
            <button
              onClick={() => onNavigate?.('companies')}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* Selected Company Focus Banner (When a specific company is filtered) */}
        {selectedCompany && selected_company_details && (
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-teal-700/40 text-white shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                    Filtered Organization Deep-Dive
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selected_company_details.is_active ? 'Active Tenant' : 'Inactive'}
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{selected_company_details.name}</span>
                  <span className="text-xs font-mono font-normal text-teal-300">({selected_company_details.code})</span>
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <UserCog className="w-3.5 h-3.5 text-teal-400" />
                    <span>Company Admin: <strong className="text-white">{selected_company_details.admin_name}</strong></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>{selected_company_details.admin_email}</span>
                  </span>
                  {selected_company_details.admin_phone && selected_company_details.admin_phone !== 'N/A' && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <span>{selected_company_details.admin_phone}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
                <button
                  onClick={() => onNavigate?.('schedule-tasks')}
                  className="px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Open in Roster</span>
                </button>
                <button
                  onClick={() => onNavigate?.('companies')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Manage Admin</span>
                </button>
                <button
                  onClick={() => { setSelectedCompany(''); setCompanyCurrentPage(1); }}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filter</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4 Core ShiftCare KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Companies */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-teal-300 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-500">
                {selectedCompany ? 'Filtered Tenant' : 'Total Companies'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.companies}</h3>
              <p className="text-[11px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{selectedCompany ? 'Active Client Tenant' : `${kpi.active_companies || kpi.companies} Active Client Tenants`}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Total Professionals */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-500">
                {selectedCompany ? 'Company Staff' : 'Total Care Staff'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.professionals}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Verified Field Staff</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Total Jobs */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-indigo-300 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-500">
                {selectedCompany ? 'Company Scheduled Jobs' : 'Total Jobs Created'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.jobs}</h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Custom Time Slots</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          {/* Total Tasks */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-500">
                {selectedCompany ? 'Company Procedural Tasks' : 'Total Tasks Created'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.tasks}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ListTodo className="w-3 h-3" />
                <span>{kpi.avg_tasks_per_job || 4.6} Tasks / Job Avg</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ListTodo className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ShiftCare Operational Pulse & Health Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>Task Completion Rate</span>
              <span className="text-emerald-700 font-black">{kpi.completion_rate || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${kpi.completion_rate || 0}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
              />
              <div 
                style={{ width: `${Math.min(100 - (kpi.completion_rate || 0), 20)}%` }} 
                className="bg-cyan-500 h-full transition-all duration-500" 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1.5">
              <span>{kpi.completed_tasks || 0} done</span>
              <span>{kpi.in_progress_tasks || 0} in progress</span>
              <span>{kpi.yet_to_start_tasks || 0} pending</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jobs Scheduled Today</span>
              <p className="text-base font-black text-slate-900 mt-0.5">{kpi.today_jobs_count || 0} Active Blocks</p>
              <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Real-time roster dispatch</p>
            </div>
            <Calendar className="w-8 h-8 text-teal-500/20" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Density</span>
              <p className="text-base font-black text-slate-900 mt-0.5">{kpi.avg_tasks_per_job || 4.6} Tasks / Job</p>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Procedural checklist depth</p>
            </div>
            <ListTodo className="w-8 h-8 text-indigo-500/20" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System State</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-base font-black text-emerald-700">100% Operational</p>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Multi-tenant sync healthy</p>
            </div>
            <Activity className="w-8 h-8 text-emerald-500/20" />
          </div>
        </div>

        {/* Two-Column Section: Task Status Chart & Fast ShiftCare Management Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Completion Status Pie Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">Task Completion Status</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {kpi.tasks} Tasks
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCompany ? `Procedures logged under ${selected_company_name || 'company'}` : 'Execution breakdown across all client tenants'}
              </p>
            </div>

            <div className="h-52 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={task_status_chart}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {task_status_chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              {task_status_chart.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                  <span>{entry.name}: <strong className="text-slate-900">{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Shortcuts & Governance Cards (ShiftCare Style) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">ShiftCare Multi-Tenant Governance</h2>
                <span className="text-xs font-bold text-teal-600">Enterprise Suite</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct administrative oversight over tenant rosters, field care professionals, and compliance records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Shortcut 1: Roster */}
              <div 
                onClick={() => onNavigate?.('schedule-tasks')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-slate-900">All Jobs & Tasks Roster</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Inspect scheduled shifts, custom time slots (e.g. 09:00 - 11:00), and task progress.
                </p>
                <span className="text-[11px] font-bold text-teal-700 mt-3 inline-flex items-center gap-1">
                  Open Master Roster <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Shortcut 2: Workforce */}
              <div 
                onClick={() => onNavigate?.('professionals')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-slate-900">Care Professionals</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Manage field care staff verification, qualifications, and company roster assignments.
                </p>
                <span className="text-[11px] font-bold text-blue-700 mt-3 inline-flex items-center gap-1">
                  View Staff Directory <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Shortcut 3: Reports */}
              <div 
                onClick={() => onNavigate?.('reports')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-slate-900">Cross-Tenant Audits</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Review time and attendance, completion compliance, and export company audit records.
                </p>
                <span className="text-[11px] font-bold text-indigo-700 mt-3 inline-flex items-center gap-1">
                  Export Reports <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Jobs & Tasks Drill-Down Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900">
                  {selectedCompany 
                    ? `Scheduled Jobs & Tasks for ${selected_company_name || 'Selected Company'}` 
                    : 'Recent Scheduled Jobs Across Client Tenants'
                  }
                </h2>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {filteredJobs.length} Jobs
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Jobs define customized operational time blocks (e.g. 09:00 AM - 11:00 AM) containing multiple checklist tasks assigned to professionals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search job title, ID, or staff..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => onNavigate?.('schedule-tasks')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Full Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No jobs matching the criteria found.
              </div>
            ) : (
              filteredJobs.slice(0, 8).map((job) => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <div key={job.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-600 text-white shadow-2xs shrink-0">
                          {job.job_id}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900">{job.title}</h4>
                            {!selectedCompany && job.company_name && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {job.company_name} ({job.company_code})
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-teal-700">
                              <Clock className="w-3.5 h-3.5" />
                              {job.start_time} - {job.end_time}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {job.scheduled_date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {job.assigned_professionals?.length > 0 
                                ? job.assigned_professionals.join(', ') 
                                : 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          job.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {job.status}
                        </span>

                        <button
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Tasks ({job.tasks_count})</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Tasks list */}
                    {isExpanded && job.tasks && (
                      <div className="mt-3 pl-4 border-l-2 border-teal-500 space-y-2 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Checklist Tasks under this job:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {job.tasks.map((task) => (
                            <div key={task.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                  {task.task_id}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{task.task_name}</p>
                                  <p className="text-[10px] text-slate-500">{task.category_name} • Priority: {task.priority}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                task.status === 'Completed' || task.status === 'Ended' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : (task.status === 'InProgress' ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700')
                              }`}>
                                {task.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Multi-Tenant Companies & Operational Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900">Companies & Operational Breakdown</h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredCompanies.length} Organizations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of client companies, primary Company Admins, and count of professionals, jobs, and tasks per company.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status filter tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                {['All', 'Active'].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setCompanyFilterStatus(status); setCompanyCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      companyFilterStatus === status ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search company, code, or admin..."
                  value={companySearch}
                  onChange={(e) => { setCompanySearch(e.target.value); setCompanyCurrentPage(1); }}
                  className="w-full text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Company Name & Code</th>
                  <th className="py-3 px-4">Company Admin Contact</th>
                  <th className="py-3 px-4 text-center">Professionals</th>
                  <th className="py-3 px-4 text-center">Jobs Created</th>
                  <th className="py-3 px-4 text-center">Tasks Created</th>
                  <th className="py-3 px-4 text-center">Tenant Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginatedCompanies.map((c) => {
                  const isCurrent = selectedCompany && c.id.toString() === selectedCompany.toString();
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${isCurrent ? 'bg-teal-50/40' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                              Active Filter
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Code: {c.code} • {c.industry}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.admin_name}</div>
                        <div className="text-[10px] text-slate-500">{c.admin_email}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {c.professionals_count} staff
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                          {c.jobs_count} jobs
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          {c.tasks_count} tasks
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {c.is_active ? 'Active Tenant' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedCompany(isCurrent ? '' : c.id.toString())}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isCurrent 
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                            }`}
                          >
                            {isCurrent ? 'Clear Filter' : 'Filter View'}
                          </button>
                          <button
                            onClick={() => onNavigate?.('companies')}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Manage Company Admin"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={companyCurrentPage}
              totalItems={filteredCompanies.length}
              pageSize={companyPageSize}
              onPageChange={setCompanyCurrentPage}
              onPageSizeChange={setCompanyPageSize}
              pageSizeOptions={[5, 8, 15, 25]}
              itemLabel="companies"
            />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CARE PROFESSIONAL DASHBOARD VIEW
  // =========================================================================
  if (isProfessional) {
    const { kpi, today_jobs, professional_name } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-teal-800/40 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Care Professional Portal</span>
              </div>
              <h1 className="text-2xl font-black mt-1">
                Welcome back, {professional_name}!
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Here is your assigned care roster for today. Review your scheduled jobs, time windows, and procedural tasks.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-right">
              <span className="text-[10px] text-teal-200 font-bold uppercase block">Today's Date</span>
              <span className="text-sm font-black">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* 4 Professional KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">My Total Jobs</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.my_total_jobs}</h3>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">Assigned on Roster</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">Today's Scheduled Jobs</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{kpi.my_today_jobs}</h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Time Slots Today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">Pending Tasks</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{kpi.my_pending_tasks}</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Yet to Complete</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">Completed Tasks</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{kpi.my_completed_tasks}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Procedures Signed Off</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Today's Jobs & Multiple Tasks Interactive List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Today's Assigned Jobs & Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each job contains customized time windows and multiple checklist tasks.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {today_jobs.length} Jobs Active
            </span>
          </div>

          {today_jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No jobs scheduled for you today. Check upcoming days on your roster.
            </div>
          ) : (
            <div className="space-y-4">
              {today_jobs.map((job) => (
                <div key={job.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-teal-600 text-white shadow-xs">
                          {job.job_id}
                        </span>
                        <h3 className="text-sm font-black text-slate-900">{job.title}</h3>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-teal-700">
                          <Clock className="w-3.5 h-3.5" />
                          {job.start_time} - {job.end_time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location_name} ({job.work_location_name})
                        </span>
                      </div>
                    </div>
                    <span className={`self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      job.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Tasks under this job */}
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Tasks to Complete ({job.tasks.length}):
                    </p>
                    {job.tasks.map((task) => (
                      <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-start space-x-2.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {task.task_id}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{task.task_name}</p>
                            <p className="text-[10px] text-slate-500">
                              {task.category_name} • Est. {task.estimated_minutes} mins • Priority: <span className="font-semibold text-slate-700">{task.priority}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          {task.status !== 'Completed' && task.status !== 'Ended' ? (
                            <>
                              <button
                                disabled={updatingTaskId === task.id}
                                onClick={() => handleTaskStatusUpdate(task.id, 'InProgress')}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                                <span>In Progress</span>
                              </button>
                              <button
                                disabled={updatingTaskId === task.id}
                                onClick={() => handleTaskStatusUpdate(task.id, 'Completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. COMPANY ADMIN DASHBOARD VIEW
  // =========================================================================
  const { kpi, task_status_chart, recent_jobs } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Company Operations Center
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              {user?.company_name || 'Organization'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of staff allocation, jobs with custom time slots, and procedural tasks.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Roster Cycle</span>
          <span className="text-xs font-black text-slate-800">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 4 Company Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Company Professionals</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.professionals}</h3>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">Assigned Care Staff</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Total Jobs Created</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{kpi.jobs}</h3>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">Custom Time Slots</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Total Tasks Under Jobs</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{kpi.tasks}</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Procedures Logged</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Completed Tasks</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{kpi.completed_tasks || 0}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Successfully Verified</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Task Progress & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-black text-slate-900">Task Completion Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Execution breakdown across all scheduled jobs.</p>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={task_status_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {task_status_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 mt-2">
            {task_status_chart.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs with Job IDs */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">Recent Scheduled Jobs</h2>
              <p className="text-xs text-slate-500">Jobs with customized operational time windows</p>
            </div>
            <span className="text-xs font-bold text-teal-600 font-mono">Job ID Tracking</span>
          </div>

          <div className="divide-y divide-slate-100">
            {(recent_jobs || []).map((job) => (
              <div key={job.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="font-mono text-xs font-extrabold px-2 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                    {job.job_id}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Date: {job.scheduled_date} • Time: <span className="font-semibold text-slate-700">{job.start_time} - {job.end_time}</span> • Tasks: {job.tasks_count}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {job.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {job.assigned_professionals?.length > 0 ? job.assigned_professionals[0] : 'Unassigned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
