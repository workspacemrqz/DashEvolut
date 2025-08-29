import { ProjectWithClient } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Clock, TrendingUp, User } from "lucide-react";

interface ProjectDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectWithClient;
  onEdit?: () => void;
}

export default function ProjectDetails({ open, onOpenChange, project, onEdit }: ProjectDetailsProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'discovery': return 'Discovery';
      case 'development': return 'Desenvolvimento';
      case 'delivery': return 'Entrega';
      case 'post_sale': return 'Pós-venda';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'discovery': return 'status-discovery';
      case 'development': return 'status-development';
      case 'delivery': return 'status-delivery';
      case 'post_sale': return 'status-post-sale';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-discovery';
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    return dueDate < today && project.status !== 'completed' && project.status !== 'cancelled';
  };

  const daysUntilDue = () => {
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] container-bg border-border-secondary max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Detalhes do Projeto</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Informações completas sobre o projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-text-primary mb-2" data-testid="project-name">
                {project.name}
              </h3>
              <p className="text-text-secondary text-sm mb-3" data-testid="project-description">
                {project.description}
              </p>
              <div className="flex items-center gap-3">
                <Badge className={`status-badge ${getStatusColor(project.status)}`} data-testid="project-status">
                  {getStatusLabel(project.status)}
                </Badge>
                {isOverdue() && (
                  <Badge className="status-badge status-overdue">
                    Atrasado
                  </Badge>
                )}
              </div>
            </div>
            {onEdit && (
              <Button 
                onClick={onEdit}
                className="btn-secondary"
                data-testid="button-edit-project"
              >
                Editar
              </Button>
            )}
          </div>

          {/* Client Info */}
          <div className="flex items-center p-4 rounded-lg bg-bg-secondary border border-border-secondary">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-text-primary" data-testid="client-name">
                {project.client?.name || 'Cliente não encontrado'}
              </p>
              <p className="text-sm text-text-secondary" data-testid="client-company">
                {project.client?.company || 'Empresa não informada'}
              </p>
            </div>
          </div>

          {/* Project Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="flex items-center mb-2">
                <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                <h4 className="font-semibold text-text-primary">Valor do Projeto</h4>
              </div>
              <p className="text-2xl font-bold text-green-500" data-testid="project-value">
                R$ {project.value.toLocaleString('pt-BR')}
              </p>
              {project.profitMargin && (
                <p className="text-sm text-text-secondary">
                  Margem: {project.profitMargin}%
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <h4 className="font-semibold text-text-primary">Progresso</h4>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-500" data-testid="project-progress">
                  {project.progress}%
                </p>
                <div className="w-full bg-border-secondary rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-text-secondary mr-2" />
                <h4 className="font-semibold text-text-primary">Data de Início</h4>
              </div>
              <p className="text-text-primary" data-testid="project-start-date">
                {new Date(project.startDate).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-text-secondary mr-2" />
                <h4 className="font-semibold text-text-primary">Data de Entrega</h4>
              </div>
              <p className={`font-medium ${isOverdue() ? 'text-red-500' : 'text-text-primary'}`} data-testid="project-due-date">
                {new Date(project.dueDate).toLocaleDateString('pt-BR')}
              </p>
              {!isOverdue() && daysUntilDue() >= 0 && (
                <p className="text-sm text-text-secondary">
                  {daysUntilDue() === 0 ? 'Hoje' : 
                   daysUntilDue() === 1 ? 'Amanhã' : 
                   `${daysUntilDue()} dias restantes`}
                </p>
              )}
              {isOverdue() && (
                <p className="text-sm text-red-500">
                  {Math.abs(daysUntilDue())} dias atrasado
                </p>
              )}
            </div>
          </div>

          {/* Hours Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-text-secondary mr-2" />
                <h4 className="font-semibold text-text-primary">Horas Estimadas</h4>
              </div>
              <p className="text-xl font-bold text-text-primary" data-testid="estimated-hours">
                {project.estimatedHours || 0}h
              </p>
            </div>

            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-text-secondary mr-2" />
                <h4 className="font-semibold text-text-primary">Horas Trabalhadas</h4>
              </div>
              <p className="text-xl font-bold text-text-primary" data-testid="worked-hours">
                {project.workedHours || 0}h
              </p>
              {project.estimatedHours && project.estimatedHours > 0 && (
                <p className="text-sm text-text-secondary">
                  {((project.workedHours || 0) / project.estimatedHours * 100).toFixed(1)}% do estimado
                </p>
              )}
            </div>
          </div>

          {/* Project Type */}
          {project.isRecurring && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-blue-500 font-medium">
                🔄 Projeto Recorrente
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Este projeto possui entregas recorrentes.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}