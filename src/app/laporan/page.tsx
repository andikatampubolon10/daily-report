"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DataTable from "@/components/DataTable";
import { DailyReport } from "@/types/report";
import { PlusCircle, Search, RefreshCw, AlertTriangle, CalendarDays } from "lucide-react";
import Link from "next/link";

/** Konversi yyyy-mm-dd → dd/mm/yyyy untuk tampilan */
function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Konversi dd/mm/yyyy → yyyy-mm-dd untuk filter API */
function displayToIso(display: string): string {
  const parts = display.replace(/[^\d/]/g, "").split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
}

export default function LaporanPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [displayFilterDate, setDisplayFilterDate] = useState("");
  const hiddenDateRef = useRef<HTMLInputElement>(null);

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
            <div className="relative flex items-center">
              <input
                id="filter-date"
                type="text"
                inputMode="numeric"
                value={displayFilterDate}
                onChange={(e) => {
                  let val = e.target.value;
                  val = val.replace(/[^\d/]/g, "");
                  if (val.length === 2 && displayFilterDate.length === 1) val += "/";
                  if (val.length === 5 && displayFilterDate.length === 4) val += "/";
                  setDisplayFilterDate(val);
                  setFilterDate(displayToIso(val));
                }}
                placeholder="dd/mm/yyyy"
                maxLength={10}
                className="px-3 py-2 pr-9 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Tombol kalender */}
              <button
                type="button"
                onClick={() => hiddenDateRef.current?.showPicker()}
                className="absolute right-2.5 text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Buka kalender"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              {/* Hidden date picker */}
              <input
                ref={hiddenDateRef}
                type="date"
                value={filterDate}
                onChange={(e) => {
                  const iso = e.target.value;
                  setFilterDate(iso);
                  setDisplayFilterDate(isoToDisplay(iso));
                }}
                className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
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
                setDisplayFilterDate("");
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
