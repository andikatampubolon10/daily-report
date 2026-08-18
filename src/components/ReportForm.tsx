"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { CreateReportInput } from "@/types/report";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrors {
  date?: string;
  name?: string;
  email?: string;
  today_work?: string;
  tomorrow_plan?: string;
  blocker?: string;
  form?: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function ReportForm({
  initialName = "",
  initialEmail = "",
}: {
  initialName?: string;
  initialEmail?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const id = useId();

  const [formData, setFormData] = useState<CreateReportInput>({
    date: getTodayDate(),
    name: initialName,
    email: initialEmail,
    today_work: "",
    tomorrow_plan: "",
    blocker: "",
  });

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!formData.date) errs.date = "Tanggal wajib diisi.";
    if (!formData.name.trim()) errs.name = "Nama wajib diisi.";
    if (!formData.email.trim()) {
      errs.email = "Email wajib diisi.";
    } else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(formData.email)) {
      errs.email = "Format email tidak valid.";
    }
    if (!formData.today_work.trim())
      errs.today_work = "Pekerjaan hari ini wajib diisi.";
    if (!formData.tomorrow_plan.trim())
      errs.tomorrow_plan = "Rencana besok wajib diisi.";
    if (!formData.blocker.trim())
      errs.blocker = 'Blocker wajib diisi. Tulis "Tidak ada" jika tidak ada kendala.';

    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setErrors({ form: result.error ?? "Terjadi kesalahan saat menyimpan laporan." });
          return;
        }

        setSubmitted(true);
        setTimeout(() => {
          router.push("/laporan");
          router.refresh();
        }, 1500);
      } catch {
        setErrors({ form: "Gagal terhubung ke server. Coba lagi." });
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Laporan berhasil disimpan!
        </h2>
        <p className="text-sm text-slate-500">Mengalihkan ke daftar laporan...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
      {/* Form-level error */}
      {errors.form && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Date */}
      <div>
        <label
          htmlFor={`${id}-date`}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Tanggal <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id={`${id}-date`}
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? `${id}-date-error` : undefined}
          className={cn(
            "w-full px-3 py-2.5 text-sm border rounded-lg bg-white shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.date
              ? "border-red-300 focus:ring-red-400"
              : "border-slate-300 hover:border-slate-400"
          )}
        />
        {errors.date && (
          <p id={`${id}-date-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.date}
          </p>
        )}
      </div>

      {/* Name + Email (side by side on md+) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nama <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama lengkap Anda"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg bg-white shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.name
                ? "border-red-300 focus:ring-red-400"
                : "border-slate-300 hover:border-slate-400"
            )}
          />
          {errors.name && (
            <p id={`${id}-name-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${id}-email`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nama@perusahaan.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            className={cn(
              "w-full px-3 py-2.5 text-sm border rounded-lg bg-white shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.email
                ? "border-red-300 focus:ring-red-400"
                : "border-slate-300 hover:border-slate-400"
            )}
          />
          {errors.email && (
            <p id={`${id}-email-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Today's Work */}
      <div>
        <label
          htmlFor={`${id}-today_work`}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Apa yang sudah Anda lakukan hari ini?{" "}
          <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${id}-today_work`}
          name="today_work"
          rows={4}
          value={formData.today_work}
          onChange={handleChange}
          placeholder="Tuliskan pekerjaan yang telah Anda selesaikan hari ini..."
          aria-required="true"
          aria-invalid={!!errors.today_work}
          aria-describedby={errors.today_work ? `${id}-today_work-error` : undefined}
          className={cn(
            "w-full px-3 py-2.5 text-sm border rounded-lg bg-white shadow-sm resize-none transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.today_work
              ? "border-red-300 focus:ring-red-400"
              : "border-slate-300 hover:border-slate-400"
          )}
        />
        {errors.today_work && (
          <p id={`${id}-today_work-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.today_work}
          </p>
        )}
      </div>

      {/* Tomorrow's Plan */}
      <div>
        <label
          htmlFor={`${id}-tomorrow_plan`}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Apa rencana Anda untuk besok?{" "}
          <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${id}-tomorrow_plan`}
          name="tomorrow_plan"
          rows={4}
          value={formData.tomorrow_plan}
          onChange={handleChange}
          placeholder="Tuliskan rencana pekerjaan Anda untuk hari esok..."
          aria-required="true"
          aria-invalid={!!errors.tomorrow_plan}
          aria-describedby={errors.tomorrow_plan ? `${id}-tomorrow_plan-error` : undefined}
          className={cn(
            "w-full px-3 py-2.5 text-sm border rounded-lg bg-white shadow-sm resize-none transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.tomorrow_plan
              ? "border-red-300 focus:ring-red-400"
              : "border-slate-300 hover:border-slate-400"
          )}
        />
        {errors.tomorrow_plan && (
          <p id={`${id}-tomorrow_plan-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.tomorrow_plan}
          </p>
        )}
      </div>

      {/* Blocker */}
      <div>
        <label
          htmlFor={`${id}-blocker`}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Apa blocker Anda hari ini?{" "}
          <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Jika tidak ada kendala, tulis{" "}
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, blocker: "Tidak ada" }));
              if (errors.blocker) setErrors((prev) => ({ ...prev, blocker: undefined }));
            }}
            className="font-medium text-blue-600 hover:underline"
          >
            "Tidak ada"
          </button>
        </p>
        <textarea
          id={`${id}-blocker`}
          name="blocker"
          rows={3}
          value={formData.blocker}
          onChange={handleChange}
          placeholder='Tuliskan kendala Anda, atau klik "Tidak ada" di atas...'
          aria-required="true"
          aria-invalid={!!errors.blocker}
          aria-describedby={errors.blocker ? `${id}-blocker-error` : undefined}
          className={cn(
            "w-full px-3 py-2.5 text-sm border rounded-lg bg-white shadow-sm resize-none transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.blocker
              ? "border-red-300 focus:ring-red-400"
              : "border-slate-300 hover:border-slate-400"
          )}
        />
        {errors.blocker && (
          <p id={`${id}-blocker-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.blocker}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          id="submit-report-btn"
          type="submit"
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all",
            "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Menyimpan..." : "Simpan Laporan"}
        </button>
      </div>
    </form>
  );
}
