import { SubscriptionWithClient } from "@shared/schema";
import { DollarSign, Calendar, User, MoreHorizontal, CreditCard, Edit, Pause, Play, X, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import ServiceChecklist from "./service-checklist";
import { useState } from "react";

interface SubscriptionCardProps {
  subscription: SubscriptionWithClient;
  onPaymentClick: (subscriptionId: string) => void;
  "data-testid"?: string;
}

const statusMap = {
  active: { label: "Ativa", className: "status-subscription-active" },
  paused: { label: "Pausada", className: "status-subscription-paused" },
  cancelled: { label: "Cancelada", className: "status-subscription-cancelled" },
};

export default function SubscriptionCard({ 
  subscription, 
  onPaymentClick, 
  "data-testid": testId 
}: SubscriptionCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showServiceChecklist, setShowServiceChecklist] = useState(false);

  const isOverdue = isPast(subscription.nextBillingDate);
  
  const updateStatusMutation = useMutation({
    mutationFn: (status: "active" | "paused" | "cancelled") => 
      apiRequest("PATCH", `/api/subscriptions/${subscription.id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Status atualizado!",
        description: "O status da assinatura foi alterado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao alterar o status da assinatura.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: "active" | "paused" | "cancelled") => {
    updateStatusMutation.mutate(status);
  };

  return (
    <div 
      className={`relative p-6 bg-bg-secondary border border-border-secondary rounded-lg ${
        isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''
      }`}
      data-testid={testId}
    >
      {isOverdue && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Vencida
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent-primary/10 rounded-lg">
            <User className="h-5 w-5 text-accent-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary" data-testid={`text-client-name-${subscription.id}`}>
              {subscription.client.name}
            </h3>
            <p className="text-sm text-text-secondary" data-testid={`text-client-company-${subscription.id}`}>
              {subscription.client.company}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid={`button-subscription-actions-${subscription.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-content">
            <DropdownMenuItem onClick={() => onPaymentClick(subscription.id)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Registrar Pagamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowServiceChecklist(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Gerenciar Serviços
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Editar Assinatura
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {subscription.status === "active" && (
              <DropdownMenuItem onClick={() => handleStatusChange("paused")}>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </DropdownMenuItem>
            )}
            {subscription.status === "paused" && (
              <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                <Play className="h-4 w-4 mr-2" />
                Reativar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => handleStatusChange("cancelled")}
              className="text-red-600 dark:text-red-400"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Valor Mensal</span>
          <span className="font-semibold text-lg text-accent-primary" data-testid={`text-amount-${subscription.id}`}>
            R$ {subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Dia de Cobrança</span>
          <span className="text-sm text-text-primary" data-testid={`text-billing-day-${subscription.id}`}>
            Todo dia {subscription.billingDay}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Próximo Vencimento</span>
          <span 
            className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}
            data-testid={`text-next-billing-${subscription.id}`}
          >
            {format(subscription.nextBillingDate, "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Status</span>
          <Badge className={statusMap[subscription.status].className} data-testid={`badge-status-${subscription.id}`}>
            {statusMap[subscription.status].label}
          </Badge>
        </div>

        {subscription.services.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">
                Serviços ({subscription.services.filter(s => s.isCompleted).length}/{subscription.services.length} concluídos)
              </p>
              <button
                onClick={() => setShowServiceChecklist(true)}
                className="px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 btn-secondary"
                data-testid={`button-manage-services-${subscription.id}`}
              >
                Gerenciar Serviços
              </button>
            </div>
            <div className="space-y-1">
              {subscription.services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${service.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-text-secondary truncate">
                    {service.description}
                  </span>
                </div>
              ))}
              {subscription.services.length > 3 && (
                <p className="text-xs text-text-secondary">
                  +{subscription.services.length - 3} mais serviços
                </p>
              )}
            </div>
          </div>
        )}

        {subscription.notes && (
          <div className="pt-2">
            <p className="text-sm text-text-secondary mb-1">Observações</p>
            <p className="text-xs text-text-secondary bg-bg-tertiary p-2 rounded text-wrap break-words">
              {subscription.notes}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border-secondary">
        <Button
          onClick={() => onPaymentClick(subscription.id)}
          className="w-full btn-primary"
          data-testid={`button-register-payment-${subscription.id}`}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>
      </div>

      <ServiceChecklist
        subscriptionId={subscription.id}
        open={showServiceChecklist}
        onOpenChange={setShowServiceChecklist}
      />
    </div>
  );
}