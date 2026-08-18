"use client";

import { useState, useEffect } from "react";
import { DailyReport } from "@/types/report";
import ReportCard from "@/components/ReportCard";
import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { hasBlocker } from "@/lib/utils";

export default function BlockerMonitoringPage() {
  const [blockerReports, setBlockerReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBlockers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Gagal mengambil data.");
        return;
      }

      const withBlockers = (data.data as DailyReport[]).filter((r) =>
        hasBlocker(r.blocker)
      );
      setBlockerReports(withBlockers);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlockers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monitoring Blocker</h1>
            <p className="text-sm text-slate-500">
              Daftar laporan yang memiliki kendala aktif dari seluruh tim.
            </p>
          </div>
        </div>
        <button
          type="button"
          id="blocker-refresh-btn"
          onClick={fetchBlockers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-2">Memuat data blocker...</p>
        </div>
      )}

      {!loading && !error && blockerReports.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="font-medium text-slate-700">Tidak Ada Blocker Aktif 🎉</p>
          <p className="text-sm text-slate-400 mt-1">
            Semua anggota tim tidak memiliki kendala saat ini.
          </p>
        </div>
      )}

      {!loading && !error && blockerReports.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-sm font-semibold rounded-full px-3 py-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {blockerReports.length} Blocker Aktif
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {blockerReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
