import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ClientTable from "@/components/clients/client-table";
import ClientForm from "@/components/clients/client-form";
import { ClientWithStats } from "@shared/schema";
import { Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Clients() {
  const [filter, setFilter] = useState("all");
  const [showClientForm, setShowClientForm] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const { data: clients, isLoading } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clientes"],
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
    <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
      <Header 
        title="Gestão de Clientes" 
        subtitle="Relacionamento e análise de clientes"
        actions={
          <Button 
            onClick={() => setShowClientForm(true)}
            className="btn-primary px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
            data-testid="button-new-client"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Cliente</span>
          </Button>
        }
      />
      <main className="flex-1 p-3 lg:p-6 overflow-y-auto overflow-x-hidden">
        {/* Client Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-6 w-full">
          <div className="kpi-card rounded-xl p-4 sm:p-6 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-text-primary">Clientes Ativos</h3>
            <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1 sm:mb-2" data-testid="stat-active-clients">
              {activeClients}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">Contratos vigentes</p>
          </div>
          
          <div className="kpi-card rounded-xl p-4 sm:p-6 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-text-primary">Prospects</h3>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-1 sm:mb-2" data-testid="stat-prospects">
              {prospects}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">Em negociação</p>
          </div>

          <div className="kpi-card rounded-xl p-4 sm:p-6 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-text-primary">Total de Clientes</h3>
            <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1 sm:mb-2" data-testid="stat-total-clients">
              {clients?.length || 0}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">Base completa</p>
          </div>
          
        </div>

        {/* Filter Dropdown */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
              Status:
            </label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger 
                className="w-full sm:w-[180px] bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0 data-[state=open]:border-border/50"
                data-testid="filter-status"
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0">
                <SelectItem 
                  value="all" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-all"
                >
                  Todos
                </SelectItem>
                <SelectItem 
                  value="active" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-active"
                >
                  Ativos
                </SelectItem>
                <SelectItem 
                  value="prospect" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-prospect"
                >
                  Prospects
                </SelectItem>
                <SelectItem 
                  value="inactive" 
                  className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0"
                  data-testid="filter-inactive"
                >
                  Inativos
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
