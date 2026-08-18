import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    card: "bg-white border border-slate-200",
    iconWrapper: "bg-blue-50",
    icon: "text-blue-600",
    value: "text-slate-900",
    title: "text-slate-500",
  },
  success: {
    card: "bg-white border border-slate-200",
    iconWrapper: "bg-emerald-50",
    icon: "text-emerald-600",
    value: "text-slate-900",
    title: "text-slate-500",
  },
  warning: {
    card: "bg-white border border-slate-200",
    iconWrapper: "bg-amber-50",
    icon: "text-amber-600",
    value: "text-slate-900",
    title: "text-slate-500",
  },
  danger: {
    card: "bg-white border border-slate-200",
    iconWrapper: "bg-red-50",
    icon: "text-red-600",
    value: "text-slate-900",
    title: "text-slate-500",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("rounded-xl p-5 shadow-sm", styles.card)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium mb-1", styles.title)}>{title}</p>
          <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", styles.iconWrapper)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
      </div>
    </div>
  );
}
