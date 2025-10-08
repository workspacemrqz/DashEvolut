import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ClientWithStats } from "@shared/schema";

interface ClientFunnelChartProps {
  "data-testid"?: string;
}

export default function ClientFunnelChart({ "data-testid": testId }: ClientFunnelChartProps) {
  const { data: clients } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clientes"],
  });

  const generateFunnelData = () => {
    if (!clients) return [];

    const totalClients = clients.length;
    const prospects = clients.filter(c => !c.hasActiveSubscription).length;
    const activeClients = clients.filter(c => c.hasActiveSubscription).length;

    return [
      { stage: "Total", count: totalClients, percentage: 100, color: "#6366f1" },
      { stage: "Prospects", count: prospects, percentage: totalClients > 0 ? (prospects / totalClients * 100) : 0, color: "#f59e0b" },
      { stage: "Ativos", count: activeClients, percentage: totalClients > 0 ? (activeClients / totalClients * 100) : 0, color: "#22c55e" },
      { stage: "Inativos", count: inactiveClients, percentage: totalClients > 0 ? (inactiveClients / totalClients * 100) : 0, color: "#ef4444" },
    ];
  };

  const data = generateFunnelData();
  const conversionRate = data.length > 2 && data[0].count > 0 
    ? ((data[2].count / data[0].count) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Funil de Clientes</h3>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Taxa de Conversão</div>
          <div className="text-xl font-bold text-green-500">{conversionRate}%</div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
            <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
            <YAxis 
              dataKey="stage" 
              type="category" 
              stroke="var(--text-secondary)" 
              fontSize={12}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--bg-container)",
                border: "1px solid var(--border-secondary)",
                borderRadius: "8px",
                color: "var(--text-primary)"
              }}
              formatter={(value, name, props) => [
                `${value} (${props.payload.percentage.toFixed(1)}%)`,
                "Clientes"
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
