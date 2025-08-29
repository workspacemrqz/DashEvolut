import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithClient } from "@shared/schema";
import { useLocation } from "wouter";

interface PipelineChartProps {
  "data-testid"?: string;
}

export default function PipelineChart({ "data-testid": testId }: PipelineChartProps) {
  const [, setLocation] = useLocation();
  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  // Generate pipeline data from projects
  const generatePipelineData = () => {
    const statusMapping = {
      discovery: { name: "Discovery", color: "#9333ea" },
      development: { name: "Desenvolvimento", color: "#387DF3" },
      delivery: { name: "Entrega", color: "#22c55e" },
      post_sale: { name: "Pós-venda", color: "#f59e0b" },
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

  const handleViewDetails = () => {
    setLocation("/projects");
  };

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Pipeline de Projetos</h3>
        <button 
          className="btn-secondary px-3 py-1 rounded-lg text-xs"
          onClick={handleViewDetails}
          data-testid="btn-pipeline-details"
        >
          Ver Detalhes
        </button>
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
                  color: "#FFFFFF"
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
