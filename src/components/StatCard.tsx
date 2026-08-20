import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    card: "bg-white border border-slate-200",
    iconWrapper: "text-slate-400",
    value: "text-slate-900",
  },
  success: {
    card: "bg-white border border-slate-200",
    iconWrapper: "text-blue-500",
    value: "text-blue-600",
  },
  warning: {
    card: "bg-white border border-slate-200",
    iconWrapper: "text-amber-500",
    value: "text-amber-600",
  },
  danger: {
    card: "bg-white border border-slate-200",
    iconWrapper: "text-red-500",
    value: "text-red-600",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("rounded-xl p-5 shadow-sm", styles.card)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <Icon className={cn("w-5 h-5", styles.iconWrapper)} />
      </div>
      <p className={cn("text-4xl font-bold tracking-tight", styles.value)}>
        {value}
      </p>
    </div>
  );
}
