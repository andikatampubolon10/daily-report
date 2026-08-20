"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight, FileText } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Gagal login. Periksa email dan password Anda.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans antialiased"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f3f3fe 100%)" }}
    >
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hexagons" x="0" y="0" width="80" height="92" patternUnits="userSpaceOnUse">
              <polygon
                points="40,4 76,24 76,68 40,88 4,68 4,24"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Main container */}
      <main className="w-full max-w-[440px] mx-auto relative z-10">
        {/* Header area */}
        <div className="flex flex-col items-center justify-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 text-center tracking-tight">
            Masuk ke Laporan Harian
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Silakan masukkan kredensial Anda untuk melanjutkan
          </p>
        </div>

        {/* Glass card */}
        <div
          className="w-full rounded-xl p-10"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          }}
        >
          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide">
                Email
              </label>
              <div
                className="relative flex items-center rounded-lg bg-white border border-slate-200 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
              >
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@perusahaan.com"
                  className="w-full bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 py-2.5 pr-4 pl-10 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 tracking-wide">
                  Password
                </label>
              </div>
              <div
                className="relative flex items-center rounded-lg bg-white border border-slate-200 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
              >
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 py-2.5 pl-10 pr-10 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 -mt-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-opacity-20 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-500 cursor-pointer select-none"
              >
                Ingat saya
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
      </main>
    </div>
  );
}
