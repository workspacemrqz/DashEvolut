import { ProjectWithClient } from "@shared/schema";
import { Eye, Edit, Clock, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
                      className="text-blue-500 hover:text-blue-400 p-1"
                      data-testid={`action-view-${project.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-green-500 hover:text-green-400 p-1"
                      data-testid={`action-edit-${project.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
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
    </div>
  );
}
