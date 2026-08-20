"use client";

import { useState, useEffect, useMemo } from "react";
import { DailyReport } from "@/types/report";
import { hasBlocker } from "@/lib/utils";
import {
  AlertTriangle,
  Download,
  Search,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  ServerCrash,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Hari ini, ${time}`;
  if (isYesterday) return `Kemarin, ${time}`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/** Derive a rough "role" label from email prefix */
function getRoleFromEmail(email: string): string {
  const prefix = email.split("@")[0].toLowerCase();
  if (prefix.includes("manager")) return "Manager";
  if (prefix.includes("admin")) return "Administrator";
  if (prefix.includes("dev") || prefix.includes("backend")) return "Backend Developer";
  if (prefix.includes("front") || prefix.includes("fe")) return "Frontend Developer";
  if (prefix.includes("qa") || prefix.includes("test")) return "QA Engineer";
  if (prefix.includes("design") || prefix.includes("ui")) return "UI/UX Designer";
  if (prefix.includes("devops")) return "DevOps Engineer";
  return "Team Member";
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
  /** Reports created today are "Perlu Perhatian"; older ones are "Sedang Ditangani" */
  isUrgent: boolean;
}

function BlockerRow({ report, isUrgent }: BlockerRowProps) {
  const initials = getInitials(report.name);
  const avatarColor = getAvatarColor(report.name);
  const role = getRoleFromEmail(report.email);
  const time = formatRelativeTime(report.created_at);

  const truncate = (text: string, len: number) =>
    text.length > len ? text.slice(0, len) + "..." : text;

  return (
    <div
      className={cn(
        "bg-white border-y border-r border-slate-200 rounded-r-lg p-4 hover:bg-slate-50 transition-colors",
        "flex flex-col lg:flex-row lg:items-center justify-between gap-4",
        isUrgent ? "border-l-4 border-l-red-500" : "border-l border-l-slate-200 rounded-l-lg"
      )}
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* User info */}
        <div className="md:col-span-3 flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0",
              avatarColor
            )}
            aria-label={report.name}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {report.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{role}</p>
          </div>
        </div>

        {/* Blocker content */}
        <div className="md:col-span-6 flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-900 line-clamp-1">
            {truncate(report.blocker, 80)}
          </p>
          <p className="text-xs text-slate-500 line-clamp-1">
            {truncate(report.today_work, 80)}
          </p>
        </div>

        {/* Time + status badge */}
        <div className="md:col-span-3 flex flex-col items-start md:items-end gap-1.5">
          <span className="text-xs text-slate-400">{time}</span>
          {isUrgent ? (
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              Perlu Perhatian
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Sedang Ditangani
            </span>
          )}
        </div>
      </div>

      {/* Detail link */}
      <div className="flex-shrink-0">
        <Link
          href={`/laporan/${report.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
        >
          Detail →
        </Link>
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

  // Determine today's date string for comparison
  const todayStr = new Date().toISOString().split("T")[0];

  const todayBlockers = useMemo(
    () => allBlockers.filter((r) => r.date === todayStr),
    [allBlockers, todayStr]
  );

  // "Belum ditangani" = reported today (most urgent)
  const unhandledCount = todayBlockers.length;

  // Search filter
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

  // Export as CSV
  function handleExport() {
    if (filtered.length === 0) return;
    const header = ["Tanggal", "Nama", "Email", "Blocker"].join(",");
    const rows = filtered.map((r) =>
      [r.date, `"${r.name}"`, r.email, `"${r.blocker.replace(/"/g, '""')}"`].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blocker-report-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
        <button
          type="button"
          id="blocker-export-btn"
          onClick={handleExport}
          disabled={loading || filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
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
                  {/* Refresh */}
                  <button
                    type="button"
                    id="blocker-refresh-btn"
                    onClick={fetchBlockers}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    aria-label="Refresh data"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filter
                  </button>
                  <button
                    type="button"
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
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
