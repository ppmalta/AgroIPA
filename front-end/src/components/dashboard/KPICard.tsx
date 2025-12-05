import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "info";
}

export const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  variant = "default" 
}: KPICardProps) => {
  const variantClasses = {
    default: "bg-card",
    success: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
    warning: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    info: "bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200",
  };

  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn(
      "kpi-card flex flex-col",
      variantClasses[variant]
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "p-2 rounded-lg",
              variant === "success" && "bg-emerald-200/50 text-emerald-700",
              variant === "warning" && "bg-amber-200/50 text-amber-700",
              variant === "info" && "bg-sky-200/50 text-sky-700",
              variant === "default" && "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className={cn(
          "text-3xl font-bold",
          variant === "success" && "text-emerald-700",
          variant === "warning" && "text-amber-700",
          variant === "info" && "text-sky-700",
          variant === "default" && "text-card-foreground"
        )}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground mt-2">{trend.label}</p>
        )}
      </div>
    </div>
  );
};
