import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ProjectTable from "@/components/projects/project-table";
import MilestonesSection from "@/components/projects/milestones-section";
import { ProjectWithClient } from "@shared/schema";
import { Plus, Filter } from "lucide-react";

export default function Projects() {
  const [filter, setFilter] = useState("all");
  
  const { data: projects, isLoading } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  const { data: milestones } = useQuery({
    queryKey: ["/api/milestones"],
  });

  const filteredProjects = projects?.filter(project => {
    if (filter === "all") return true;
    return project.status === filter;
  }) || [];

  // Calculate KPIs
  const avgProfitMargin = projects?.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / (projects?.length || 1);
  const totalWorkedHours = projects?.reduce((sum, p) => sum + (p.workedHours || 0), 0) || 0;
  const totalRevenue = projects?.reduce((sum, p) => sum + p.value, 0) || 0;
  
  // Calculate forecast accuracy (mock calculation)
  const forecastAccuracy = 92;

  // Get upcoming milestones
  const upcomingMilestones = milestones?.filter((m: any) => !m.isCompleted)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5) || [];

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Gestão de Projetos" 
        subtitle="Controle financeiro e operacional"
        actions={
          <div className="flex space-x-3">
            <button 
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              data-testid="button-filter"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button 
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              data-testid="button-new-project"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Project KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Margem de Lucro</h3>
            <div className="text-2xl font-bold text-green-500 mb-1" data-testid="kpi-profit-margin">
              {avgProfitMargin.toFixed(1)}%
            </div>
            <p className="text-sm text-text-secondary">Média geral</p>
          </div>
          
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Horas Trabalhadas</h3>
            <div className="text-2xl font-bold text-text-primary" data-testid="kpi-worked-hours">
              {totalWorkedHours.toLocaleString()}h
            </div>
            <p className="text-sm text-text-secondary">Este mês</p>
          </div>
          
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Previsão vs Real</h3>
            <div className="text-2xl font-bold text-yellow-500 mb-1" data-testid="kpi-forecast-accuracy">
              {forecastAccuracy}%
            </div>
            <p className="text-sm text-text-secondary">Precisão</p>
          </div>

          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Faturamento</h3>
            <div className="text-2xl font-bold text-text-primary" data-testid="kpi-revenue">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-text-secondary">Total dos projetos</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: "all", label: "Todos" },
            { key: "discovery", label: "Discovery" },
            { key: "development", label: "Desenvolvimento" },
            { key: "delivery", label: "Entrega" },
            { key: "post_sale", label: "Pós-venda" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key 
                  ? "btn-primary" 
                  : "btn-secondary"
              }`}
              data-testid={`filter-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects Table */}
        <div className="mb-8">
          <ProjectTable 
            projects={filteredProjects} 
            isLoading={isLoading}
            data-testid="table-projects"
          />
        </div>

        {/* Milestones Section */}
        <MilestonesSection 
          milestones={upcomingMilestones}
          data-testid="section-milestones"
        />
      </main>
    </div>
  );
}
