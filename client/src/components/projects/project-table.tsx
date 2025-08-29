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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProjectTableProps {
  projects: ProjectWithClient[];
  isLoading: boolean;
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

export default function ProjectTable({ projects, isLoading, "data-testid": testId }: ProjectTableProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackedHours, setTrackedHours] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: string; workedHours: number }) =>
      apiRequest(`/api/projects/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ workedHours: data.workedHours }),
      }),
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
    // TODO: Implementar edição de projeto
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de edição será implementada em breve.",
    });
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-secondary">
              <th className="text-left p-4 font-semibold text-text-primary">Projeto</th>
              <th className="text-left p-4 font-semibold text-text-primary">Status</th>
              <th className="text-left p-4 font-semibold text-text-primary">Cliente</th>
              <th className="text-left p-4 font-semibold text-text-primary">Progresso</th>
              <th className="text-left p-4 font-semibold text-text-primary">Margem</th>
              <th className="text-left p-4 font-semibold text-text-primary">Valor</th>
              <th className="text-left p-4 font-semibold text-text-primary">Prazo</th>
              <th className="text-left p-4 font-semibold text-text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border-secondary">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-text-primary" data-testid={`project-name-${project.id}`}>
                      {project.name}
                    </p>
                    <p className="text-sm text-text-secondary" data-testid={`project-description-${project.id}`}>
                      {project.description}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge 
                    className={`status-badge ${statusMap[project.status].className}`}
                    data-testid={`project-status-${project.id}`}
                  >
                    {statusMap[project.status].label}
                  </Badge>
                </td>
                <td className="p-4 text-text-secondary" data-testid={`project-client-${project.id}`}>
                  {project.client.name}
                </td>
                <td className="p-4">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
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
                <td className="p-4">
                  <span 
                    className={`font-semibold ${project.profitMargin >= 60 ? 'text-green-500' : project.profitMargin >= 40 ? 'text-yellow-500' : 'text-red-500'}`}
                    data-testid={`project-margin-${project.id}`}
                  >
                    {project.profitMargin.toFixed(0)}%
                  </span>
                </td>
                <td className="p-4 text-text-primary" data-testid={`project-value-${project.id}`}>
                  R$ {project.value.toLocaleString('pt-BR')}
                </td>
                <td className="p-4">
                  <span 
                    className={isOverdue(project.dueDate) ? 'text-red-500' : 'text-text-secondary'}
                    data-testid={`project-due-date-${project.id}`}
                  >
                    {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewProject(project)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      data-testid={`action-view-${project.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditProject(project)}
                      className="text-green-500 hover:text-green-400 p-1"
                      data-testid={`action-edit-${project.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleTimeTracker(project)}
                      className="text-yellow-500 hover:text-yellow-400 p-1"
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
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="bg-bg-container border-border-secondary max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Detalhes do Projeto</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Informações completas sobre o projeto
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Nome</label>
                  <p className="text-text-primary">{selectedProject.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Cliente</label>
                  <p className="text-text-primary">{selectedProject.client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Status</label>
                  <Badge className={`status-badge ${statusMap[selectedProject.status].className}`}>
                    {statusMap[selectedProject.status].label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Valor</label>
                  <p className="text-text-primary">R$ {selectedProject.value.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Progresso</label>
                  <p className="text-text-primary">{selectedProject.progress}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Margem de Lucro</label>
                  <p className="text-text-primary">{selectedProject.profitMargin.toFixed(0)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Horas Trabalhadas</label>
                  <p className="text-text-primary">{selectedProject.workedHours || 0}h</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Prazo</label>
                  <p className="text-text-primary">{new Date(selectedProject.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Descrição</label>
                <p className="text-text-primary">{selectedProject.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Time Tracker Modal */}
      <Dialog open={showTimeTracker} onOpenChange={setShowTimeTracker}>
        <DialogContent className="bg-bg-container border-border-secondary">
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
                <p className="text-text-primary">{selectedProject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-2 block">Horas Trabalhadas</label>
                <Input
                  type="number"
                  value={trackedHours}
                  onChange={(e) => setTrackedHours(parseFloat(e.target.value) || 0)}
                  className="bg-bg-secondary border-border-secondary text-text-primary"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleStartStopTracking}
                  variant={isTracking ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isTracking ? "Pausar" : "Iniciar"}
                </Button>
                <Button
                  onClick={handleSaveHours}
                  disabled={updateProjectMutation.isPending}
                  className="btn-primary"
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
