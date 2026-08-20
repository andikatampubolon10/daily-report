"use client";

import { useState } from "react";
import { DailyReport } from "@/types/report";
import { formatDate, hasBlocker } from "@/lib/utils";
import { ChevronLeft, ChevronRight, FileSearch } from "lucide-react";
import ReportDetailModal from "./ReportDetailModal";

interface DataTableProps {
  reports: DailyReport[];
  totalCount?: number;
  rangeStart?: number;
  rangeEnd?: number;
  page?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export default function DataTable({
  reports,
  totalCount,
  rangeStart,
  rangeEnd,
  page = 1,
  totalPages = 1,
  onPrevPage,
  onNextPage,
}: DataTableProps) {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  // When pagination props are not provided, show all reports without pagination UI
  const showPagination =
    totalCount !== undefined &&
    rangeStart !== undefined &&
    rangeEnd !== undefined;
  const effectiveTotalCount = totalCount ?? reports.length;
  if (effectiveTotalCount === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <FileSearch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
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
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                Tanggal
              </th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                Nama
              </th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap hidden lg:table-cell">
                Email
              </th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap hidden md:table-cell">
                Pekerjaan Hari Ini
              </th>
              <th className="text-left px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                Kendala
              </th>
              <th className="text-right px-5 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
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
                  {/* Date */}
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-base">
                    {formatDate(report.date)}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap text-base">
                    {report.name}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-slate-500 hidden lg:table-cell text-base">
                    {report.email}
                  </td>

                  {/* Today work */}
                  <td className="px-5 py-4 text-slate-600 max-w-xs hidden md:table-cell text-base">
                    <p className="truncate">{report.today_work}</p>
                  </td>

                  {/* Blocker — badge persegi panjang */}
                  <td className="px-5 py-3.5">
                    {blocker ? (
                      <span className="inline-flex items-center text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-md px-3 py-1">
                        Ada Kendala
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-3 py-1">
                        Tidak Ada Kendala
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Detail →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer — count + pagination (only when pagination props are provided) */}
      {showPagination && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white">
          <p className="text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">{effectiveTotalCount}</span>{" "}
            laporan
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={page <= 1}
              aria-label="Halaman sebelumnya"
              className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={page >= totalPages}
              aria-label="Halaman berikutnya"
              className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ReportDetailModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
}
