import ReportForm from "@/components/ReportForm";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Buat Laporan — Laporan Harian",
  description: "Formulir untuk membuat laporan harian baru.",
};

export default async function TambahLaporanPage() {
  const headersList = await headers();
  const initialName = headersList.get("x-user-name") || "";
  const initialEmail = headersList.get("x-user-email") || "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Buat Laporan Harian</h1>
        <p className="text-base text-slate-500 mt-2 max-w-2xl">
          Formulir ini bertujuan untuk memantau perkembangan pekerjaan, menyelaraskan
          prioritas harian, serta mengidentifikasi kendala secara cepat.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <ReportForm initialName={initialName} initialEmail={initialEmail} />
      </div>
    </div>
  );
}
