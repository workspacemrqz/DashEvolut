import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithClient } from "@shared/schema";

interface ProjectTimelineChartProps {
  "data-testid"?: string;
}

export default function ProjectTimelineChart({ "data-testid": testId }: ProjectTimelineChartProps) {
  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projetos"],
  });

  const generateTimelineData = () => {
    if (!projects) return [];

    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    return months.map((month, index) => {
      const projectsInMonth = projects.filter(project => {
        const projectDate = new Date(project.startDate);
        return projectDate.getMonth() === index && projectDate.getFullYear() === currentYear;
      });

      const totalValue = projectsInMonth.reduce((sum, project) => sum + project.value, 0);
      const completedProjects = projectsInMonth.filter(p => p.status === "completed" || p.status === "post_sale").length;
      const activeProjects = projectsInMonth.filter(p => p.status !== "completed" && p.status !== "cancelled").length;

      return {
        month,
        totalValue,
        completedProjects,
        activeProjects,
        totalProjects: projectsInMonth.length
      };
    });
  };

  const data = generateTimelineData();
  const totalYearValue = data.reduce((sum, d) => sum + d.totalValue, 0);
  const totalYearProjects = data.reduce((sum, d) => sum + d.totalProjects, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#22c55e";
      case "active": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Timeline de Projetos 2024</h3>
          <p className="text-sm text-text-secondary">Distribuição mensal de projetos e valores</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Total do Ano</div>
          <div className="text-xl font-bold text-text-primary">
            R$ {totalYearValue.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-text-secondary">{totalYearProjects} projetos</div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-secondary)" 
              fontSize={12}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              fontSize={12}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--bg-container)",
                border: "1px solid var(--border-secondary)",
                borderRadius: "8px",
                color: "var(--text-primary)"
              }}
              formatter={(value, name) => {
                if (name === "totalValue") {
                  return [`R$ ${value.toLocaleString('pt-BR')}`, "Valor Total"];
                }
                return [value, name === "completedProjects" ? "Concluídos" : "Ativos"];
              }}
            />
            <Bar 
              dataKey="totalValue" 
              fill="var(--gradient-start)" 
              radius={[4, 4, 0, 0]}
              name="totalValue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Project Status Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {data.reduce((sum, d) => sum + d.completedProjects, 0)}
          </div>
          <div className="text-sm text-text-secondary">Concluídos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {data.reduce((sum, d) => sum + d.activeProjects, 0)}
          </div>
          <div className="text-sm text-text-secondary">Ativos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">
            {totalYearProjects}
          </div>
          <div className="text-sm text-text-secondary">Total</div>
        </div>
      </div>
    </div>
  );
}
