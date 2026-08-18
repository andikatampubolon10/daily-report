import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard Laporan Harian",
  description:
    "Platform pemantauan laporan harian karyawan — pantau perkembangan pekerjaan, prioritas harian, dan identifikasi kendala secara cepat.",
};

import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let session = null;
  if (token) {
    session = await decrypt(token);
  }

  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex">
        {session && <Sidebar role={session.role} />}
        <div className="flex-1 flex flex-col min-w-0">
          {session && <Navbar name={session.name} email={session.email} />}
          <main className={session ? "flex-1 p-6 lg:p-8" : "flex-1"}>{children}</main>
        </div>
      </body>
    </html>
  );
}
