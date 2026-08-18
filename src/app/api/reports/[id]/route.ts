import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DailyReport as DailyReportType, ApiResponse } from "@/types/report";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

// GET /api/reports/[id]
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const report = await prisma.dailyReport.findUnique({ where: { id } });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const role = _request.headers.get("x-user-role");
    const userEmail = _request.headers.get("x-user-email");
    if (role === "EMPLOYEE" && report.email !== userEmail) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" } satisfies ApiResponse<never>,
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toApiReport(report),
    } satisfies ApiResponse<DailyReportType>);
  } catch (error) {
    console.error("[GET /api/reports/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil laporan" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}

// PUT /api/reports/[id]
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.dailyReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const role = request.headers.get("x-user-role");
    const userEmail = request.headers.get("x-user-email");
    if (role === "EMPLOYEE" && existing.email !== userEmail) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" } satisfies ApiResponse<never>,
        { status: 403 }
      );
    }

    const updateData: {
      date?: Date;
      name?: string;
      email?: string;
      today_work?: string;
      tomorrow_plan?: string;
      blocker?: string;
    } = {};

    if (body.date) updateData.date = new Date(body.date);
    if (body.name) updateData.name = body.name.trim();
    if (body.email) {
      if (role === "EMPLOYEE") {
        // Enforce employee's own email
        updateData.email = userEmail || undefined;
      } else {
        if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(body.email)) {
          return NextResponse.json(
            { success: false, error: "Format email tidak valid" } satisfies ApiResponse<never>,
            { status: 400 }
          );
        }
        updateData.email = body.email.trim().toLowerCase();
      }
    }
    if (body.today_work) updateData.today_work = body.today_work.trim();
    if (body.tomorrow_plan) updateData.tomorrow_plan = body.tomorrow_plan.trim();
    if (body.blocker) updateData.blocker = body.blocker.trim();

    const updated = await prisma.dailyReport.update({ where: { id }, data: updateData });

    return NextResponse.json({
      success: true,
      data: toApiReport(updated),
    } satisfies ApiResponse<DailyReportType>);
  } catch (error) {
    console.error("[PUT /api/reports/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui laporan" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id]
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.dailyReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const role = _request.headers.get("x-user-role");
    const userEmail = _request.headers.get("x-user-email");
    if (role === "EMPLOYEE" && existing.email !== userEmail) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" } satisfies ApiResponse<never>,
        { status: 403 }
      );
    }

    await prisma.dailyReport.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null } satisfies ApiResponse<null>);
  } catch (error) {
    console.error("[DELETE /api/reports/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus laporan" } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
