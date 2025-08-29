import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Discovery", value: 8, color: "#9333ea" },
  { name: "Desenvolvimento", value: 12, color: "#387DF3" },
  { name: "Entrega", value: 3, color: "#22c55e" },
  { name: "Pós-venda", value: 1, color: "#f59e0b" },
];

interface PipelineChartProps {
  "data-testid"?: string;
}

export default function PipelineChart({ "data-testid": testId }: PipelineChartProps) {
  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Pipeline de Projetos</h3>
        <button className="btn-secondary px-3 py-1 rounded-lg text-xs">
          Ver Detalhes
        </button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
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
              formatter={(value) => [value, "Projetos"]}
            />
            <Legend 
              wrapperStyle={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                paddingTop: "20px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
