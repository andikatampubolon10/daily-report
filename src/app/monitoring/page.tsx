"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DataTable from "@/components/DataTable";
import { DailyReport } from "@/types/report";
import { RefreshCw, AlertTriangle, Search, ChevronDown, CalendarDays } from "lucide-react";

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

const PAGE_SIZE = 10;

type BlockerFilter = "all" | "blocker" | "no-blocker";

export default function MonitoringPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterBlocker, setFilterBlocker] = useState<BlockerFilter>("all");
  const [page, setPage] = useState(1);
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
        setError(data.error ?? "Gagal mengambil data laporan.");
        return;
      }
      setReports(data.data);
      setPage(1);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterEmail]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Client-side blocker filter
  const filteredReports = reports.filter((r) => {
    if (filterBlocker === "all") return true;
    const noBlockerKeywords = ["tidak ada", "none", "no blocker", "-"];
    const isBlocker = !noBlockerKeywords.some((kw) =>
      r.blocker.toLowerCase().includes(kw)
    );
    return filterBlocker === "blocker" ? isBlocker : !isBlocker;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const paginatedReports = filteredReports.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleReset = () => {
    setFilterDate("");
    setFilterEmail("");
    setFilterBlocker("all");
    setPage(1);
    setDisplayFilterDate("");
  };

  const rangeStart = filteredReports.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredReports.length);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Semua Laporan</h1>
        <p className="text-base text-blue-600 mt-2">
          Pantau laporan harian seluruh anggota tim.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="monitoring-filter-date"
              className="text-xs font-medium text-slate-500"
            >
              Tanggal
            </label>
            <div className="relative flex items-center">
              <input
                id="monitoring-filter-date"
                type="text"
                inputMode="numeric"
                value={displayFilterDate}
                onChange={(e) => {
                  let val = e.target.value;
                  val = val.replace(/[^\d/]/g, "");
                  if (val.length === 2 && displayFilterDate.length === 1) val += "/";
                  if (val.length === 5 && displayFilterDate.length === 4) val += "/";
                  setDisplayFilterDate(val);
                  const iso = displayToIso(val);
                  setFilterDate(iso);
                  setPage(1);
                }}
                placeholder="dd/mm/yyyy"
                maxLength={10}
                className="px-3 py-2 pr-9 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
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
                  setPage(1);
                }}
                className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Email / Name search */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="monitoring-filter-email"
              className="text-xs font-medium text-slate-500"
            >
              Email / Nama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                id="monitoring-filter-email"
                type="text"
                value={filterEmail}
                onChange={(e) => { setFilterEmail(e.target.value); setPage(1); }}
                placeholder="Cari anggota tim..."
                className="pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 text-slate-700"
              />
            </div>
          </div>

          {/* Blocker Status */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="monitoring-filter-blocker"
              className="text-xs font-medium text-slate-500"
            >
              Status Blocker
            </label>
            <div className="relative">
              <select
                id="monitoring-filter-blocker"
                value={filterBlocker}
                onChange={(e) => { setFilterBlocker(e.target.value as BlockerFilter); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white w-40"
              >
                <option value="all">Semua Status</option>
                <option value="blocker">Ada Blocker</option>
                <option value="no-blocker">Lancar</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-0.5">
            <button
              type="button"
              id="monitoring-reset-btn"
              onClick={handleReset}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Reset
            </button>
            <button
              type="button"
              id="monitoring-refresh-btn"
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 shadow-sm"
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

      {/* Table + Pagination */}
      {!loading && !error && (
        <DataTable
          reports={paginatedReports}
          totalCount={filteredReports.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          page={page}
          totalPages={totalPages}
          onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      )}
    </div>
  );
}
