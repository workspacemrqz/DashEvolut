import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 25000 },
  { month: "Fev", revenue: 28000 },
  { month: "Mar", revenue: 32000 },
  { month: "Abr", revenue: 35000 },
  { month: "Mai", revenue: 38000 },
  { month: "Jun", revenue: 42000 },
  { month: "Jul", revenue: 45000 },
  { month: "Ago", revenue: 41000 },
  { month: "Set", revenue: 44000 },
  { month: "Out", revenue: 47000 },
  { month: "Nov", revenue: 49000 },
  { month: "Dez", revenue: 45890 },
];

interface RevenueChartProps {
  "data-testid"?: string;
}

export default function RevenueChart({ "data-testid": testId }: RevenueChartProps) {
  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Receita Mensal</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Comparado ao mês anterior</span>
          <span className="text-sm text-green-500">+15.2%</span>
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
