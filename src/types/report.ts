export interface DailyReport {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  name: string;
  email: string;
  today_work: string;
  tomorrow_plan: string;
  blocker: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportInput {
  date: string;
  name: string;
  email: string;
  today_work: string;
  tomorrow_plan: string;
  blocker: string;
}

export interface UpdateReportInput extends Partial<CreateReportInput> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  totalReports: number;
  todayReports: number;
  activeBlockers: number;
}
