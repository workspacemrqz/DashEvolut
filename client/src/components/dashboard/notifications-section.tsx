import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert } from "@shared/schema";
import { Bell, Eye, CheckCheck, AlertTriangle, Clock, Star, CircleAlert } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface NotificationsSectionProps {
  "data-testid"?: string;
}

const notificationIcons = {
  project_delayed: CircleAlert,
  payment_pending: Clock,
  upsell_opportunity: Star,
};

const notificationColors = {
  project_delayed: "border-red-500/30 bg-red-500/10",
  payment_pending: "border-yellow-500/30 bg-yellow-500/10",
  upsell_opportunity: "border-blue-500/30 bg-blue-500/10",
};

const iconColors = {
  project_delayed: "text-red-500",
  payment_pending: "text-yellow-500",
  upsell_opportunity: "text-blue-500",
};

export default function NotificationsSection({ "data-testid": testId }: NotificationsSectionProps) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();


  // Buscar alertas não lidos
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts/unread"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("POST", `/api/alerts/${alertId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!alerts) return Promise.resolve();
      const markAllPromises = alerts.map(alert => 
        apiRequest("POST", `/api/alerts/${alert.id}/read`, {})
      );
      return Promise.all(markAllPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
      toast({
        title: "Todas as notificações foram marcadas como lidas",
        description: "Todas as notificações pendentes foram processadas.",
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
      default:
        toast({
          title: "Notificação processada",
          description: "A notificação foi marcada como lida.",
        });
    }
  };

  const handleNotificationClick = (alert: Alert) => {
    // Mark alert as read when clicked anywhere on the notification
    markAsReadMutation.mutate(alert.id);
    toast({
      title: "Notificação marcada como lida",
      description: "A notificação foi removida da lista.",
    });
  };

  const handleMarkAllAsRead = () => {
    if (alerts && alerts.length > 0) {
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
            <Clock className="w-3 h-3" />
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
            <Star className="w-3 h-3" />
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

  if (isLoadingAlerts) {
    return (
      <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-500" />
            Notificações
          </h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-500" />
          Notificações
        </h3>
        {alerts && alerts.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="btn-secondary px-3 py-1 rounded text-xs flex items-center gap-1"
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="w-3 h-3" style={{ color: '#060606' }} />
            {markAllAsReadMutation.isPending ? "Marcando..." : "Marcar Todas como Lidas"}
          </button>
        )}
      </div>


      {/* Mostrar notificações */}
      {!alerts || alerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-text-secondary">Nenhuma notificação pendente</p>
          <p className="text-xs text-text-secondary mt-1">
            Configure regras de notificação para receber alertas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = notificationIcons[alert.type] || AlertTriangle;
            
            return (
              <div 
                key={alert.id}
                onClick={() => handleNotificationClick(alert)}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${notificationColors[alert.type]}`}
                data-testid={`notification-${alert.id}`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${iconColors[alert.type]}`} />
                  <div>
                    <p className="font-medium text-text-primary" data-testid={`notification-title-${alert.id}`}>
                      {alert.title}
                    </p>
                    <p className="text-sm text-text-secondary" data-testid={`notification-description-${alert.id}`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getActionButton(alert)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
