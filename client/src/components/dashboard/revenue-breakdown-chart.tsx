import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithClient } from "@shared/schema";
import { SubscriptionWithClient } from "@shared/schema";

interface RevenueBreakdownChartProps {
  "data-testid"?: string;
}

export default function RevenueBreakdownChart({ "data-testid": testId }: RevenueBreakdownChartProps) {
  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  const { data: subscriptions } = useQuery<SubscriptionWithClient[]>({
    queryKey: ["/api/subscriptions"],
  });

  const generateRevenueData = () => {
    if (!projects || !subscriptions) return { pieData: [], barData: [] };

    // Calculate project revenue by status
    const projectRevenue = projects.reduce((acc, project) => {
      const status = project.status;
      acc[status] = (acc[status] || 0) + project.value;
      return acc;
    }, {} as Record<string, number>);

    // Calculate subscription revenue
    const activeSubscriptions = subscriptions.filter(s => s.status === "active");
    const monthlySubscriptionRevenue = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
    const annualSubscriptionRevenue = monthlySubscriptionRevenue * 12;

    // Pie chart data
    const pieData = [
      { name: "Projetos", value: Object.values(projectRevenue).reduce((sum, val) => sum + val, 0), color: "#3b82f6" },
      { name: "Assinaturas (Anual)", value: annualSubscriptionRevenue, color: "#22c55e" },
    ].filter(item => item.value > 0);

    // Bar chart data - project revenue by status
    const barData = Object.entries(projectRevenue).map(([status, value]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value,
      color: getStatusColor(status)
    }));

    return { pieData, barData, monthlySubscriptionRevenue };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "discovery": return "#9333ea";
      case "development": return "#3b82f6";
      case "delivery": return "#22c55e";
      case "post_sale": return "#f59e0b";
      case "completed": return "#10b981";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const { pieData, barData, monthlySubscriptionRevenue } = generateRevenueData();
  const totalProjectRevenue = barData.reduce((sum, item) => sum + item.value, 0);
  const totalRevenue = totalProjectRevenue + (monthlySubscriptionRevenue * 12);

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Breakdown de Receita</h3>
        <p className="text-sm text-text-secondary">Distribuição entre projetos e assinaturas</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Revenue Sources */}
        <div>
          <h4 className="text-md font-medium text-text-primary mb-4">Fontes de Receita</h4>
          <div className="h-48">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "var(--bg-container)",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "8px",
                      color: "var(--text-primary)"
                    }}
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, "Receita"]}
                  />
                  <Legend 
                    wrapperStyle={{
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      paddingTop: "10px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-secondary">Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Project Revenue by Status */}
        <div>
          <h4 className="text-md font-medium text-text-primary mb-4">Receita por Status de Projeto</h4>
          <div className="h-48">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                  <XAxis 
                    dataKey="status" 
                    stroke="var(--text-secondary)" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)" 
                    fontSize={10}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "var(--bg-container)",
                      border: "1px solid var(--border-secondary)",
                      borderRadius: "8px",
                      color: "var(--text-primary)"
                    }}
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, "Receita"]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-secondary">Nenhum projeto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border-secondary">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-500">
            R$ {totalProjectRevenue.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-text-secondary">Projetos</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-500">
            R$ {(monthlySubscriptionRevenue * 12).toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-text-secondary">Assinaturas (Anual)</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-text-primary">
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-text-secondary">Total</div>
        </div>
      </div>
    </div>
  );
}
