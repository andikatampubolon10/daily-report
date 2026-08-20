"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable";
import { DailyReport } from "@/types/report";
import { PlusCircle, Search, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LaporanPage() {
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
        setError(data.error ?? "Gagal mengambil laporan.");
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Laporan Saya</h1>
          <p className="text-base text-slate-500 mt-1">
            Lihat dan kelola semua laporan harian yang pernah Anda buat.
          </p>
        </div>
        <Link
          href="/laporan/tambah"
          id="laporan-add-btn"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Laporan
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          Filter Laporan
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-date" className="text-xs font-medium text-slate-500">
              Tanggal
            </label>
            <input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-email" className="text-xs font-medium text-slate-500">
              Email
            </label>
            <input
              id="filter-email"
              type="email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="filter@email.com"
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
          <div className="flex items-end">
            <button
              id="reset-filter-btn"
              type="button"
              onClick={() => {
                setFilterDate("");
                setFilterEmail("");
              }}
              className="px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex items-end">
            <button
              id="refresh-btn"
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-2">Memuat laporan...</p>
        </div>
      )}

      {/* Table */}
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
