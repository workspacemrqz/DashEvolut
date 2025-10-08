import { ClientWithStats, ProjectWithClient } from "@shared/schema";
import { Eye, MessageCircle, Mail, MoreHorizontal, ExternalLink, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ClientForm from "./client-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import { apiRequest } from "@/lib/queryClient";

interface ClientTableProps {
  clients: ClientWithStats[];
  isLoading: boolean;
  "data-testid"?: string;
}

const getClientStatus = (client: ClientWithStats) => {
  if (client.hasActiveSubscription) {
    return { label: "Ativo", className: "status-active" };
  }
  return { label: "Prospect", className: "status-prospect" };
};

const upsellMap = {
  low: { label: "Baixo", color: "text-gray-500" },
  medium: { label: "Médio", color: "text-yellow-500" },
  high: { label: "Alto", color: "text-green-500" },
};

export default function ClientTable({ clients, isLoading, "data-testid": testId }: ClientTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientWithStats | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<ClientWithStats | null>(null);
  const [, navigate] = useLocation();

  // Buscar projetos do cliente selecionado
  const { data: clientProjects } = useQuery<ProjectWithClient[]>({
    queryKey: [`/api/clientes/${selectedClient?.id}/projetos`],
    enabled: !!selectedClient?.id,
  });

  const handleViewClient = (client: ClientWithStats) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projetos/${projectId}`);
    setShowClientDetails(false);
  };

  const handleWhatsAppContact = (client: ClientWithStats) => {
    const message = encodeURIComponent(`Olá ${client.name}, como posso ajudá-lo hoje?`);
    const phone = client.phone?.replace(/\D/g, "") || "";
    if (phone) {
      window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
    } else {
      toast({
        title: "Telefone não encontrado",
        description: "Este cliente não possui telefone cadastrado.",
        variant: "destructive",
      });
    }
  };

  const handleEmailContact = (client: ClientWithStats) => {
    const subject = encodeURIComponent("Contato comercial");
    const body = encodeURIComponent(`Olá ${client.name},\n\nEspero que esteja bem. Gostaria de...`);
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`, "_blank");
  };

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => apiRequest('DELETE', `/api/clientes/${clientId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes'] });
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
      setShowDeleteDialog(false);
      setClientToDelete(null);
    },
    onError: (error: any) => {
      // Extract message from error string (format: "400: {"message":"..."}")
      let errorMessage = "Não foi possível remover o cliente.";
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
        title: "Erro ao remover cliente",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClient = (client: ClientWithStats) => {
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const handleEditClient = (client: ClientWithStats) => {
    setClientToEdit(client);
    setShowEditForm(true);
    setShowClientDetails(false);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border-secondary">
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Cliente</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Status</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden md:table-cell">Fonte</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base hidden lg:table-cell">Upsell</th>
              <th className="text-left p-2 lg:p-4 font-semibold text-text-primary text-sm lg:text-base">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border-secondary">
                <td className="p-2 lg:p-4">
                  <div className="flex items-center">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 gradient-bg rounded-full flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                      <span className="text-xs lg:text-sm font-semibold">
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary text-sm lg:text-base truncate" data-testid={`client-name-${client.id}`}>
                        {client.name}
                      </p>
                      <p className="text-xs lg:text-sm text-text-secondary truncate" data-testid={`client-sector-${client.id}`}>
                        {client.sector}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-2 lg:p-4">
                  <Badge 
                    className={`status-badge ${getClientStatus(client).className} text-xs`}
                    data-testid={`client-status-${client.id}`}
                  >
                    {getClientStatus(client).label}
                  </Badge>
                </td>
                <td className="p-2 lg:p-4 text-text-secondary text-sm lg:text-base hidden md:table-cell" data-testid={`client-source-${client.id}`}>
                  {client.source}
                </td>
                <td className="p-2 lg:p-4 hidden lg:table-cell">
                  <span 
                    className={`font-semibold text-sm ${upsellMap[client.upsellPotential || 'medium'].color}`}
                    data-testid={`client-upsell-${client.id}`}
                  >
                    {upsellMap[client.upsellPotential || 'medium'].label}
                  </span>
                </td>
                <td className="p-2 lg:p-4">
                  <div className="flex space-x-1 lg:space-x-2">
                    <button 
                      onClick={() => handleViewClient(client)}
                      className="text-blue-500 p-1"
                      data-testid={`action-view-${client.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleWhatsAppContact(client)}
                      className="text-green-500 p-1 hidden sm:block"
                      data-testid={`action-whatsapp-${client.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEmailContact(client)}
                      className="text-blue-500 p-1 hidden sm:block"
                      data-testid={`action-email-${client.id}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client)}
                      className="text-red-500 p-1 hidden sm:block"
                      data-testid={`action-delete-${client.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Client Details Modal */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] container-bg border-border-secondary">
          <DialogHeader>
            <DialogTitle className="gradient-text">Detalhes do Cliente</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-12 lg:w-16 h-12 lg:h-16 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm lg:text-lg font-semibold">
                    {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg lg:text-xl font-bold text-text-primary truncate">{selectedClient.name}</h3>
                  <p className="text-text-secondary text-sm lg:text-base truncate">{selectedClient.company}</p>
                  <Badge className={`status-badge ${getClientStatus(selectedClient).className} mt-2`}>
                    {getClientStatus(selectedClient).label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Contato</h4>
                  <p className="text-sm text-text-secondary break-all">Email: {selectedClient.email}</p>
                  <p className="text-sm text-text-secondary">Telefone: {selectedClient.phone || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Informações</h4>
                  <p className="text-sm text-text-secondary">Setor: {selectedClient.sector}</p>
                  <p className="text-sm text-text-secondary">Fonte: {selectedClient.source}</p>
                </div>
              </div>


              <div>
                <h4 className="font-semibold text-text-primary mb-2">Potencial de Upsell</h4>
                <span className={`font-semibold ${upsellMap[selectedClient.upsellPotential || 'medium'].color}`}>
                  {upsellMap[selectedClient.upsellPotential || 'medium'].label}
                </span>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleEditClient(selectedClient)}
                  className="btn-primary flex items-center gap-2"
                  data-testid="button-edit-client"
                >
                  <Edit className="w-4 h-4" />
                  Editar Cliente
                </Button>
              </div>

              {/* Projects Section */}
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Projetos do Cliente</h4>
                {clientProjects && clientProjects.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {clientProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary border border-border-secondary cursor-pointer"
                        data-testid={`client-project-${project.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{project.name}</p>
                          <p className="text-sm text-text-secondary">R$ {project.value.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`status-badge status-${project.status}`}>
                            {project.status === 'discovery' ? 'Discovery' :
                             project.status === 'development' ? 'Desenvolvimento' :
                             project.status === 'delivery' ? 'Entrega' :
                             project.status === 'post_sale' ? 'Pós-venda' :
                             project.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </Badge>
                          <ExternalLink className="w-4 h-4 text-text-secondary" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">Nenhum projeto encontrado para este cliente.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteClient}
        title="Remover Cliente"
        itemName={clientToDelete?.name || ""}
        isLoading={deleteClientMutation.isPending}
      />

      {/* Edit Client Form */}
      <ClientForm 
        open={showEditForm} 
        onOpenChange={setShowEditForm}
        clientToEdit={clientToEdit}
      />
    </div>
  );
}
