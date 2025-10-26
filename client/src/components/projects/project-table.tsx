import { ProjectWithClient } from "@shared/schema";
import { Eye, Edit, Trash2, DollarSign, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectDetails from "@/components/projects/project-details";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";

interface ProjectTableProps {
  projects: ProjectWithClient[];
  isLoading: boolean;
  onEditProject?: (project: ProjectWithClient) => void;
  onCostsProject?: (project: ProjectWithClient) => void;
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

export default function ProjectTable({ projects, isLoading, onEditProject, onCostsProject, "data-testid": testId }: ProjectTableProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithClient | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();


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

  const handleCostsProject = (project: ProjectWithClient) => {
    if (onCostsProject) {
      onCostsProject(project);
    } else {
      toast({
        title: "Em desenvolvimento",
        description: "A funcionalidade de custos será implementada em breve.",
      });
    }
  };


  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => apiRequest('DELETE', `/api/projetos/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projetos'] });
      toast({
        title: "Projeto removido",
        description: "O projeto foi removido com sucesso.",
      });
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      // Extract message from error string (format: "400: {"message":"..."}")
      let errorMessage = "Não foi possível remover o projeto.";
      if (error.message) {
        try {
          const match = error.message.match(/\d+:\s*({.*})/);
          if (match) {
            const errorData = JSON.parse(match[1]);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          // If parsing fails, use the original message
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro ao remover projeto",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDeleteProject = (project: ProjectWithClient) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
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
      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        <div className="p-4 space-y-4">
          {projects.map((project) => {
            const projectOverdue = isOverdue(project.dueDate);
            
            return (
              <div 
                key={project.id} 
                className={`border border-border-secondary rounded-lg p-4 ${projectOverdue ? 'bg-red-50 dark:bg-red-950' : 'bg-bg-primary'}`}
              >
                {/* Header com Nome do Projeto */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate" data-testid={`project-name-${project.id}`}>
                      {project.name}
                    </p>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-1" data-testid={`project-description-${project.id}`}>
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button 
                      onClick={() => handleViewProject(project)}
                      className="text-blue-500 p-2"
                      data-testid={`action-view-${project.id}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="text-text-secondary p-2"
                          data-testid={`action-more-${project.id}`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#333] text-white">
                        <DropdownMenuItem onClick={() => handleCostsProject(project)}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Custos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProject(project)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Informações em Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Status</p>
                    <Badge 
                      className={`status-badge ${statusMap[project.status].className} text-xs`}
                      data-testid={`project-status-${project.id}`}
                    >
                      {statusMap[project.status].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Cliente</p>
                    <p className="text-sm font-medium text-text-primary truncate" data-testid={`project-client-${project.id}`}>
                      {project.client.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Valor</p>
                    <p className="font-semibold text-accent-primary text-sm" data-testid={`project-value-${project.id}`}>
                      R$ {project.value.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Prazo</p>
                    <p 
                      className={`text-sm font-medium ${projectOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}
                      data-testid={`project-due-date-${project.id}`}
                    >
                      {new Date(project.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-secondary">
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Projeto</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Status</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Cliente</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Valor</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Prazo</th>
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
                    className={`status-badge ${statusMap[project.status].className} text-xs`}
                    data-testid={`project-status-${project.id}`}
                  >
                    {statusMap[project.status].label}
                  </Badge>
                </td>
                <td className="p-2 lg:p-4 text-text-secondary text-sm lg:text-base truncate" data-testid={`project-client-${project.id}`}>
                  {project.client.name}
                </td>
                <td className="p-2 lg:p-4 text-text-primary text-sm lg:text-base" data-testid={`project-value-${project.id}`}>
                  R$ {project.value.toLocaleString('pt-BR')}
                </td>
                <td className="p-2 lg:p-4">
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
                      onClick={() => handleCostsProject(project)}
                      className="text-orange-500 p-1"
                      data-testid={`action-costs-${project.id}`}
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditProject(project)}
                      className="text-green-500 p-1"
                      data-testid={`action-edit-${project.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project)}
                      className="text-red-500 p-1"
                      data-testid={`action-delete-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteProject}
        title="Remover Projeto"
        itemName={projectToDelete?.name || ""}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}
