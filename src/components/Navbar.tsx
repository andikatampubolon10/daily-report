"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar({ name, email }: { name: string; email: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Left side (could be page title or breadcrumbs, empty for now to match layout) */}
      <div></div>

      {/* Right side - Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 focus:outline-none hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{name}</p>
            <p className="text-xs text-slate-400 leading-tight mt-0.5">{email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {initials}
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
