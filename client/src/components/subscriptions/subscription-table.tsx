import { SubscriptionWithClient, SubscriptionService, PaymentWithFile, SubscriptionCredential, SubscriptionFile } from "@shared/schema";
import { Eye, DollarSign, Calendar, MoreHorizontal, CreditCard, Edit, Pause, Play, X, CheckSquare, FileText, Trash2, Download, Key, FolderArchive } from "lucide-react";
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
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";

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
  // Debug log
  console.log('🔍 [TABLE] Received subscriptions:', subscriptions);
  console.log('🔍 [TABLE] Is loading:', isLoading);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithClient | null>(null);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [showServiceChecklist, setShowServiceChecklist] = useState(false);
  const [showEditSubscription, setShowEditSubscription] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<SubscriptionWithClient | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<SubscriptionWithClient | null>(null);

  // Buscar detalhes da assinatura selecionada
  const { data: subscriptionDetails } = useQuery({
    queryKey: [`/api/assinaturas/${selectedSubscription?.id}`],
    enabled: !!selectedSubscription?.id,
  });

  // Buscar pagamentos da assinatura selecionada
  const { data: subscriptionPayments } = useQuery<PaymentWithFile[]>({
    queryKey: [`/api/assinaturas/${selectedSubscription?.id}/pagamentos`],
    enabled: !!selectedSubscription?.id,
  });

  // Buscar credenciais da assinatura selecionada
  const { data: subscriptionCredentials, isLoading: isLoadingCredentials } = useQuery<SubscriptionCredential[]>({
    queryKey: [`/api/assinaturas/${selectedSubscription?.id}/credenciais`],
    enabled: !!selectedSubscription?.id,
  });

  // Buscar arquivos da assinatura selecionada
  const { data: subscriptionFiles, isLoading: isLoadingFiles } = useQuery<SubscriptionFile[]>({
    queryKey: [`/api/assinaturas/${selectedSubscription?.id}/arquivos`],
    enabled: !!selectedSubscription?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" | "cancelled" }) => 
      apiRequest("PATCH", `/api/assinaturas/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assinaturas"] });
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

  const handleDownloadFile = (fileId: string) => {
    window.open(`/api/subscription-files/${fileId}`, '_blank');
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

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (subscriptionId: string) => apiRequest('DELETE', `/api/assinaturas/${subscriptionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assinaturas'] });
      toast({
        title: "Assinatura removida",
        description: "A assinatura foi removida com sucesso.",
      });
      setShowDeleteDialog(false);
      setSubscriptionToDelete(null);
    },
    onError: (error: any) => {
      // Extract message from error string (format: "400: {"message":"..."}")
      let errorMessage = "Não foi possível remover a assinatura.";
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
        title: "Erro ao remover assinatura",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDeleteSubscription = (subscription: SubscriptionWithClient) => {
    setSubscriptionToDelete(subscription);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSubscription = () => {
    if (subscriptionToDelete) {
      deleteSubscriptionMutation.mutate(subscriptionToDelete.id);
    }
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
      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        <div className="p-4 space-y-4">
          {subscriptions.map((subscription) => {
            const nextBillingDate = new Date(subscription.nextBillingDate);
            const isOverdue = !isNaN(nextBillingDate.getTime()) && isPast(nextBillingDate);
            const completedServices = subscription.services?.filter(s => s.isCompleted).length || 0;
            
            return (
              <div 
                key={subscription.id} 
                className={`border border-border-secondary rounded-lg p-4 ${isOverdue ? 'bg-red-50 dark:bg-red-950' : 'bg-bg-primary'}`}
              >
                {/* Header com Cliente */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-sm font-semibold">
                        {subscription.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary text-sm truncate" data-testid={`subscription-client-name-${subscription.id}`}>
                        {subscription.client?.name || 'Cliente não encontrado'}
                      </p>
                      <p className="text-xs text-text-secondary truncate" data-testid={`subscription-client-company-${subscription.id}`}>
                        {subscription.client?.company || 'Empresa não informada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button 
                      onClick={() => handleViewSubscription(subscription)}
                      className="text-blue-500 p-2"
                      data-testid={`action-view-subscription-${subscription.id}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="text-text-secondary p-2"
                          data-testid={`action-more-subscription-${subscription.id}`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#333] text-white">
                        <DropdownMenuItem onClick={() => onPaymentClick(subscription.id)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Registrar Pagamento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageServices(subscription)}>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Gerenciar Serviços
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Assinatura
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {subscription.status === "active" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "paused")}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        {subscription.status === "paused" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "active")}>
                            <Play className="h-4 w-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                        {subscription.status === "cancelled" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "active")}>
                            <Play className="h-4 w-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                        {subscription.status !== "cancelled" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(subscription.id, "cancelled")}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSubscription(subscription)}
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
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Status</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge 
                        className={`status-badge ${statusMap[subscription.status].className} text-xs`}
                        data-testid={`subscription-status-${subscription.id}`}
                      >
                        {statusMap[subscription.status].label}
                      </Badge>
                      {isOverdue && (
                        <Badge className="status-badge status-subscription-cancelled text-xs">
                          Vencida
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Valor Mensal</p>
                    <p className="font-semibold text-accent-primary text-sm" data-testid={`subscription-amount-${subscription.id}`}>
                      R$ {subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Dia {subscription.billingDay}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Próximo Venc.</p>
                    <p 
                      className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}
                      data-testid={`subscription-next-billing-${subscription.id}`}
                    >
                      {!isNaN(nextBillingDate.getTime()) ? format(nextBillingDate, "dd/MM/yy", { locale: ptBR }) : 'Inválida'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Serviços</p>
                    <p className="text-sm font-medium text-text-primary" data-testid={`subscription-services-${subscription.id}`}>
                      {subscription.services && subscription.services.length > 0 ? (
                        <span>{completedServices} concluídos</span>
                      ) : (
                        <span className="text-text-secondary">Nenhum</span>
                      )}
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
              <th className="text-left p-4 font-semibold text-text-primary">Cliente</th>
              <th className="text-left p-4 font-semibold text-text-primary">Status</th>
              <th className="text-left p-4 font-semibold text-text-primary">Valor Mensal</th>
              <th className="text-left p-4 font-semibold text-text-primary hidden lg:table-cell">Próximo Vencimento</th>
              <th className="text-left p-4 font-semibold text-text-primary">Serviços</th>
              <th className="text-left p-4 font-semibold text-text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => {
              const nextBillingDate = new Date(subscription.nextBillingDate);
              const isOverdue = !isNaN(nextBillingDate.getTime()) && isPast(nextBillingDate);
              const completedServices = subscription.services?.filter(s => s.isCompleted).length || 0;
              
              return (
                <tr 
                  key={subscription.id} 
                  className={`border-b border-border-secondary ${isOverdue ? 'bg-red-50 dark:bg-red-950' : ''}`}
                >
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-semibold">
                          {subscription.client?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate" data-testid={`subscription-client-name-${subscription.id}`}>
                          {subscription.client?.name || 'Cliente não encontrado'}
                        </p>
                        <p className="text-sm text-text-secondary truncate" data-testid={`subscription-client-company-${subscription.id}`}>
                          {subscription.client?.company || 'Empresa não informada'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
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
                  <td className="p-4 text-text-primary" data-testid={`subscription-amount-${subscription.id}`}>
                    <span className="font-semibold text-accent-primary">
                      R$ {subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-text-secondary">
                      Todo dia {subscription.billingDay}
                    </p>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span 
                      className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}
                      data-testid={`subscription-next-billing-${subscription.id}`}
                    >
                      {!isNaN(nextBillingDate.getTime()) ? format(nextBillingDate, "dd/MM/yyyy", { locale: ptBR }) : 'Data inválida'}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary" data-testid={`subscription-services-${subscription.id}`}>
                    {subscription.services && subscription.services.length > 0 ? (
                      <span className="text-text-primary">
                        {completedServices}
                      </span>
                    ) : (
                      <span>Nenhum serviço</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewSubscription(subscription)}
                        className="text-blue-500 p-1"
                        data-testid={`action-view-subscription-${subscription.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="text-text-secondary p-1"
                            data-testid={`action-more-subscription-${subscription.id}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-[#333] text-white">
                          <DropdownMenuItem onClick={() => onPaymentClick(subscription.id)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Registrar Pagamento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageServices(subscription)}>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Gerenciar Serviços
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Assinatura
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {subscription.status === "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "paused")}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          )}
                          {subscription.status === "paused" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "active")}>
                              <Play className="h-4 w-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          {subscription.status === "cancelled" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(subscription.id, "active")}>
                              <Play className="h-4 w-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          {subscription.status !== "cancelled" && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(subscription.id, "cancelled")}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSubscription(subscription)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
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
                  {selectedSubscription.client?.name || 'Cliente não encontrado'} - {selectedSubscription.client?.company || 'Empresa não informada'}
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
                      <p className={`font-medium ${isPast(new Date(selectedSubscription.nextBillingDate)) ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                        {!isNaN(new Date(selectedSubscription.nextBillingDate).getTime()) ? format(new Date(selectedSubscription.nextBillingDate), "dd/MM/yyyy", { locale: ptBR }) : 'Data inválida'}
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
                      className="btn-secondary"
                      style={{ color: '#060606' }}
                      data-testid="button-manage-services-details"
                    >
                      <Edit className="h-4 w-4" style={{ color: '#060606' }} />
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
                      <p className="font-medium text-text-primary">{selectedSubscription.client?.name || 'Cliente não encontrado'}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Empresa:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client?.company || 'Empresa não informada'}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Email:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client?.email || 'Email não informado'}</p>
                    </div>
                    {selectedSubscription.client?.phone && (
                      <div>
                        <span className="text-text-secondary">Telefone:</span>
                        <p className="font-medium text-text-primary">{selectedSubscription.client.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-secondary">Setor:</span>
                      <p className="font-medium text-text-primary">{selectedSubscription.client?.sector || 'Setor não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Credenciais */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-secondary pb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center">
                      <Key className="h-5 w-5 mr-2" />
                      Credenciais de Acesso
                    </h3>
                  </div>
                  
                  {isLoadingCredentials ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-bg-tertiary p-4 rounded-lg">
                          <div className="h-4 bg-border-secondary rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-border-secondary rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : subscriptionCredentials && subscriptionCredentials.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptionCredentials.map((credential) => (
                        <div key={credential.id} className="bg-bg-tertiary p-4 rounded-lg border border-border-secondary space-y-3">
                          <div>
                            <span className="text-text-secondary text-xs font-medium">Plataforma:</span>
                            <p className="font-semibold text-text-primary mt-1" data-testid={`text-credential-plataforma-${credential.id}`}>
                              {credential.plataforma}
                            </p>
                          </div>
                          <div>
                            <span className="text-text-secondary text-xs font-medium">Login:</span>
                            <p className="font-medium text-text-primary mt-1 font-mono text-sm" data-testid={`text-credential-login-${credential.id}`}>
                              {credential.login}
                            </p>
                          </div>
                          <div>
                            <span className="text-text-secondary text-xs font-medium">Senha:</span>
                            <p className="font-medium text-text-primary font-mono text-sm mt-1" data-testid={`text-credential-senha-${credential.id}`}>
                              {credential.senha}
                            </p>
                          </div>
                          {credential.secrets && (
                            <div>
                              <span className="text-text-secondary text-xs font-medium">Secrets:</span>
                              <p className="font-medium text-text-primary bg-bg-primary p-3 rounded mt-1 whitespace-pre-wrap font-mono text-xs border border-border-secondary" data-testid={`text-credential-secrets-${credential.id}`}>
                                {credential.secrets}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-bg-tertiary rounded-lg border border-border-secondary border-dashed">
                      <Key className="h-12 w-12 mx-auto text-text-secondary opacity-50 mb-2" />
                      <p className="text-text-secondary text-sm" data-testid="text-no-credentials">
                        Nenhuma credencial adicionada
                      </p>
                    </div>
                  )}
                </div>

                {/* Arquivos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-secondary pb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center">
                      <FolderArchive className="h-5 w-5 mr-2" />
                      Arquivos
                    </h3>
                  </div>
                  
                  {isLoadingFiles ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-bg-tertiary p-3 rounded-lg flex items-center justify-between">
                          <div className="flex-1">
                            <div className="h-4 bg-border-secondary rounded w-2/3 mb-2"></div>
                            <div className="h-3 bg-border-secondary rounded w-1/3"></div>
                          </div>
                          <div className="h-8 w-8 bg-border-secondary rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : subscriptionFiles && subscriptionFiles.length > 0 ? (
                    <div className="space-y-2">
                      {subscriptionFiles.map((file) => (
                        <div key={file.id} className="bg-bg-tertiary p-3 rounded-lg border border-border-secondary flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-text-secondary flex-shrink-0" />
                              <p className="font-medium text-text-primary text-sm truncate" data-testid={`text-file-name-${file.id}`}>
                                {file.originalName}
                              </p>
                            </div>
                            <p className="text-xs text-text-secondary mt-1" data-testid={`text-file-size-${file.id}`}>
                              {(file.size / 1024).toFixed(2)} KB • {format(new Date(file.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadFile(file.id)}
                            className="btn-primary flex-shrink-0"
                            data-testid={`button-download-file-${file.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-bg-tertiary rounded-lg border border-border-secondary border-dashed">
                      <FolderArchive className="h-12 w-12 mx-auto text-text-secondary opacity-50 mb-2" />
                      <p className="text-text-secondary text-sm" data-testid="text-no-files">
                        Nenhum arquivo enviado
                      </p>
                    </div>
                  )}
                </div>

                {/* Serviços */}
                {selectedSubscription.services && selectedSubscription.services.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary border-b border-border-secondary pb-2">
                      Serviços ({selectedSubscription.services.filter(s => s.isCompleted).length})
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteSubscription}
        title="Remover Assinatura"
        itemName={subscriptionToDelete?.client?.name || ""}
        isLoading={deleteSubscriptionMutation.isPending}
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