import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/header";
import ProjectTable from "@/components/projects/project-table";
import ProjectForm from "@/components/projects/project-form";
import ProjectDetails from "@/components/projects/project-details";
import { ProjectCostsForm } from "@/components/projects/project-costs-form";
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
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showProjectCosts, setShowProjectCosts] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<ProjectWithClient | null>(null);
  const [selectedProjectForView, setSelectedProjectForView] = useState<ProjectWithClient | null>(null);
  const [selectedProjectForCosts, setSelectedProjectForCosts] = useState<ProjectWithClient | null>(null);
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const [, navigate] = useLocation();
  
  const { data: projects, isLoading } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projetos"],
  });

  // Fetch specific project if projectId is in URL
  const { data: specificProject } = useQuery<ProjectWithClient>({
    queryKey: [`/api/projetos/${projectId}`],
    enabled: !!projectId,
  });

  // Open project details modal when projectId is in URL
  useEffect(() => {
    if (projectId && specificProject && projects) {
      const project = projects.find(p => p.id === projectId) || specificProject;
      if (project) {
        setSelectedProjectForView(project);
        setShowProjectDetails(true);
      }
    }
  }, [projectId, specificProject, projects]);


  const filteredProjects = projects?.filter(project => {
    if (filter === "all") return true;
    if (filter === "discovery" || filter === "development" || filter === "delivery" || filter === "post_sale" || filter === "completed" || filter === "cancelled") {
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
  const totalRevenue = projects?.reduce((sum, p) => sum + p.value, 0) || 0;
  
  // Handle costs for project
  const handleCostsProject = (project: ProjectWithClient) => {
    setSelectedProjectForCosts(project);
    setShowProjectCosts(true);
    console.log("Opening costs for project:", project.name);
  };
  
  // Calculate forecast accuracy (mock calculation)


  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Gestão de Projetos" 
        subtitle="Controle financeiro e operacional"
        actions={
          <div className="flex space-x-2 lg:space-x-3 flex-wrap gap-2">
            <Button 
              onClick={() => setShowProjectForm(true)}
              className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              data-testid="button-new-project"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Projeto</span>
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-3 lg:p-6 overflow-auto">
        {/* Project KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-6">
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Faturamento</h3>
            <div className="text-2xl font-bold text-text-primary" data-testid="kpi-revenue">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-text-secondary">Total dos projetos</p>
          </div>

          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Projetos Ativos</h3>
            <div className="text-2xl font-bold text-blue-500 mb-1" data-testid="kpi-active-projects">
              {projects?.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length || 0}
            </div>
            <p className="text-sm text-text-secondary">Em andamento</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 lg:space-x-4 mb-4 lg:mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Todos" },
            { key: "discovery", label: "Discovery" },
            { key: "development", label: "Desenvolvimento" },
            { key: "delivery", label: "Entrega" },
            { key: "post_sale", label: "Pós-venda" },
            { key: "completed", label: "Concluído" },
            { key: "cancelled", label: "Cancelado" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                filter === tab.key 
                  ? 'btn-primary' 
                  : 'btn-secondary'
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
            onEditProject={(project) => {
              setSelectedProjectForEdit(project);
              setShowProjectForm(true);
            }}
            onCostsProject={handleCostsProject}
            data-testid="table-projects"
          />
        </div>


        {/* Project Form Modal */}
        <ProjectForm 
          open={showProjectForm} 
          onOpenChange={(open) => {
            setShowProjectForm(open);
            if (!open) {
              setSelectedProjectForEdit(null);
              // If we came from a direct project URL, navigate back to projects list
              if (projectId) {
                navigate('/projetos');
              }
            }
          }}
          project={selectedProjectForEdit}
        />

        {/* Project Details Modal */}
        {selectedProjectForView && (
          <ProjectDetails 
            open={showProjectDetails} 
            onOpenChange={(open) => {
              setShowProjectDetails(open);
              if (!open) {
                setSelectedProjectForView(null);
                // If we came from a direct project URL, navigate back to projects list
                if (projectId) {
                  navigate('/projetos');
                }
              }
            }}
            project={selectedProjectForView}
            onEdit={() => {
              setSelectedProjectForEdit(selectedProjectForView);
              setShowProjectDetails(false);
              setShowProjectForm(true);
            }}
          />
        )}

        {/* Project Costs Modal */}
        {selectedProjectForCosts && (
          <ProjectCostsForm
            isOpen={showProjectCosts}
            onOpenChange={(open) => {
              setShowProjectCosts(open);
              if (!open) {
                setSelectedProjectForCosts(null);
              }
            }}
            projectId={selectedProjectForCosts.id}
            projectName={selectedProjectForCosts.name}
          />
        )}
      </main>
    </div>
  );
}
