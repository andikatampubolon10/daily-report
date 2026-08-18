"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  History,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const employeeItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Laporan Saya", href: "/laporan", icon: FileText },
  { label: "Buat Laporan", href: "/laporan/tambah", icon: PlusCircle },
  { label: "Riwayat", href: "/laporan/riwayat", icon: History },
];

const managerItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Semua Laporan", href: "/monitoring", icon: Users },
  { label: "Monitoring Blocker", href: "/monitoring/blocker", icon: Activity },
  { label: "Riwayat", href: "/laporan/riwayat", icon: History },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 min-h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            Laporan Harian
          </p>
          <p className="text-[11px] text-slate-400">Daily Report System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1.5">
          {role === "MANAGER" ? "Menu Manager" : "Menu Karyawan"}
        </p>

        {(role === "MANAGER" ? managerItems : employeeItems).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/laporan" &&
              pathname.startsWith("/laporan/") &&
              pathname !== "/laporan/tambah" &&
              pathname !== "/laporan/riwayat") ||
            (item.href === "/monitoring" &&
              pathname.startsWith("/monitoring/") &&
              pathname !== "/monitoring/blocker");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
