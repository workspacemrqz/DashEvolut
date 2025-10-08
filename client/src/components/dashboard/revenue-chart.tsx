import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithClient } from "@shared/schema";

interface RevenueChartProps {
  "data-testid"?: string;
}

export default function RevenueChart({ "data-testid": testId }: RevenueChartProps) {
  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projetos"],
  });

  // Generate revenue data from projects
  const generateRevenueData = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    return months.map((month, index) => {
      if (index > currentMonth) {
        return { month, revenue: 0 };
      }
      
      // Calculate revenue based on completed projects
      const monthlyRevenue = projects?.filter(project => {
        if (project.status === "delivery" || project.status === "post_sale" || project.status === "completed") {
          const projectDate = new Date(project.startDate);
          return projectDate.getMonth() === index && projectDate.getFullYear() === currentDate.getFullYear();
        }
        return false;
      }).reduce((sum, project) => sum + project.value, 0) || 0;
      
      // Use only real project revenue, no fallback values
      return { month, revenue: monthlyRevenue };
    });
  };

  const data = generateRevenueData();
  const currentMonthRevenue = data[new Date().getMonth()]?.revenue || 0;
  const lastMonthRevenue = data[new Date().getMonth() - 1]?.revenue || 0;
  const growthPercentage = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : "0.0";

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Receita Mensal</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Comparado ao mês anterior</span>
          <span className={`text-sm ${Number(growthPercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(growthPercentage) >= 0 ? '+' : ''}{growthPercentage}%
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--bg-container)",
                border: "1px solid var(--border-secondary)",
                borderRadius: "8px",
                color: "var(--text-primary)"
              }}
              formatter={(value) => [`R$ ${value.toLocaleString()}`, "Receita"]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--gradient-start)" 
              strokeWidth={2}
              dot={{ fill: "var(--gradient-start)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
