"use client";

import { useState, useEffect, useMemo } from "react";
import { DailyReport } from "@/types/report";
import { hasBlocker } from "@/lib/utils";
import {
  AlertTriangle,
  Search,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  ServerCrash,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReportDetailModal from "@/components/ReportDetailModal";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-pink-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatReportDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── stat card ────────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: number;
  subtext: string;
  variant: "default" | "accent" | "critical";
}

function SummaryCard({ label, value, subtext, variant }: SummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 flex flex-col justify-between relative overflow-hidden border hover:shadow-md transition-shadow",
        variant === "critical"
          ? "bg-red-50/60 border-red-200"
          : "bg-white border-slate-200"
      )}
    >
      <div>
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-3",
            variant === "critical" ? "text-red-600" : "text-slate-500"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-4xl font-bold",
            variant === "critical" ? "text-red-600" : "text-slate-900"
          )}
        >
          {value}
        </p>
      </div>
      <p
        className={cn(
          "text-xs mt-4",
          variant === "critical" ? "text-red-500" : "text-slate-500"
        )}
      >
        {subtext}
      </p>
    </div>
  );
}

// ─── blocker row ──────────────────────────────────────────────────────────────

interface BlockerRowProps {
  report: DailyReport;
  isUrgent: boolean;
  onDetail: (report: DailyReport) => void;
}

function BlockerRow({ report, isUrgent, onDetail }: BlockerRowProps) {
  const initials = getInitials(report.name);
  const avatarColor = getAvatarColor(report.name);
  const reportDate = formatReportDate(report.date);

  const truncate = (text: string, len: number) =>
    text.length > len ? text.slice(0, len) + "..." : text;

  return (
    <div
      className={cn(
        "bg-white border-y border-r border-slate-200 rounded-r-lg px-5 py-4 hover:bg-slate-50 transition-colors",
        "flex items-center gap-5",
        isUrgent ? "border-l-4 border-l-red-500" : "border-l border-l-slate-200 rounded-l-lg"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0",
          avatarColor
        )}
        aria-label={report.name}
      >
        {initials}
      </div>

      {/* Nama + tanggal */}
      <div className="w-52 shrink-0">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {report.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{reportDate}</span>
        </div>
      </div>

      {/* Teks blocker */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">
          {truncate(report.blocker, 120)}
        </p>
      </div>

      {/* Badge urgent (hanya Perlu Perhatian, tanpa Sedang Ditangani) */}
      <div className="shrink-0">
        {isUrgent && (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-md">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            Perlu Perhatian
          </span>
        )}
      </div>

      {/* Tombol Detail */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={() => onDetail(report)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
        >
          Detail →
        </button>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function BlockerMonitoringPage() {
  const [allBlockers, setAllBlockers] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

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
      setAllBlockers(withBlockers);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlockers();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const todayBlockers = useMemo(
    () => allBlockers.filter((r) => r.date === todayStr),
    [allBlockers, todayStr]
  );

  const unhandledCount = todayBlockers.length;

  const filtered = useMemo(() => {
    if (!search.trim()) return allBlockers;
    const q = search.toLowerCase();
    return allBlockers.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.blocker.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }, [allBlockers, search]);

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-slate-900">
              Monitoring Blocker
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Priority Review
            </span>
          </div>
          <p className="text-base text-slate-500 mt-2">
            Pantau kendala yang dilaporkan oleh anggota tim.
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-2">Memuat data blocker...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Blocker"
              value={allBlockers.length}
              subtext="Total akumulasi laporan blocker"
              variant="default"
            />
            <SummaryCard
              label="Blocker Hari Ini"
              value={todayBlockers.length}
              subtext="Dilaporkan pada hari ini"
              variant="accent"
            />
            <SummaryCard
              label="Belum Ditangani"
              value={unhandledCount}
              subtext="Membutuhkan perhatian segera"
              variant="critical"
            />
          </div>

          {/* ── No blockers at all ── */}
          {allBlockers.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-semibold text-slate-700">
                Tidak Ada Blocker Aktif 🎉
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Semua anggota tim tidak memiliki kendala saat ini.
              </p>
            </div>
          )}

          {/* ── Filter bar + list ── */}
          {allBlockers.length > 0 && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-semibold text-slate-900">
                    Daftar Blocker Aktif
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {filtered.length} Reports
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id="blocker-search"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama atau kendala..."
                      className="pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-60 text-slate-700"
                    />
                  </div>
                  {/* Filter button */}
                  <button
                    type="button"
                    id="blocker-filter-btn"
                    onClick={fetchBlockers}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    aria-label="Filter data"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filter
                  </button>
                  {/* Refresh */}
                  <button
                    type="button"
                    id="blocker-refresh-btn"
                    onClick={fetchBlockers}
                    disabled={loading}
                    className="p-2 text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    aria-label="Refresh"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                  </button>
                </div>
              </div>

              {/* No search results */}
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <ServerCrash className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Tidak ada hasil untuk{" "}
                    <span className="font-semibold">"{search}"</span>.
                  </p>
                </div>
              )}

              {/* Blocker list */}
              {filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                  {filtered.map((report) => {
                    const isUrgent = report.date === todayStr;
                    return (
                      <BlockerRow
                        key={report.id}
                        report={report}
                        isUrgent={isUrgent}
                        onDetail={setSelectedReport}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Detail Modal ── */}
      <ReportDetailModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
}
