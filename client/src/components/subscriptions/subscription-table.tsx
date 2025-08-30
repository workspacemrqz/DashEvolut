import { SubscriptionWithClient, SubscriptionService, PaymentWithFile } from "@shared/schema";
import { Eye, DollarSign, Calendar, MoreHorizontal, CreditCard, Edit, Pause, Play, X, CheckSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import ServiceChecklist from "./service-checklist";
import SubscriptionForm from "./subscription-form";

interface SubscriptionTableProps {
  subscriptions: SubscriptionWithClient[];
  isLoading: boolean;
  onPaymentClick: (subscriptionId: string) => void;
  "data-testid"?: string;
}

const statusMap = {
  active: { label: "Ativa", className: "status-subscription-active" },
  paused: { label: "Pausada", className: "status-subscription-paused" },
  cancelled: { label: "Cancelada", className: "status-subscription-cancelled" },
};

export default function SubscriptionTable({ 
  subscriptions, 
  isLoading, 
  onPaymentClick, 
  "data-testid": testId 
}: SubscriptionTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithClient | null>(null);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [showServiceChecklist, setShowServiceChecklist] = useState(false);
  const [showEditSubscription, setShowEditSubscription] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<SubscriptionWithClient | null>(null);

  // Buscar detalhes da assinatura selecionada
  const { data: subscriptionDetails } = useQuery({
    queryKey: [`/api/subscriptions/${selectedSubscription?.id}`],
    enabled: !!selectedSubscription?.id,
  });

  // Buscar pagamentos da assinatura selecionada
  const { data: subscriptionPayments } = useQuery<PaymentWithFile[]>({
    queryKey: [`/api/subscriptions/${selectedSubscription?.id}/payments`],
    enabled: !!selectedSubscription?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" | "cancelled" }) => 
      apiRequest("PATCH", `/api/subscriptions/${id}`, { status }),
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

  const handleViewSubscription = (subscription: SubscriptionWithClient) => {
    setSelectedSubscription(subscription);
    setShowSubscriptionDetails(true);
  };

  const handleStatusChange = (id: string, status: "active" | "paused" | "cancelled") => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleManageServices = (subscription: SubscriptionWithClient) => {
    setSelectedSubscription(subscription);
    setShowServiceChecklist(true);
  };

  const handleEditSubscription = (subscription: SubscriptionWithClient) => {
    setSubscriptionToEdit(subscription);
    setShowEditSubscription(true);
  };

  if (isLoading) {
    return (
      <div className="container-bg rounded-xl border border-border-secondary overflow-hidden" data-testid={testId}>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-border-secondary rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border-secondary rounded w-1/4"></div>
                  <div className="h-3 bg-border-secondary rounded w-1/6"></div>
                </div>
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
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border-secondary">
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Cliente</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Status</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden md:table-cell">Valor Mensal</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden lg:table-cell">Próximo Vencimento</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Serviços</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Ações</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => {
              const isOverdue = isPast(subscription.nextBillingDate);
              const completedServices = subscription.services.filter(s => s.isCompleted).length;
              
              return (
                <tr 
                  key={subscription.id} 
                  className={`border-b border-border-secondary ${isOverdue ? 'bg-red-50 dark:bg-red-950' : ''}`}
                >
                  <td className="p-2 lg:p-4">
                    <div className="flex items-center">
                      <div className="w-8 lg:w-10 h-8 lg:h-10 gradient-bg rounded-full flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                        <span className="text-xs lg:text-sm font-semibold">
                          {subscription.client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary text-sm lg:text-base truncate" data-testid={`subscription-client-name-${subscription.id}`}>
                          {subscription.client.name}
                        </p>
                        <p className="text-xs lg:text-sm text-text-secondary truncate" data-testid={`subscription-client-company-${subscription.id}`}>
                          {subscription.client.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 lg:p-4">
                    <Badge 
                      className={`status-badge ${statusMap[subscription.status].className} text-xs`}
                      data-testid={`subscription-status-${subscription.id}`}
                    >
                      {statusMap[subscription.status].label}
                    </Badge>
                    {isOverdue && (
                      <Badge className="ml-2 status-badge status-subscription-cancelled text-xs">
                        Vencida
                      </Badge>
                    )}
                  </td>
                  <td className="p-2 lg:p-4 text-text-primary text-sm lg:text-base hidden md:table-cell" data-testid={`subscription-amount-${subscription.id}`}>
                    <span className="font-semibold text-accent-primary">
                      R$ {subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-text-secondary">
                      Todo dia {subscription.billingDay}
                    </p>
                  </td>
                  <td className="p-2 lg:p-4 hidden lg:table-cell">
                    <span 
                      className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}
                      data-testid={`subscription-next-billing-${subscription.id}`}
                    >
                      {format(subscription.nextBillingDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="p-2 lg:p-4 text-text-secondary text-sm lg:text-base" data-testid={`subscription-services-${subscription.id}`}>
                    {subscription.services.length > 0 ? (
                      <span className="text-text-primary">
                        {completedServices}/{subscription.services.length} concluídos
                      </span>
                    ) : (
                      <span>Nenhum serviço</span>
                    )}
                  </td>
                  <td className="p-2 lg:p-4">
                    <div className="flex space-x-1 lg:space-x-2">
                      <button 
                        onClick={() => handleViewSubscription(subscription)}
                        className="text-blue-500 hover:text-blue-400 p-1"
                        data-testid={`action-view-subscription-${subscription.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="text-text-secondary hover:text-text-primary p-1"
                            data-testid={`action-more-subscription-${subscription.id}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dropdown-content">
                          <DropdownMenuItem onClick={() => onPaymentClick(subscription.id)} className="text-left justify-start hover:bg-transparent text-dynamic-light">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Registrar Pagamento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageServices(subscription)} className="text-left justify-start hover:bg-transparent text-dynamic-light">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Gerenciar Serviços
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditSubscription(subscription)} className="text-left justify-start hover:bg-transparent text-dynamic-light">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Assinatura
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {subscription.status === "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "paused")} className="text-left justify-start hover:bg-transparent text-dynamic-light">
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          )}
                          {subscription.status === "paused" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "active")} className="text-left justify-start hover:bg-transparent text-dynamic-light">
                              <Play className="h-4 w-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          {subscription.status === "cancelled" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "active")} className="text-left justify-start hover:bg-transparent text-dynamic-light">
                              <Play className="h-4 w-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          {subscription.status !== "cancelled" && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(subscription.id, "cancelled")}
                              className="text-left justify-start hover:bg-transparent text-dynamic-light"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Subscription Details Dialog */}
      <Dialog open={showSubscriptionDetails} onOpenChange={setShowSubscriptionDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto container-bg border-border-secondary">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="gradient-text text-xl">
                  Detalhes da Assinatura
                </DialogTitle>
                <DialogDescription className="text-text-secondary">
                  {selectedSubscription.client.name} - {selectedSubscription.client.company}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Informações da Assinatura */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary border-b border-border-secondary pb-2">
                    Informações da Assinatura
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Valor Mensal:</span>
                      <p className="font-semibold text-accent-primary text-lg">
                        R$ {selectedSubscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Dia de Cobrança:</span>
                      <p className="font-medium text-text-primary">Todo dia {selectedSubscription.billingDay}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Próximo Vencimento:</span>
                      <p className={`font-medium ${isPast(selectedSubscription.nextBillingDate) ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                        {format(selectedSubscription.nextBillingDate, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Status:</span>
                      <Badge className={`status-badge ${statusMap[selectedSubscription.status].className}`}>
                        {statusMap[selectedSubscription.status].label}
                      </Badge>
                    </div>
                  </div>

                  {selectedSubscription.notes && (
                    <div>
                      <span className="text-text-secondary text-sm">Observações:</span>
                      <p className="mt-1 text-text-primary bg-bg-tertiary p-3 rounded text-sm">
                        {selectedSubscription.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onPaymentClick(selectedSubscription.id)}
                      className="btn-primary"
                      data-testid="button-register-payment-details"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Registrar Pagamento
                    </Button>
                    <Button
                      onClick={() => setShowServiceChecklist(true)}
                      variant="secondary"
                      className="status-badge status-subscription-active border-0"
                      data-testid="button-manage-services-details"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Gerenciar Serviços
                    </Button>
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary border-b border-border-secondary pb-2">
                    Informações do Cliente
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-text-secondary">Nome:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client.name}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Empresa:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client.company}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Email:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client.email}</p>
                    </div>
                    {selectedSubscription.client.phone && (
                      <div>
                        <span className="text-text-secondary">Telefone:</span>
                        <p className="font-medium text-text-primary">{selectedSubscription.client.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-secondary">Setor:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client.sector}</p>
                    </div>
                  </div>
                </div>

                {/* Serviços */}
                {selectedSubscription.services.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary border-b border-border-secondary pb-2">
                      Serviços ({selectedSubscription.services.filter(s => s.isCompleted).length}/{selectedSubscription.services.length} concluídos)
                    </h3>
                    
                    <div className="space-y-2">
                      {selectedSubscription.services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-3 p-2 bg-bg-tertiary rounded text-sm">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${service.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={`flex-1 ${service.isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                            {service.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Histórico de Pagamentos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary border-b border-border-secondary pb-2">
                    Histórico de Pagamentos
                  </h3>
                  
                  {subscriptionPayments && subscriptionPayments.length > 0 ? (
                    <div className="space-y-2">
                      {subscriptionPayments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 bg-bg-tertiary rounded text-sm">
                          <div>
                            <p className="font-medium text-text-primary">
                              R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-text-secondary">
                              {format(payment.paymentDate, "dd/MM/yyyy", { locale: ptBR })} - 
                              {` ${months.find(m => m.value === payment.referenceMonth)?.label}/${payment.referenceYear}`}
                            </p>
                            {payment.notes && (
                              <p className="text-text-secondary text-xs mt-1">{payment.notes}</p>
                            )}
                          </div>
                          {payment.file && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/api/files/${payment.receiptFileId}`, '_blank')}
                              data-testid={`button-download-receipt-${payment.id}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">Nenhum pagamento registrado ainda.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Checklist Dialog */}
      {selectedSubscription && (
        <ServiceChecklist
          subscriptionId={selectedSubscription.id}
          open={showServiceChecklist}
          onOpenChange={setShowServiceChecklist}
        />
      )}

      {/* Edit Subscription Dialog */}
      <SubscriptionForm
        open={showEditSubscription}
        onOpenChange={setShowEditSubscription}
        subscription={subscriptionToEdit}
      />
    </div>
  );
}

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];