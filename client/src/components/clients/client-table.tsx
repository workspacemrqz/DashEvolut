import { ClientWithStats } from "@shared/schema";
import { Eye, MessageCircle, Mail, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ClientTableProps {
  clients: ClientWithStats[];
  isLoading: boolean;
  "data-testid"?: string;
}

const statusMap = {
  active: { label: "Ativo", className: "status-active" },
  inactive: { label: "Inativo", className: "status-inactive" },
  prospect: { label: "Prospect", className: "status-prospect" },
};

const upsellMap = {
  low: { label: "Baixo", color: "text-gray-500" },
  medium: { label: "Médio", color: "text-yellow-500" },
  high: { label: "Alto", color: "text-green-500" },
};

export default function ClientTable({ clients, isLoading, "data-testid": testId }: ClientTableProps) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  const handleViewClient = (client: ClientWithStats) => {
    setSelectedClient(client);
    setShowClientDetails(true);
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-secondary">
              <th className="text-left p-4 font-semibold text-text-primary">Cliente</th>
              <th className="text-left p-4 font-semibold text-text-primary">Status</th>
              <th className="text-left p-4 font-semibold text-text-primary">Fonte</th>
              <th className="text-left p-4 font-semibold text-text-primary">NPS</th>
              <th className="text-left p-4 font-semibold text-text-primary">LTV</th>
              <th className="text-left p-4 font-semibold text-text-primary">Upsell</th>
              <th className="text-left p-4 font-semibold text-text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border-secondary">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold">
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary" data-testid={`client-name-${client.id}`}>
                        {client.name}
                      </p>
                      <p className="text-sm text-text-secondary" data-testid={`client-sector-${client.id}`}>
                        {client.sector}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge 
                    className={`status-badge ${statusMap[client.status].className}`}
                    data-testid={`client-status-${client.id}`}
                  >
                    {statusMap[client.status].label}
                  </Badge>
                </td>
                <td className="p-4 text-text-secondary" data-testid={`client-source-${client.id}`}>
                  {client.source}
                </td>
                <td className="p-4">
                  {client.nps ? (
                    <div className="flex items-center">
                      <span 
                        className={`font-semibold ${client.nps >= 8 ? 'text-green-500' : client.nps >= 6 ? 'text-yellow-500' : 'text-red-500'}`}
                        data-testid={`client-nps-${client.id}`}
                      >
                        {client.nps.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-text-secondary">N/A</span>
                  )}
                </td>
                <td className="p-4 text-text-primary" data-testid={`client-ltv-${client.id}`}>
                  R$ {client.ltv?.toLocaleString('pt-BR') || '0'}
                </td>
                <td className="p-4">
                  <span 
                    className={`font-semibold ${upsellMap[client.upsellPotential || 'medium'].color}`}
                    data-testid={`client-upsell-${client.id}`}
                  >
                    {upsellMap[client.upsellPotential || 'medium'].label}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewClient(client)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      data-testid={`action-view-${client.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleWhatsAppContact(client)}
                      className="text-green-500 hover:text-green-400 p-1"
                      data-testid={`action-whatsapp-${client.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEmailContact(client)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      data-testid={`action-email-${client.id}`}
                    >
                      <Mail className="w-4 h-4" />
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
        <DialogContent className="sm:max-w-[500px] container-bg border-border-secondary">
          <DialogHeader>
            <DialogTitle className="gradient-text">Detalhes do Cliente</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{selectedClient.name}</h3>
                  <p className="text-text-secondary">{selectedClient.company}</p>
                  <Badge className={`status-badge ${statusMap[selectedClient.status].className} mt-2`}>
                    {statusMap[selectedClient.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Contato</h4>
                  <p className="text-sm text-text-secondary">Email: {selectedClient.email}</p>
                  <p className="text-sm text-text-secondary">Telefone: {selectedClient.phone || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Informações</h4>
                  <p className="text-sm text-text-secondary">Setor: {selectedClient.sector}</p>
                  <p className="text-sm text-text-secondary">Fonte: {selectedClient.source}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-text-primary">NPS</h4>
                  <p className={`text-2xl font-bold ${selectedClient.nps ? selectedClient.nps >= 8 ? 'text-green-500' : selectedClient.nps >= 6 ? 'text-yellow-500' : 'text-red-500' : 'text-text-secondary'}`}>
                    {selectedClient.nps?.toFixed(1) || "N/A"}
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-text-primary">LTV</h4>
                  <p className="text-2xl font-bold text-text-primary">
                    R$ {selectedClient.ltv?.toLocaleString('pt-BR') || '0'}
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-text-primary">Projetos</h4>
                  <p className="text-2xl font-bold text-text-primary">{selectedClient.projectCount}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">Potencial de Upsell</h4>
                <span className={`font-semibold ${upsellMap[selectedClient.upsellPotential || 'medium'].color}`}>
                  {upsellMap[selectedClient.upsellPotential || 'medium'].label}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
