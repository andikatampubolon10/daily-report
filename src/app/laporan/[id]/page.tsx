import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, hasBlocker } from "@/lib/utils";
import {
  Calendar,
  Mail,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const report = await prisma.dailyReport.findUnique({ where: { id } });
    if (!report) return { title: "Laporan Tidak Ditemukan" };
    return {
      title: `Laporan ${report.name} — ${formatDate(report.date)}`,
    };
  } catch {
    return { title: "Detail Laporan" };
  }
}

export default async function LaporanDetailPage({ params }: PageProps) {
  const { id } = await params;

  let report;
  try {
    report = await prisma.dailyReport.findUnique({ where: { id } });
  } catch {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Gagal mengambil data laporan.</p>
      </div>
    );
  }

  if (!report) notFound();

  const blocker = hasBlocker(report.blocker);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <Link
        href="/laporan"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Laporan Saya
      </Link>

      {/* Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{report.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-500">{report.email}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {blocker ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-1">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  Ada Blocker
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">
                  <CheckCircle className="w-3 h-3" aria-hidden="true" />
                  Tidak Ada Blocker
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(report.date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="px-6 py-5 space-y-6">
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Apa yang sudah dilakukan hari ini?
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.today_work}
            </p>
          </section>

          <div className="border-t border-slate-100" />

          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Apa rencana untuk besok?
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.tomorrow_plan}
            </p>
          </section>

          <div className="border-t border-slate-100" />

          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {blocker && (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
              )}
              Blocker
            </h2>
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap ${
                blocker ? "text-red-700" : "text-slate-700"
              }`}
            >
              {report.blocker}
            </p>
          </section>
        </div>

        {/* Card footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Dibuat:{" "}
            {new Date(report.created_at).toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {report.updated_at !== report.created_at && (
            <span className="ml-2">
              · Diperbarui:{" "}
              {new Date(report.updated_at).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
