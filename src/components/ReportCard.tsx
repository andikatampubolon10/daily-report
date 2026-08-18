import { DailyReport } from "@/types/report";
import { formatDate, hasBlocker, truncate } from "@/lib/utils";
import { Calendar, Mail, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ReportCardProps {
  report: DailyReport;
  showActions?: boolean;
}

export default function ReportCard({ report, showActions = true }: ReportCardProps) {
  const blocker = hasBlocker(report.blocker);

  return (
    <div
      className={cn(
        "bg-white rounded-xl border shadow-sm p-5 transition-shadow hover:shadow-md",
        blocker ? "border-red-200" : "border-slate-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{report.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{report.email}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {/* Blocker badge */}
          {blocker ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              Ada Blocker
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
              Tidak Ada Blocker
            </span>
          )}
          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(report.date)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <section>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Pekerjaan Hari Ini
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {truncate(report.today_work, 140)}
          </p>
        </section>

        <section>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Rencana Besok
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {truncate(report.tomorrow_plan, 140)}
          </p>
        </section>

        {blocker && (
          <section className="bg-red-50 border border-red-100 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Blocker
            </p>
            <p className="text-sm text-red-700 leading-relaxed">
              {truncate(report.blocker, 140)}
            </p>
          </section>
        )}
      </div>

      {/* Footer */}
      {showActions && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
              Diedit{" "}
              {new Date(report.updated_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <Link
            href={`/laporan/${report.id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Lihat Detail →
          </Link>
        </div>
      )}
    </div>
  );
}
