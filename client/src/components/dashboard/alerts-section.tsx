import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert } from "@shared/schema";
import { AlertTriangle, Clock, Star, CircleAlert, Eye, CreditCard, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AlertsSectionProps {
  alerts: Alert[];
  "data-testid"?: string;
}

const alertIcons = {
  project_delayed: CircleAlert,
  payment_pending: Clock,
  upsell_opportunity: Star,
  milestone_due: AlertTriangle,
};

const alertColors = {
  project_delayed: "border-red-500/30 bg-red-500/10",
  payment_pending: "border-yellow-500/30 bg-yellow-500/10",
  upsell_opportunity: "border-blue-500/30 bg-blue-500/10",
  milestone_due: "border-orange-500/30 bg-orange-500/10",
};

const iconColors = {
  project_delayed: "text-red-500",
  payment_pending: "text-yellow-500",
  upsell_opportunity: "text-blue-500",
  milestone_due: "text-orange-500",
};

export default function AlertsSection({ alerts, "data-testid": testId }: AlertsSectionProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("POST", `/api/alerts/${alertId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
    },
  });

  const handleAction = (alert: Alert) => {
    // Mark alert as read first
    markAsReadMutation.mutate(alert.id);
    
    // Handle specific actions based on alert type
    switch (alert.type) {
      case "project_delayed":
        setLocation("/projects");
        toast({
          title: "Redirecionando para projetos",
          description: "Visualize os detalhes do projeto atrasado.",
        });
        break;
      case "payment_pending":
        setLocation("/clients");
        toast({
          title: "Redirecionando para clientes",
          description: "Gerencie o pagamento pendente do cliente.",
        });
        break;
      case "upsell_opportunity":
        setLocation("/clients");
        toast({
          title: "Redirecionando para clientes",
          description: "Aproveite a oportunidade de upsell identificada.",
        });
        break;
      default:
        toast({
          title: "Alerta processado",
          description: "O alerta foi marcado como lido.",
        });
    }
  };

  const getActionButton = (alert: Alert) => {
    switch (alert.type) {
      case "project_delayed":
        return (
          <button 
            className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
            onClick={() => handleAction(alert)}
            data-testid={`action-${alert.id}`}
          >
            <Eye className="w-3 h-3" />
            Visualizar
          </button>
        );
      case "payment_pending":
        return (
          <button 
            className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
            onClick={() => handleAction(alert)}
            data-testid={`action-${alert.id}`}
          >
            <CreditCard className="w-3 h-3" />
            Cobrar
          </button>
        );
      case "upsell_opportunity":
        return (
          <button 
            className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
            onClick={() => handleAction(alert)}
            data-testid={`action-${alert.id}`}
          >
            <MessageCircle className="w-3 h-3" />
            Contatar
          </button>
        );
      default:
        return (
          <button 
            className="btn-primary px-3 py-1 rounded text-xs"
            onClick={() => handleAction(alert)}
            data-testid={`action-${alert.id}`}
          >
            Ação
          </button>
        );
    }
  };

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <h3 className="text-lg font-semibold mb-4 text-text-primary flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
        Alertas Automáticos
      </h3>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">Nenhum alerta pendente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type] || AlertTriangle;
            
            return (
              <div 
                key={alert.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${alertColors[alert.type]}`}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${iconColors[alert.type]}`} />
                  <div>
                    <p className="font-medium text-text-primary" data-testid={`alert-title-${alert.id}`}>
                      {alert.title}
                    </p>
                    <p className="text-sm text-text-secondary" data-testid={`alert-description-${alert.id}`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
                {getActionButton(alert)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
