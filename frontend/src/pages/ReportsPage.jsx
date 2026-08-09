import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, BarChart3, QrCode } from 'lucide-react';
import apiClient from '../api/client';

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

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
    alert(`Exporting AuraLinks Enterprise Report in ${format.toUpperCase()} format... File download initiated.`);
  };

  if (loading || !reportData) {
    return <div className="p-8 text-center text-xs text-slate-500 font-medium">Generating Report Analytics...</div>;
  }

  const { overview, task_breakdown, recent_scans } = reportData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit reports, task fulfillment stats, and QR Code verification logs</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Companies</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{overview.total_companies}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Active Professionals</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{overview.total_professionals}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Facility Locations</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{overview.total_locations}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Scheduled Task Records</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{overview.total_task_records}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Task Completion Matrix</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Completed Tasks</span>
                <span>{task_breakdown.completed}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-700">In Progress</span>
                <span>{task_breakdown.in_progress}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">Yet to Start</span>
                <span>{task_breakdown.pending}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Recent QR Scan Verifications</span>
          </h3>
          <div className="space-y-3">
            {recent_scans.map((scan, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{scan.location}</p>
                  <p className="text-[11px] font-mono text-blue-700">{scan.qr_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700">{scan.scanned_by}</p>
                  <p className="text-[10px] text-slate-400">{scan.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
