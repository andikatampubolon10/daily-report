import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import ReportCard from "@/components/ReportCard";
import { DailyReport } from "@/types/report";
import {
  BarChart3,
  CalendarCheck,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { hasBlocker } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Laporan Harian",
  description: "Ringkasan statistik dan laporan terbaru dari seluruh tim.",
};

// Revalidate every 60 seconds so data stays fresh without a full rebuild
export const revalidate = 60;

async function getDashboardData(
  role: string | null,
  email: string | null
): Promise<{
  totalReports: number;
  todayReports: number;
  activeBlockers: number;
  recentReports: DailyReport[];
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const whereClause = role === "EMPLOYEE" && email ? { email } : {};
  const todayWhereClause = { ...whereClause, date: today };

  const [totalReports, todayCount, allReports, recentRaw] = await Promise.all([
    prisma.dailyReport.count({ where: whereClause }),
    prisma.dailyReport.count({ where: todayWhereClause }),
    prisma.dailyReport.findMany({ where: whereClause, select: { blocker: true } }),
    prisma.dailyReport.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      take: 6,
    }),
  ]);

  const activeBlockers = allReports.filter((r) => hasBlocker(r.blocker)).length;

  const recentReports: DailyReport[] = recentRaw.map((r) => ({
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

  return { totalReports, todayReports: todayCount, activeBlockers, recentReports };
}

import { headers } from "next/headers";

export default async function DashboardPage() {
  let data;
  let dbError = false;

  const headersList = await headers();
  const role = headersList.get("x-user-role");
  const email = headersList.get("x-user-email");

  try {
    data = await getDashboardData(role, email);
  } catch (error) {
    console.error("[DashboardPage]", error);
    dbError = true;
    data = {
      totalReports: 0,
      todayReports: 0,
      activeBlockers: 0,
      recentReports: [],
    };
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "MANAGER" 
              ? "Ringkasan laporan harian seluruh tim Anda." 
              : "Ringkasan laporan harian Anda."}
          </p>
        </div>
        <Link
          href="/laporan/tambah"
          id="dashboard-add-report-btn"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Buat Laporan
        </Link>
      </div>

      {/* DB error banner */}
      {dbError && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Tidak dapat terhubung ke database. Pastikan{" "}
            <code className="font-mono text-xs bg-amber-100 px-1 rounded">
              DATABASE_URL
            </code>{" "}
            sudah dikonfigurasi di <code className="font-mono text-xs bg-amber-100 px-1 rounded">.env.local</code>.
          </span>
        </div>
      )}

      {/* Stats */}
      <section aria-label="Statistik laporan">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Laporan"
            value={data.totalReports}
            icon={BarChart3}
            description="Semua laporan yang pernah dibuat"
            variant="default"
          />
          <StatCard
            title="Laporan Hari Ini"
            value={data.todayReports}
            icon={CalendarCheck}
            description="Laporan yang dibuat hari ini"
            variant="success"
          />
          <StatCard
            title="Blocker Aktif"
            value={data.activeBlockers}
            icon={AlertTriangle}
            description="Laporan dengan kendala yang dilaporkan"
            variant={data.activeBlockers > 0 ? "danger" : "success"}
          />
        </div>
      </section>

      {/* Recent Reports */}
      <section aria-label="Laporan terbaru">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Laporan Terbaru
          </h2>
          <Link
            href="/laporan"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Lihat semua →
          </Link>
        </div>

        {data.recentReports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada laporan.</p>
            <p className="text-sm text-slate-400 mt-1">
              Buat laporan harian pertama Anda.
            </p>
            <Link
              href="/laporan/tambah"
              className="inline-flex mt-4 items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
            >
              Buat laporan sekarang →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
