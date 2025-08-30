import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithClient } from "@shared/schema";


interface PipelineChartProps {
  "data-testid"?: string;
}

export default function PipelineChart({ "data-testid": testId }: PipelineChartProps) {
  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  // Generate pipeline data from projects
  const generatePipelineData = () => {
    const statusMapping = {
      discovery: { name: "Discovery", color: "hsl(var(--chart-5))" },
      development: { name: "Desenvolvimento", color: "hsl(var(--chart-1))" },
      delivery: { name: "Entrega", color: "hsl(var(--chart-2))" },
      post_sale: { name: "Pós-venda", color: "hsl(var(--chart-3))" },
    };

    const counts = projects?.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return Object.entries(statusMapping).map(([status, config]) => ({
      name: config.name,
      value: counts[status] || 0,
      color: config.color,
    })).filter(item => item.value > 0);
  };

  const data = generatePipelineData();

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Pipeline de Projetos</h3>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">Nenhum projeto encontrado</p>
          </div>
        ) : (
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
                stroke="none"
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
                  color: "#FFFFFF "
                }}
                labelStyle={{
                  color: "#FFFFFF "
                }}
                itemStyle={{
                  color: "#FFFFFF "
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
        )}
      </div>
    </div>
  );
}
