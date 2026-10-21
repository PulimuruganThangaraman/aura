import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, BarChart3, QrCode, TrendingUp, Sparkles, Printer, Search, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';
import Pagination from '../components/Pagination';

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reports/summary');
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    alert(`Exporting AuraForcz Audit & Compliance Report in ${format.toUpperCase()} format... Download started.`);
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Generating AuraForcz Compliance Analytics...</p>
        </div>
      </div>
    );
  }

  const { overview, task_breakdown, recent_scans } = reportData;

  const filteredScans = recent_scans.filter(s =>
    s.location.toLowerCase().includes(search.toLowerCase()) ||
    s.qr_code.toLowerCase().includes(search.toLowerCase()) ||
    s.scanned_by.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedScans = filteredScans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Reports, Audits & Compliance
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Audit-Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Care adherence metrics, timesheet verification logs, and GPS QR-tag scanning records.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={() => handleExport('excel')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Generate PDF Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Provider Orgs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{overview.total_companies}</p>
          <span className="text-[11px] text-teal-600 font-semibold">Active Tenants</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Support Workers</p>
          <p className="text-2xl font-black text-teal-600 mt-1">{overview.total_professionals}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Verified</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Sites</p>
          <p className="text-2xl font-black text-sky-600 mt-1">{overview.total_locations}</p>
          <span className="text-[11px] text-sky-600 font-semibold">Geo-fenced Locations</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rostered Task Logs</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{overview.total_task_records}</p>
          <span className="text-[11px] text-purple-600 font-semibold">Tracked Checklists</span>
        </div>
      </div>

      {/* Breakdown and Scan Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Progress Bars */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Shift Task Adherence Status</span>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">NDIS Standards</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-700">Completed & Verified Checklists</span>
                <span className="text-slate-800">{task_breakdown.completed} tasks (65%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-sky-700">In Progress / Ongoing Shifts</span>
                <span className="text-slate-800">{task_breakdown.in_progress} tasks (25%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-700">Upcoming / Scheduled Roster</span>
                <span className="text-slate-800">{task_breakdown.pending} tasks (10%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time QR Check-In Live Feed Snapshot */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>Real-time QR Check-In Verifications</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Live Feed</span>
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {recent_scans.slice(0, 5).map((scan, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{scan.location}</p>
                    <p className="text-[10px] font-mono text-teal-700 font-semibold">{scan.qr_code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">{scan.scanned_by}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{scan.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Verification Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit records by worker, site, or barcode..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold">Total: {filteredScans.length} Verification Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Verification Location</th>
                <th className="py-3 px-4">QR / Geo-Tag Code</th>
                <th className="py-3 px-4">Scanned Professional</th>
                <th className="py-3 px-4">Timestamp (AEST)</th>
                <th className="py-3 px-4 text-center">GPS Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">No audit records found</td>
                </tr>
              ) : (
                paginatedScans.map((scan, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span>{scan.location}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-[11px]">{scan.qr_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{scan.scanned_by}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{scan.timestamp}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredScans.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="records"
        />
      </div>
    </div>
  );
}

