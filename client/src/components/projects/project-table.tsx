import { ProjectWithClient } from "@shared/schema";
import { Eye, Edit, Clock, MoreHorizontal, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectDetails from "@/components/projects/project-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProjectTableProps {
  projects: ProjectWithClient[];
  isLoading: boolean;
  onEditProject?: (project: ProjectWithClient) => void;
  "data-testid"?: string;
}

const statusMap = {
  discovery: { label: "Discovery", className: "status-discovery" },
  development: { label: "Desenvolvimento", className: "status-development" },
  delivery: { label: "Entrega", className: "status-delivery" },
  post_sale: { label: "Pós-venda", className: "status-post-sale" },
  completed: { label: "Concluído", className: "status-active" },
  cancelled: { label: "Cancelado", className: "status-inactive" },
};

export default function ProjectTable({ projects, isLoading, onEditProject, "data-testid": testId }: ProjectTableProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackedHours, setTrackedHours] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: string; workedHours: number }) =>
      apiRequest(`/api/projects/${data.id}`, 'PATCH', { workedHours: data.workedHours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Horas atualizadas",
        description: "As horas trabalhadas foram registradas com sucesso.",
      });
    },
  });

  const handleViewProject = (project: ProjectWithClient) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleEditProject = (project: ProjectWithClient) => {
    if (onEditProject) {
      onEditProject(project);
    } else {
      toast({
        title: "Em desenvolvimento",
        description: "A funcionalidade de edição será implementada em breve.",
      });
    }
  };

  const handleTimeTracker = (project: ProjectWithClient) => {
    setSelectedProject(project);
    setTrackedHours(project.workedHours || 0);
    setShowTimeTracker(true);
  };

  const handleStartStopTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      toast({
        title: "Controle de tempo iniciado",
        description: "O tempo está sendo contabilizado para este projeto.",
      });
    } else {
      toast({
        title: "Controle de tempo pausado",
        description: "O tempo foi pausado para este projeto.",
      });
    }
  };

  const handleSaveHours = () => {
    if (selectedProject) {
      updateProjectMutation.mutate({
        id: selectedProject.id,
        workedHours: trackedHours,
      });
      setShowTimeTracker(false);
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="container-bg rounded-xl border border-border-secondary overflow-hidden" data-testid={testId}>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border-secondary rounded w-1/3"></div>
                  <div className="h-3 bg-border-secondary rounded w-1/4"></div>
                </div>
                <div className="w-20 h-6 bg-border-secondary rounded"></div>
                <div className="w-16 h-4 bg-border-secondary rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-bg rounded-xl border border-border-secondary overflow-hidden" data-testid={testId}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border-secondary">
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Projeto</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Status</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden md:table-cell">Cliente</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Progresso</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden lg:table-cell">Margem</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Valor</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden md:table-cell">Prazo</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border-secondary">
                <td className="p-2 lg:p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary text-sm lg:text-base truncate" data-testid={`project-name-${project.id}`}>
                      {project.name}
                    </p>
                    <p className="text-xs lg:text-sm text-text-secondary line-clamp-2 lg:line-clamp-1" data-testid={`project-description-${project.id}`}>
                      {project.description}
                    </p>
                  </div>
                </td>
                <td className="p-2 lg:p-4">
                  <Badge 
                    className="inline-flex items-center rounded-full border px-2 lg:px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary status-badge status-development text-[#060606]"
                    data-testid={`project-status-${project.id}`}
                  >
                    <span className="lg:hidden">{statusMap[project.status].label.slice(0, 4)}</span>
                    <span className="hidden lg:inline">{statusMap[project.status].label}</span>
                  </Badge>
                </td>
                <td className="p-2 lg:p-4 text-text-secondary text-sm lg:text-base hidden md:table-cell truncate" data-testid={`project-client-${project.id}`}>
                  {project.client.name}
                </td>
                <td className="p-2 lg:p-4">
                  <div className="w-full min-w-[80px]">
                    <div className="flex justify-between text-xs lg:text-sm mb-1">
                      <span className="text-text-secondary" data-testid={`project-progress-${project.id}`}>
                        {project.progress}%
                      </span>
                    </div>
                    <div className="progress-bar h-2 rounded-full overflow-hidden">
                      <div 
                        className="progress-fill h-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-2 lg:p-4 hidden lg:table-cell">
                  <span 
                    className={`font-semibold text-sm ${(project.profitMargin || 0) >= 60 ? 'text-green-500' : (project.profitMargin || 0) >= 40 ? 'text-yellow-500' : 'text-red-500'}`}
                    data-testid={`project-margin-${project.id}`}
                  >
                    {(project.profitMargin || 0).toFixed(0)}%
                  </span>
                </td>
                <td className="p-2 lg:p-4 text-text-primary text-sm lg:text-base" data-testid={`project-value-${project.id}`}>
                  <span className="lg:hidden">R$ {Math.round(project.value / 1000)}k</span>
                  <span className="hidden lg:inline">R$ {project.value.toLocaleString('pt-BR')}</span>
                </td>
                <td className="p-2 lg:p-4 hidden md:table-cell">
                  <span 
                    className={`text-xs lg:text-sm ${isOverdue(project.dueDate) ? 'text-red-500' : 'text-text-secondary'}`}
                    data-testid={`project-due-date-${project.id}`}
                  >
                    {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </td>
                <td className="p-2 lg:p-4">
                  <div className="flex space-x-1 lg:space-x-2">
                    <button 
                      onClick={() => handleViewProject(project)}
                      className="text-blue-500 p-1"
                      data-testid={`action-view-${project.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditProject(project)}
                      className="text-green-500 p-1 hidden sm:block"
                      data-testid={`action-edit-${project.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleTimeTracker(project)}
                      className="text-yellow-500 p-1 hidden sm:block"
                      data-testid={`action-time-${project.id}`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetails 
          open={showProjectDetails} 
          onOpenChange={setShowProjectDetails}
          project={selectedProject}
          onEdit={() => {
            setShowProjectDetails(false);
            handleEditProject(selectedProject);
          }}
        />
      )}
      {/* Time Tracker Modal */}
      <Dialog open={showTimeTracker} onOpenChange={setShowTimeTracker}>
        <DialogContent className="bg-bg-container border-border-secondary max-w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Controle de Tempo</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Registre as horas trabalhadas no projeto
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Projeto</label>
                <p className="text-text-primary break-words">{selectedProject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-2 block" data-testid="label-worked-hours">Horas Trabalhadas</label>
                <Input
                  type="number"
                  value={trackedHours}
                  onChange={(e) => setTrackedHours(parseFloat(e.target.value) || 0)}
                  className="bg-bg-secondary border-border-secondary text-text-primary"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={handleStartStopTracking}
                  variant={isTracking ? "destructive" : "default"}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  data-testid={isTracking ? "button-pause" : "button-start"}
                >
                  {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isTracking ? "Pausar" : "Iniciar"}
                </Button>
                <Button
                  onClick={handleSaveHours}
                  disabled={updateProjectMutation.isPending}
                  className="btn-primary w-full sm:w-auto"
                >
                  {updateProjectMutation.isPending ? "Salvando..." : "Salvar Horas"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
