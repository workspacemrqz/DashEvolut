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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
      <Header 
        title="Gestão de Projetos" 
        subtitle="Controle financeiro e operacional"
        actions={
          <Button 
            onClick={() => setShowProjectForm(true)}
            className="btn-primary px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
            data-testid="button-new-project"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
          </Button>
        }
      />
      <main className="flex-1 p-3 lg:p-6 overflow-y-auto overflow-x-hidden">
        {/* Project KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-6 w-full">
          <div className="kpi-card rounded-xl p-4 sm:p-6 min-w-0">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Faturamento</h3>
            <div className="text-xl sm:text-2xl font-bold text-text-primary break-words" data-testid="kpi-revenue">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">Total dos projetos</p>
          </div>

          <div className="kpi-card rounded-xl p-4 sm:p-6 min-w-0">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Projetos Ativos</h3>
            <div className="text-xl sm:text-2xl font-bold text-blue-500 mb-1" data-testid="kpi-active-projects">
              {projects?.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length || 0}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">Em andamento</p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
              Status:
            </label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger 
                className="w-full sm:w-[200px] bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0 data-[state=open]:border-border/50"
                data-testid="filter-status"
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0">
                <SelectItem 
                  value="all" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-all"
                >
                  Todos
                </SelectItem>
                <SelectItem 
                  value="discovery" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-discovery"
                >
                  Discovery
                </SelectItem>
                <SelectItem 
                  value="development" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-development"
                >
                  Desenvolvimento
                </SelectItem>
                <SelectItem 
                  value="delivery" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-delivery"
                >
                  Entrega
                </SelectItem>
                <SelectItem 
                  value="post_sale" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-post_sale"
                >
                  Pós-venda
                </SelectItem>
                <SelectItem 
                  value="completed" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-completed"
                >
                  Concluído
                </SelectItem>
                <SelectItem 
                  value="cancelled" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-cancelled"
                >
                  Cancelado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
