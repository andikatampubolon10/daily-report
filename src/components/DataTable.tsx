import { DailyReport } from "@/types/report";
import { formatDate, hasBlocker } from "@/lib/utils";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DataTableProps {
  reports: DailyReport[];
}

export default function DataTable({ reports }: DataTableProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 font-medium">Belum ada laporan.</p>
        <p className="text-sm text-slate-400 mt-1">
          Laporan akan muncul di sini setelah dikirimkan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                Tanggal
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                Nama
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap hidden lg:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap hidden md:table-cell">
                Pekerjaan Hari Ini
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                Status
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => {
              const blocker = hasBlocker(report.blocker);
              return (
                <tr
                  key={report.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(report.date)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    {report.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                    {report.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs hidden md:table-cell">
                    <p className="truncate">{report.today_work}</p>
                  </td>
                  <td className="px-4 py-3">
                    {blocker ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
                          "bg-red-50 text-red-700 border border-red-200"
                        )}
                      >
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                        <span>Ada Blocker</span>
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
                          "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        )}
                      >
                        <CheckCircle className="w-3 h-3" aria-hidden="true" />
                        <span>Lancar</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/laporan/${report.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Detail
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
