import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ClientTable from "@/components/clients/client-table";
import ClientForm from "@/components/clients/client-form";
import { ClientWithStats } from "@shared/schema";
import { Plus, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Clients() {
  const [filter, setFilter] = useState("all");
  const [showClientForm, setShowClientForm] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const { data: clients, isLoading } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clients"],
  });

  const filteredClients = clients?.filter(client => {
    if (filter === "all") return true;
    if (filter === "active") return client.hasActiveSubscription;
    if (filter === "prospect") return !client.hasActiveSubscription;
    // Filter by sector
    if (filter === "technology") return client.sector.toLowerCase().includes("tecnologia");
    if (filter === "marketing") return client.sector.toLowerCase().includes("marketing");
    if (filter === "consultoria") return client.sector.toLowerCase().includes("consultoria");
    // Filter by source
    if (filter === "indicacao") return client.source.toLowerCase().includes("indicação");
    if (filter === "google") return client.source.toLowerCase().includes("google");
    if (filter === "linkedin") return client.source.toLowerCase().includes("linkedin");
    return true;
  }) || [];

  const activeClients = clients?.filter(c => c.hasActiveSubscription).length || 0;
  const prospects = clients?.filter(c => !c.hasActiveSubscription).length || 0;

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Gestão de Clientes" 
        subtitle="Relacionamento e análise de clientes"
        actions={
          <div className="flex space-x-2 lg:space-x-3 flex-wrap gap-2">
            <Button 
              onClick={() => setShowClientForm(true)}
              className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              data-testid="button-new-client"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Cliente</span>
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-3 lg:p-6 overflow-auto">
        {/* Client Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-6">
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Clientes Ativos</h3>
            <div className="text-3xl font-bold text-green-500 mb-2" data-testid="stat-active-clients">
              {activeClients}
            </div>
            <p className="text-text-secondary">Contratos vigentes</p>
          </div>
          
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Prospects</h3>
            <div className="text-3xl font-bold text-yellow-500 mb-2" data-testid="stat-prospects">
              {prospects}
            </div>
            <p className="text-text-secondary">Em negociação</p>
          </div>
          
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 lg:space-x-4 mb-4 lg:mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Ativos" },
            { key: "prospect", label: "Prospects" },
            { key: "inactive", label: "Inativos" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 btn-secondary text-dark-text"
              data-testid={`filter-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Clients Table */}
        <ClientTable 
          clients={filteredClients} 
          isLoading={isLoading}
          data-testid="table-clients"
        />

        {/* Client Form Modal */}
        <ClientForm 
          open={showClientForm} 
          onOpenChange={setShowClientForm}
        />
      </main>
    </div>
  );
}
