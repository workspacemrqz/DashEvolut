import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ClientTable from "@/components/clients/client-table";
import { ClientWithStats } from "@shared/schema";
import { Plus, Filter } from "lucide-react";

export default function Clients() {
  const [filter, setFilter] = useState("all");
  
  const { data: clients, isLoading } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clients"],
  });

  const filteredClients = clients?.filter(client => {
    if (filter === "all") return true;
    return client.status === filter;
  }) || [];

  const activeClients = clients?.filter(c => c.status === "active").length || 0;
  const prospects = clients?.filter(c => c.status === "prospect").length || 0;
  const avgNps = clients?.reduce((sum, c) => sum + (c.nps || 0), 0) / (clients?.length || 1);

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Gestão de Clientes" 
        subtitle="Relacionamento e análise de clientes"
        actions={
          <div className="flex space-x-3">
            <button 
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              data-testid="button-filter"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button 
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              data-testid="button-new-client"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Client Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">NPS Médio</h3>
            <div className="text-3xl font-bold text-blue-500 mb-2" data-testid="stat-avg-nps">
              {avgNps.toFixed(1)}
            </div>
            <p className="text-text-secondary">Satisfação geral</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Ativos" },
            { key: "prospect", label: "Prospects" },
            { key: "inactive", label: "Inativos" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key 
                  ? "btn-primary" 
                  : "btn-secondary"
              }`}
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
      </main>
    </div>
  );
}
