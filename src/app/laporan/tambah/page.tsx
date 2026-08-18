import ReportForm from "@/components/ReportForm";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Buat Laporan — Laporan Harian",
  description: "Formulir untuk membuat laporan harian baru.",
};

import { headers } from "next/headers";

export default async function TambahLaporanPage() {
  const headersList = await headers();
  const initialName = headersList.get("x-user-name") || "";
  const initialEmail = headersList.get("x-user-email") || "";
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/laporan"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Laporan Saya
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">Buat Laporan Harian</h1>
        <p className="text-sm text-slate-500 mt-1">
          Formulir ini bertujuan untuk memantau perkembangan pekerjaan, menyelaraskan
          prioritas harian, serta mengidentifikasi kendala secara cepat.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200" />

      {/* Form */}
      <ReportForm initialName={initialName} initialEmail={initialEmail} />
    </div>
  );
}
