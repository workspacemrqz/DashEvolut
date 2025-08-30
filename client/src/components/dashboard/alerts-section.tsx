import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert } from "@shared/schema";
import { AlertTriangle, Clock, Star, CircleAlert, Eye, CreditCard, MessageCircle, CheckCheck } from "lucide-react";
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
  subscription_due: CreditCard,
  subscription_overdue: CircleAlert,
};

const alertColors = {
  project_delayed: "border-error/30 bg-error/10",
  payment_pending: "border-warning/30 bg-warning/10",
  upsell_opportunity: "border-info/30 bg-info/10",
  milestone_due: "border-warning/30 bg-warning/10",
  subscription_due: "border-success/30 bg-success/10",
  subscription_overdue: "border-error/30 bg-error/10",
};

const iconColors = {
  project_delayed: "text-error",
  payment_pending: "text-warning",
  upsell_opportunity: "text-info",
  milestone_due: "text-warning",
  subscription_due: "text-success",
  subscription_overdue: "text-error",
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

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      // Mark all alerts as read by calling the API for each alert
      const markAllPromises = alerts.map(alert => 
        apiRequest("POST", `/api/alerts/${alert.id}/read`, {})
      );
      return Promise.all(markAllPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
      toast({
        title: "Todos os alertas foram marcados como lidos",
        description: "Todos os alertas pendentes foram processados.",
      });
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
      case "milestone_due":
        setLocation("/projects");
        toast({
          title: "Redirecionando para projetos",
          description: "Verifique o milestone com prazo próximo.",
        });
        break;
      case "subscription_due":
      case "subscription_overdue":
        setLocation("/subscriptions");
        toast({
          title: "Redirecionando para assinaturas",
          description: "Gerencie a assinatura pendente.",
        });
        break;
      default:
        toast({
          title: "Alerta processado",
          description: "O alerta foi marcado como lido.",
        });
    }
  };

  const handleAlertClick = (alert: Alert) => {
    // Mark alert as read when clicked anywhere on the alert
    markAsReadMutation.mutate(alert.id);
    toast({
      title: "Alerta marcado como lido",
      description: "O alerta foi removido da lista.",
    });
  };

  const handleMarkAllAsRead = () => {
    if (alerts.length > 0) {
      markAllAsReadMutation.mutate();
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
      case "milestone_due":
        return (
          <button 
            className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
            onClick={() => handleAction(alert)}
            data-testid={`action-${alert.id}`}
          >
            <Eye className="w-3 h-3" />
            Verificar
          </button>
        );
      case "subscription_due":
      case "subscription_overdue":
        return (
          <button 
            className="btn-primary px-3 py-1 rounded text-xs flex items-center gap-1"
            onClick={() => handleAction(alert)}
            data-testid={`action-${alert.id}`}
          >
            <CreditCard className="w-3 h-3" />
            Gerenciar
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
          Alertas Automáticos
        </h3>
        {alerts.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="btn-secondary px-3 py-1 rounded text-xs flex items-center gap-1 text-dark-text"
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="w-3 h-3" />
            {markAllAsReadMutation.isPending ? "Marcando..." : "Marcar Todas como Lidas"}
          </button>
        )}
      </div>
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
                onClick={() => handleAlertClick(alert)}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${alertColors[alert.type]}`}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
