import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ProjectTable from "@/components/projects/project-table";
import ProjectForm from "@/components/projects/project-form";
import MilestonesSection from "@/components/projects/milestones-section";
import { ProjectWithClient } from "@shared/schema";
import { Plus, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const { data: projects, isLoading } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  const { data: milestones } = useQuery({
    queryKey: ["/api/milestones"],
  });

  const filteredProjects = projects?.filter(project => {
    if (filter === "all") return true;
    if (filter === "discovery" || filter === "development" || filter === "delivery" || filter === "post_sale") {
      return project.status === filter;
    }
    // Filter by value
    if (filter === "high-value") return project.value > 20000;
    if (filter === "medium-value") return project.value >= 10000 && project.value <= 20000;
    if (filter === "low-value") return project.value < 10000;
    // Filter by urgency
    if (filter === "urgent") {
      const dueDate = new Date(project.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    }
    if (filter === "overdue") {
      const dueDate = new Date(project.dueDate);
      const today = new Date();
      return dueDate < today;
    }
    return true;
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
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  data-testid="button-filter"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-bg-container border-border-secondary">
                <DropdownMenuLabel className="text-text-primary">Filtrar por valor</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("high-value")} className="text-text-secondary hover:text-text-primary">
                  Alto valor (&gt;R$ 20k)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("medium-value")} className="text-text-secondary hover:text-text-primary">
                  Médio valor (R$ 10k-20k)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("low-value")} className="text-text-secondary hover:text-text-primary">
                  Baixo valor (&lt;R$ 10k)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-text-primary">Filtrar por urgência</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilter("urgent")} className="text-text-secondary hover:text-text-primary">
                  Urgente (vence em 7 dias)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("overdue")} className="text-text-secondary hover:text-text-primary">
                  Atrasado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => setShowProjectForm(true)}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              data-testid="button-new-project"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
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

        {/* Project Form Modal */}
        <ProjectForm 
          open={showProjectForm} 
          onOpenChange={setShowProjectForm}
        />
      </main>
    </div>
  );
}
