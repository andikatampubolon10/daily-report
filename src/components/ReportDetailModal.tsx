"use client";

import { DailyReport } from "@/types/report";
import { hasBlocker } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Smile,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";


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

function formatReportDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReport | null;
}

export default function ReportDetailModal({ isOpen, onClose, report }: ReportDetailModalProps) {
  if (!isOpen || !report) return null;

  const blocker = hasBlocker(report.blocker);
  const initials = getInitials(report.name);
  const avatarColor = getAvatarColor(report.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Detail Laporan</h3>
              <p className="text-sm text-slate-500">Laporan Harian untuk {formatReportDate(report.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Selesai
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Info Box */}
          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0",
                  avatarColor
                )}
              >
                {initials}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{report.name}</p>
                <p className="text-sm text-slate-500">{report.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                WAKTU PENGIRIMAN
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatReportDate(report.date)}, {new Date(report.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            </div>
          </div>

          {/* Pekerjaan Hari Ini */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Pekerjaan Hari Ini
            </h4>
            <div className="bg-white rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200 shadow-sm leading-relaxed">
              {report.today_work}
            </div>
          </div>

          {/* Rencana Besok */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Rencana Besok
            </h4>
            <div className="bg-white rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200 shadow-sm leading-relaxed">
              {report.tomorrow_plan}
            </div>
          </div>

          {/* Kendala (Blocker) */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-slate-500" />
              Kendala (Blocker)
            </h4>
            <div
              className={cn(
                "rounded-lg p-4 text-sm border shadow-sm flex flex-col gap-1",
                blocker
                  ? "bg-red-50/50 border-red-200 text-red-900"
                  : "bg-emerald-50/50 border-emerald-200 text-emerald-900"
              )}
            >
              {blocker ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    Ada Blocker
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {report.blocker}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 font-bold text-emerald-700">
                    <Smile className="w-4 h-4" />
                    Tidak Ada Kendala
                  </div>
                  <p className="text-emerald-700/80">
                    {report.blocker === "Tidak ada" ? "Tidak ada kendala berarti selama proses pengerjaan hari ini." : report.blocker}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              onClick={onClose}
            >
              Tandai Diperiksa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
