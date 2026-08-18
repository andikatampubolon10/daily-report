import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DailyReport as DailyReportType, ApiResponse } from "@/types/report";

type PrismaReport = {
  id: string;
  date: Date;
  name: string;
  email: string;
  today_work: string;
  tomorrow_plan: string;
  blocker: string;
  created_at: Date;
  updated_at: Date;
};

function toApiReport(report: PrismaReport): DailyReportType {
  return {
    id: report.id,
    date: report.date.toISOString().split("T")[0],
    name: report.name,
    email: report.email,
    today_work: report.today_work,
    tomorrow_plan: report.tomorrow_plan,
    blocker: report.blocker,
    created_at: report.created_at.toISOString(),
    updated_at: report.updated_at.toISOString(),
  };
}

// GET /api/reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    let emailParam = searchParams.get("email");

    const role = request.headers.get("x-user-role");
    const userEmail = request.headers.get("x-user-email");

    // Enforce EMPLOYEE can only see their own reports
    if (role === "EMPLOYEE") {
      emailParam = userEmail;
    }

    const whereClause: { date?: Date; email?: string } = {};
    if (dateParam) whereClause.date = new Date(dateParam);
    if (emailParam) whereClause.email = emailParam;

    const reports = await prisma.dailyReport.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: reports.map(toApiReport),
    } satisfies ApiResponse<DailyReportType[]>);
  } catch (error) {
    console.error("[GET /api/reports]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil laporan" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}

// POST /api/reports
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, today_work, tomorrow_plan, blocker } = body;

    // Retrieve authenticated user's identity
    const sessionName = request.headers.get("x-user-name") || "";
    const sessionEmail = request.headers.get("x-user-email") || "";
    const sessionRole = request.headers.get("x-user-role");

    // Use values from form, fallback to session
    let finalName = body.name?.trim() || sessionName;
    let finalEmail = body.email?.trim().toLowerCase() || sessionEmail;

    // Security: Employee must not be able to spoof other users
    if (sessionRole === "EMPLOYEE") {
      finalEmail = sessionEmail;
    }

    if (!date || !finalName || !finalEmail || !today_work || !tomorrow_plan || !blocker) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    const report = await prisma.dailyReport.create({
      data: {
        date: new Date(date),
        name: finalName,
        email: finalEmail,
        today_work: today_work.trim(),
        tomorrow_plan: tomorrow_plan.trim(),
        blocker: blocker.trim(),
      },
    });

    return NextResponse.json(
      { success: true, data: toApiReport(report) } satisfies ApiResponse<DailyReportType>,
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reports]", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat laporan" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
