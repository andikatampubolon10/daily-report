"use client";

import { useState } from "react";
import { DailyReport } from "@/types/report";
import { hasBlocker } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import ReportDetailModal from "./ReportDetailModal";

interface DashboardReportRowProps {
  report: DailyReport;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Kemarin";
  }

  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatReportDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardReportRow({ report }: DashboardReportRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const blocker = hasBlocker(report.blocker);
  const initials = getInitials(report.name);
  const avatarColor = getAvatarColor(report.name);

  const truncate = (text: string, len: number) =>
    text.length > len ? text.slice(0, len) + "…" : text;

  return (
    <>
      <div className="flex items-center gap-5 bg-white rounded-xl border border-slate-200 px-6 py-5 hover:shadow-sm transition-shadow">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0",
            avatarColor
          )}
          aria-label={report.name}
        >
          {initials}
        </div>

        <div className="w-48 shrink-0">
          <p className="text-base font-semibold text-slate-900 truncate">
            {report.name}
          </p>
          <p className="text-sm text-slate-400 truncate">{report.email}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 w-36 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatReportDate(report.date)}</span>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
          <p className="text-base text-slate-700 truncate">
            <span className="font-medium text-slate-900">Hari ini:</span>{" "}
            <span className="text-slate-600">{truncate(report.today_work, 60)}</span>
          </p>
          <p className="text-base text-slate-700 truncate">
            <span className="font-medium text-slate-900">Besok:</span>{" "}
            <span className="text-slate-600">{truncate(report.tomorrow_plan, 60)}</span>
          </p>
        </div>

        <div className="w-36 shrink-0 flex justify-start">
          {blocker ? (
            <span className="inline-flex items-center text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-full px-3.5 py-1">
              Ada Blocker
            </span>
          ) : (
            <span className="inline-flex items-center text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3.5 py-1">
              Tidak Ada Blocker
            </span>
          )}
        </div>

        <div className="shrink-0 w-20 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
          >
            Detail →
          </button>
        </div>
      </div>

      <ReportDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        report={report} 
      />
    </>
  );
}
