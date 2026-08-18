import { prisma } from "@/lib/prisma";
import DataTable from "@/components/DataTable";
import { DailyReport } from "@/types/report";
import { AlertTriangle, History } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riwayat Laporan — Laporan Harian",
  description: "Riwayat seluruh laporan harian yang pernah dibuat.",
};

export const revalidate = 60;

export default async function RiwayatPage() {
  let reports: DailyReport[] = [];
  let dbError = false;

  try {
    const raw = await prisma.dailyReport.findMany({
      orderBy: { date: "desc" },
    });
    reports = raw.map((r) => ({
      id: r.id,
      date: r.date.toISOString().split("T")[0],
      name: r.name,
      email: r.email,
      today_work: r.today_work,
      tomorrow_plan: r.tomorrow_plan,
      blocker: r.blocker,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
  } catch (err) {
    console.error("[RiwayatPage]", err);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          <History className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Laporan</h1>
          <p className="text-sm text-slate-500">
            Semua laporan yang pernah dibuat, diurutkan dari terbaru.
          </p>
        </div>
      </div>

      {dbError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Tidak dapat memuat data. Pastikan koneksi database sudah dikonfigurasi.</span>
        </div>
      )}

      {!dbError && (
        <div>
          <p className="text-xs text-slate-400 mb-3">
            Total <span className="font-semibold text-slate-600">{reports.length}</span> laporan
          </p>
          <DataTable reports={reports} />
        </div>
      )}
    </div>
  );
}
