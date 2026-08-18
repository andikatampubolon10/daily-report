"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import { DailyReport } from "@/types/report";
import { Users, Search, RefreshCw, AlertTriangle } from "lucide-react";

export default function MonitoringPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterEmail, setFilterEmail] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterDate) params.set("date", filterDate);
      if (filterEmail) params.set("email", filterEmail);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Gagal mengambil data laporan.");
        return;
      }
      setReports(data.data);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterEmail]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Semua Laporan</h1>
          <p className="text-sm text-slate-500">
            Pantau laporan harian seluruh anggota tim.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          Filter
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="monitoring-filter-date" className="text-xs font-medium text-slate-500">
              Tanggal
            </label>
            <input
              id="monitoring-filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="monitoring-filter-email" className="text-xs font-medium text-slate-500">
              Email Karyawan
            </label>
            <input
              id="monitoring-filter-email"
              type="email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="karyawan@email.com"
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              id="monitoring-reset-btn"
              onClick={() => { setFilterDate(""); setFilterEmail(""); }}
              className="px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              id="monitoring-refresh-btn"
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-2">Memuat laporan...</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          <p className="text-xs text-slate-400 mb-3">
            Menampilkan <span className="font-semibold text-slate-600">{reports.length}</span> laporan
          </p>
          <DataTable reports={reports} />
        </div>
      )}
    </div>
  );
}
