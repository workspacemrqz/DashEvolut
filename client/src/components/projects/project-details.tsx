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
import { Calendar, DollarSign, User, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface ProjectCost {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category?: string | null;
  costDate: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectWithClient;
  onEdit?: () => void;
}

export default function ProjectDetails({ open, onOpenChange, project, onEdit }: ProjectDetailsProps) {
  // Buscar custos do projeto
  const { data: costs = [] } = useQuery<ProjectCost[]>({
    queryKey: [`/api/projects/${project.id}/costs`],
    enabled: open, // Só busca quando o modal está aberto
  });

  // Calcular total de custos e lucro
  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const profit = project.value - totalCosts;

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
                className="btn-primary"
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

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Value */}
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="mb-2">
                <h4 className="font-semibold text-text-primary">Valor do Projeto</h4>
              </div>
              <p className="text-2xl font-bold text-blue-500" data-testid="project-value">
                R$ {project.value.toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Total Costs */}
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="mb-2">
                <h4 className="font-semibold text-text-primary">Total de Custos</h4>
              </div>
              <p className="text-2xl font-bold text-orange-500" data-testid="project-costs">
                R$ {totalCosts.toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Project Profit */}
            <div className="p-4 rounded-lg bg-bg-secondary border border-border-secondary">
              <div className="mb-2">
                <h4 className="font-semibold text-text-primary">Lucro do Projeto</h4>
              </div>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="project-profit">
                R$ {profit.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-text-secondary">
                Margem: {project.value > 0 ? ((profit / project.value) * 100).toFixed(1) : '0'}%
              </p>
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

          {/* Project Costs Details */}
          {costs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-text-primary flex items-center">
                <Receipt className="w-4 h-4 mr-2" />
                Custos do Projeto ({costs.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="p-3 rounded-lg bg-bg-secondary border border-border-secondary"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-text-primary">{cost.description}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          {cost.category && (
                            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                              {cost.category}
                            </span>
                          )}
                          <span className="text-sm text-text-secondary">
                            {format(new Date(cost.costDate), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        {cost.notes && (
                          <p className="text-sm text-text-secondary mt-1">{cost.notes}</p>
                        )}
                      </div>
                      <span className="font-semibold text-orange-500 ml-3">
                        R$ {cost.amount.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}