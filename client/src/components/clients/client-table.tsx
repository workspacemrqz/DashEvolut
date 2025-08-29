import { ClientWithStats } from "@shared/schema";
import { Eye, MessageCircle, Mail, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
                      className="text-blue-500 hover:text-blue-400 p-1"
                      data-testid={`action-view-${client.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-green-500 hover:text-green-400 p-1"
                      data-testid={`action-whatsapp-${client.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button 
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
    </div>
  );
}
