import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Users, UserCheck, ListTodo, Clock, AlertCircle, Filter, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import apiClient from '../api/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [selectedCompany, setSelectedCompany] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [selectedCompany]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      if (isSuperAdmin) {
        const url = selectedCompany ? `/dashboard/super-admin?company_id=${selectedCompany}` : '/dashboard/super-admin';
        const res = await apiClient.get(url);
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

  if (loading || !dashboardData) {
    return <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading Dashboard Analytics...</div>;
  }

  const { kpi, task_status_chart, attendance_chart, companies_list } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Top Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin ? "Overall multi-company statistics & facilities metrics" : "Company operations & task fulfillment performance"}
          </p>
        </div>

        {isSuperAdmin && companies_list && (
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Company Name:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">Select Company (All)</option>
              {companies_list.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSuperAdmin ? (
          <>
            {/* Card 1 */}
            <div className="bg-cyan-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.companies}</span>
                <p className="text-xs font-medium text-cyan-100 mt-1">Companies</p>
              </div>
              <Building2 className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>

            {/* Card 2 */}
            <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.employees}</span>
                <p className="text-xs font-medium text-emerald-100 mt-1">Employees</p>
              </div>
              <Users className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>

            {/* Card 3 */}
            <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.user_registrations}</span>
                <p className="text-xs font-medium text-amber-100 mt-1">User Registrations</p>
              </div>
              <UserCheck className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>

            {/* Card 4 */}
            <div className="bg-rose-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.tasks}</span>
                <p className="text-xs font-medium text-rose-100 mt-1">Tasks</p>
              </div>
              <ListTodo className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>
          </>
        ) : (
          <>
            {/* Company Admin Cards */}
            <div className="bg-cyan-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.professionals}</span>
                <p className="text-xs font-medium text-cyan-100 mt-1">Professionals</p>
              </div>
              <UserCheck className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>

            <div className="bg-emerald-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.hours}</span>
                <p className="text-xs font-medium text-emerald-100 mt-1">Hours Worked</p>
              </div>
              <Clock className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>

            <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.tasks}</span>
                <p className="text-xs font-medium text-amber-100 mt-1">Tasks</p>
              </div>
              <ListTodo className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>

            <div className="bg-rose-500 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black">{kpi.issues}</span>
                <p className="text-xs font-medium text-rose-100 mt-1">Issues</p>
              </div>
              <AlertCircle className="w-16 h-16 absolute -right-3 -bottom-3 text-white/20" />
            </div>
          </>
        )}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Task Status</h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Breakdown</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={task_status_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {task_status_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Attendance (Current Month)</h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Weekly Breakdown</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance_chart}>
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
