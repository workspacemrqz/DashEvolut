import { Milestone } from "@shared/schema";
import { CheckCircle, Clock, AlertCircle, Bell, Package } from "lucide-react";

interface MilestonesSectionProps {
  milestones: Milestone[];
  "data-testid"?: string;
}

export default function MilestonesSection({ milestones, "data-testid": testId }: MilestonesSectionProps) {
  const getMilestoneColor = (milestone: Milestone) => {
    const dueDate = new Date(milestone.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (milestone.isCompleted) return "border-green-500/30 bg-green-500/10";
    if (daysUntilDue < 0) return "border-red-500/30 bg-red-500/10";
    if (daysUntilDue <= 3) return "border-yellow-500/30 bg-yellow-500/10";
    return "border-blue-500/30 bg-blue-500/10";
  };

  const getMilestoneIcon = (milestone: Milestone) => {
    if (milestone.isCompleted) return <CheckCircle className="w-3 h-3 text-green-500" />;
    
    const dueDate = new Date(milestone.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (daysUntilDue <= 3) return <Clock className="w-3 h-3 text-yellow-500" />;
    return <Clock className="w-3 h-3 text-blue-500" />;
  };

  const getActionButton = (milestone: Milestone) => {
    if (milestone.isCompleted) {
      return (
        <button className="btn-secondary px-3 py-1 rounded text-xs" disabled>
          Concluído
        </button>
      );
    }

    if (milestone.requiresClientApproval) {
      return (
        <button 
          className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
          data-testid={`milestone-notify-${milestone.id}`}
        >
          <Bell className="w-3 h-3" />
          Notificar
        </button>
      );
    }

    return (
      <button 
        className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
        data-testid={`milestone-deliver-${milestone.id}`}
      >
        <Package className="w-3 h-3" />
        Entregar
      </button>
    );
  };

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Próximos Milestones</h3>
      
      {milestones.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">Nenhum milestone pendente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${getMilestoneColor(milestone)}`}
              data-testid={`milestone-${milestone.id}`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4">
                  {getMilestoneIcon(milestone)}
                </div>
                <div>
                  <p className="font-medium text-text-primary" data-testid={`milestone-title-${milestone.id}`}>
                    {milestone.title}
                  </p>
                  <p className="text-sm text-text-secondary" data-testid={`milestone-description-${milestone.id}`}>
                    {milestone.description || `Vencimento: ${new Date(milestone.dueDate).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
              </div>
              {getActionButton(milestone)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
