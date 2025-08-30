import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { SubscriptionService, insertSubscriptionServiceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServiceChecklistProps {
  subscriptionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceChecklist({ subscriptionId, open, onOpenChange }: ServiceChecklistProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");

  const { data: services, isLoading } = useQuery<SubscriptionService[]>({
    queryKey: ["/api/subscriptions", subscriptionId, "services"],
    enabled: !!subscriptionId && open,
  });

  const addServiceMutation = useMutation({
    mutationFn: (description: string) => {
      const order = (services?.length || 0) + 1;
      return apiRequest("POST", `/api/subscriptions/${subscriptionId}/services`, {
        description,
        order,
        isCompleted: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", subscriptionId, "services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setNewServiceDescription("");
      toast({
        title: "Serviço adicionado!",
        description: "O novo serviço foi adicionado à lista.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar serviço",
        description: "Ocorreu um erro ao adicionar o serviço.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SubscriptionService> }) =>
      apiRequest("PATCH", `/api/subscription-services/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", subscriptionId, "services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setEditingService(null);
      setEditingDescription("");
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar serviço",
        description: "Ocorreu um erro ao atualizar o serviço.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/subscription-services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", subscriptionId, "services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Serviço removido!",
        description: "O serviço foi removido da lista.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover serviço",
        description: "Ocorreu um erro ao remover o serviço.",
        variant: "destructive",
      });
    },
  });

  const handleAddService = () => {
    if (!newServiceDescription.trim()) return;
    addServiceMutation.mutate(newServiceDescription.trim());
  };

  const handleToggleComplete = (service: SubscriptionService) => {
    updateServiceMutation.mutate({
      id: service.id,
      updates: { isCompleted: !service.isCompleted },
    });
  };

  const handleStartEdit = (service: SubscriptionService) => {
    setEditingService(service.id);
    setEditingDescription(service.description);
  };

  const handleSaveEdit = () => {
    if (!editingDescription.trim() || !editingService) return;
    updateServiceMutation.mutate({
      id: editingService,
      updates: { description: editingDescription.trim() },
    });
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setEditingDescription("");
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este serviço?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const completedCount = services?.filter(s => s.isCompleted).length || 0;
  const totalCount = services?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] container-bg border-border-secondary max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">Checklist de Serviços</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Gerencie os serviços prestados nesta assinatura ({completedCount}/{totalCount} concluídos)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Service */}
          <div className="flex items-center space-x-2">
            <Input
              value={newServiceDescription}
              onChange={(e) => setNewServiceDescription(e.target.value)}
              placeholder="Descreva um novo serviço..."
              className="flex-1 input-field"
              data-testid="input-new-service"
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
            />
            <Button
              onClick={handleAddService}
              disabled={!newServiceDescription.trim() || addServiceMutation.isPending}
              className="btn-primary"
              data-testid="button-add-service"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Services List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-bg-tertiary rounded-lg animate-pulse" />
                ))}
              </div>
            ) : services && services.length > 0 ? (
              <div className="space-y-2">
                {services
                  .sort((a, b) => a.order - b.order)
                  .map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-3 p-3 bg-bg-tertiary rounded-lg border border-border-secondary"
                      data-testid={`service-item-${service.id}`}
                    >
                      <Checkbox
                        checked={service.isCompleted || false}
                        onCheckedChange={() => handleToggleComplete(service)}
                        className="flex-shrink-0"
                        data-testid={`checkbox-service-${service.id}`}
                      />

                      {editingService === service.id ? (
                        <>
                          <Input
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            className="flex-1 input-field"
                            data-testid={`input-edit-service-${service.id}`}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                          />
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={!editingDescription.trim()}
                              className="btn-primary px-2 py-1"
                              data-testid={`button-save-service-${service.id}`}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="px-2 py-1"
                              data-testid={`button-cancel-service-${service.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span
                            className={`flex-1 text-sm ${
                              service.isCompleted
                                ? "line-through text-text-secondary"
                                : "text-text-primary"
                            }`}
                            data-testid={`text-service-description-${service.id}`}
                          >
                            {service.description}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(service)}
                              className="px-2 py-1"
                              data-testid={`button-edit-service-${service.id}`}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteService(service.id)}
                              className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              data-testid={`button-delete-service-${service.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <div className="mb-2">Nenhum serviço adicionado ainda</div>
                <div className="text-sm">Adicione serviços para acompanhar o progresso da assinatura</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Progresso</span>
                <span className="text-text-primary font-medium">
                  {completedCount} de {totalCount} concluídos
                </span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="btn-secondary"
            style={{color: '#060606 !important'}}
            data-testid="button-close-checklist"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}