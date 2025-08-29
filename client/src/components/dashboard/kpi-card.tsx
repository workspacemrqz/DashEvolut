import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  trend: "up" | "down" | "warning";
  "data-testid"?: string;
}

export default function KpiCard({ title, value, change, icon, trend, "data-testid": testId }: KpiCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-green-500"; // Down can be good (like churn rate)
      case "warning":
        return "text-yellow-500";
      default:
        return "text-text-secondary";
    }
  };

  return (
    <div className="kpi-card rounded-xl p-6" data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">
          {title}
        </h3>
        <div className="gradient-bg w-12 h-12 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-text-primary" data-testid={`${testId}-value`}>
          {value}
        </span>
      </div>
      <div className="flex items-center text-sm">
        <span className={`${getTrendColor()} mr-2`} data-testid={`${testId}-change`}>
          {change}
        </span>
        <span className="text-text-secondary">vs. mês anterior</span>
      </div>
    </div>
  );
}
