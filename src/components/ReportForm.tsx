"use client";

import { useState, useTransition, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreateReportInput } from "@/types/report";
import { AlertCircle, Loader2, CheckCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

/** Konversi yyyy-mm-dd → dd/mm/yyyy untuk tampilan */
function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Konversi dd/mm/yyyy → yyyy-mm-dd untuk internal */
function displayToIso(display: string): string {
  const parts = display.replace(/[^\d/]/g, "").split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
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
  const [noBlocker, setNoBlocker] = useState(false);
  const [displayDate, setDisplayDate] = useState<string>(isoToDisplay(getTodayDate()));
  const hiddenDateRef = useRef<HTMLInputElement>(null);
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

    const effectivBlocker = noBlocker ? "Tidak ada" : formData.blocker;
    if (!effectivBlocker.trim())
      errs.blocker = 'Blocker wajib diisi. Centang "Tidak ada blocker" jika tidak ada kendala.';

    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleNoBlockerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setNoBlocker(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, blocker: "Tidak ada" }));
      setErrors((prev) => ({ ...prev, blocker: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, blocker: "" }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateReportInput = {
      ...formData,
      blocker: noBlocker ? "Tidak ada" : formData.blocker,
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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

  // Success state
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

  const inputBase = cn(
    "w-full px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

      {/* Row 1 — Tanggal | Nama | Email */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tanggal */}
        <div>
          <label
            htmlFor={`${id}-date`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Tanggal
          </label>
          <div className="relative flex items-center">
            <input
              id={`${id}-date`}
              name="date"
              type="text"
              inputMode="numeric"
              value={displayDate}
              onChange={(e) => {
                let val = e.target.value;
                val = val.replace(/[^\d/]/g, "");
                if (val.length === 2 && displayDate.length === 1) val += "/";
                if (val.length === 5 && displayDate.length === 4) val += "/";
                setDisplayDate(val);
                const iso = displayToIso(val);
                setFormData((prev) => ({ ...prev, date: iso }));
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              aria-required="true"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? `${id}-date-error` : undefined}
              className={cn(
                inputBase,
                "pr-10",
                errors.date ? "border-red-300 focus:ring-red-400" : "border-slate-300 hover:border-slate-400"
              )}
            />
            {/* Tombol kalender */}
            <button
              type="button"
              onClick={() => hiddenDateRef.current?.showPicker()}
              className="absolute right-2.5 text-slate-400 hover:text-blue-600 transition-colors"
              aria-label="Buka kalender"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            {/* Hidden date picker — digunakan oleh tombol kalender */}
            <input
              ref={hiddenDateRef}
              type="date"
              value={formData.date}
              onChange={(e) => {
                const iso = e.target.value;
                setFormData((prev) => ({ ...prev, date: iso }));
                setDisplayDate(isoToDisplay(iso));
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
          {errors.date && (
            <p id={`${id}-date-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Nama */}
        <div>
          <label
            htmlFor={`${id}-name`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nama
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={cn(
              inputBase,
              errors.name ? "border-red-300 focus:ring-red-400" : "border-slate-300 hover:border-slate-400"
            )}
          />
          {errors.name && (
            <p id={`${id}-name-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor={`${id}-email`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@perusahaan.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            className={cn(
              inputBase,
              errors.email ? "border-red-300 focus:ring-red-400" : "border-slate-300 hover:border-slate-400"
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

      {/* Row 2 — Work Today | Plan Tomorrow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work Today */}
        <div>
          <label
            htmlFor={`${id}-today_work`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Pekerjaan Hari Ini
          </label>
          <textarea
            id={`${id}-today_work`}
            name="today_work"
            rows={5}
            value={formData.today_work}
            onChange={handleChange}
            placeholder="Apa yang Anda kerjakan hari ini?"
            aria-required="true"
            aria-invalid={!!errors.today_work}
            aria-describedby={errors.today_work ? `${id}-today_work-error` : undefined}
            className={cn(
              inputBase,
              "resize-y",
              errors.today_work ? "border-red-300 focus:ring-red-400" : "border-slate-300 hover:border-slate-400"
            )}
          />
          {errors.today_work && (
            <p id={`${id}-today_work-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.today_work}
            </p>
          )}
        </div>

        {/* Plan Tomorrow */}
        <div>
          <label
            htmlFor={`${id}-tomorrow_plan`}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Rencana Besok
          </label>
          <textarea
            id={`${id}-tomorrow_plan`}
            name="tomorrow_plan"
            rows={5}
            value={formData.tomorrow_plan}
            onChange={handleChange}
            placeholder="Apa rencana pekerjaan Anda besok?"
            aria-required="true"
            aria-invalid={!!errors.tomorrow_plan}
            aria-describedby={errors.tomorrow_plan ? `${id}-tomorrow_plan-error` : undefined}
            className={cn(
              inputBase,
              "resize-y",
              errors.tomorrow_plan ? "border-red-300 focus:ring-red-400" : "border-slate-300 hover:border-slate-400"
            )}
          />
          {errors.tomorrow_plan && (
            <p id={`${id}-tomorrow_plan-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.tomorrow_plan}
            </p>
          )}
        </div>
      </div>

      {/* Row 3 — Blocker full width */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={`${id}-blocker`}
            className="text-sm font-medium text-slate-700"
          >
            Kendala
          </label>
          {/* No blocker checkbox */}
          <label
            htmlFor={`${id}-no-blocker`}
            className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none"
          >
            <input
              id={`${id}-no-blocker`}
              type="checkbox"
              checked={noBlocker}
              onChange={handleNoBlockerChange}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            Tidak ada kendala
          </label>
        </div>
        <textarea
          id={`${id}-blocker`}
          name="blocker"
          rows={4}
          value={noBlocker ? "Tidak ada" : formData.blocker}
          onChange={handleChange}
          disabled={noBlocker}
          placeholder="Jelaskan kendala yang Anda hadapi (jika ada)..."
          aria-required="true"
          aria-invalid={!!errors.blocker}
          aria-describedby={errors.blocker ? `${id}-blocker-error` : undefined}
          className={cn(
            inputBase,
            "resize-y",
            noBlocker
              ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
              : errors.blocker
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

      {/* Divider */}
      <div className="border-t border-slate-100 pt-4" />

      {/* Footer actions — right aligned */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/laporan"
          id="cancel-report-btn"
          className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Batal
        </Link>
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
