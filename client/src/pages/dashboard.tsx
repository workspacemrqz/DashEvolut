import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import KpiCard from "@/components/dashboard/kpi-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import PipelineChart from "@/components/dashboard/pipeline-chart";
import AlertsSection from "@/components/dashboard/alerts-section";
import { Analytics, ProjectWithClient, Client } from "@shared/schema";
import { TrendingUp, TrendingDown, Users, FolderOpen, DollarSign, Activity, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState("30");
  const { toast } = useToast();
  
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/unread"],
  });

  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const handleExport = () => {
    // Prepare comprehensive data for export
    const dateStr = new Date().toLocaleDateString('pt-BR');
    
    // Analytics KPIs
    const analyticsData = [
      ['DASHBOARD ANALYTICS - RELATÓRIO COMPLETO'],
      ['Data de Geração:', dateStr],
      [''],
      ['=== INDICADORES PRINCIPAIS (KPIs) ==='],
      ['Métrica', 'Valor', 'Descrição'],
      ['MRR (Receita Recorrente)', `R$ ${(analytics?.mrr || 0).toLocaleString('pt-BR')}`, 'Receita mensal recorrente'],
      ['Taxa de Churn', `${(analytics?.churnRate || 0).toFixed(1)}%`, 'Percentual de clientes perdidos'],
      ['LTV Médio por Cliente', `R$ ${(analytics?.avgLifetimeValue || 0).toLocaleString('pt-BR')}`, 'Valor de vida útil do cliente'],
      ['Projetos Ativos', analytics?.activeProjects || 0, 'Número de projetos em andamento'],
      [''],
    ];

    // Projects data
    const projectsData = [
      ['=== PROJETOS ==='],
      ['Nome do Projeto', 'Cliente', 'Status', 'Valor', 'Progresso (%)', 'Data Início', 'Data Entrega'],
    ];
    
    projects?.forEach(project => {
      projectsData.push([
        project.name,
        project.client?.name || 'N/A',
        project.status,
        `R$ ${project.value.toLocaleString('pt-BR')}`,
        `${project.progress}%`,
        new Date(project.startDate).toLocaleDateString('pt-BR'),
        new Date(project.dueDate).toLocaleDateString('pt-BR')
      ]);
    });
    
    projectsData.push(['']);

    // Clients data  
    const clientsData = [
      ['=== CLIENTES ==='],
      ['Nome', 'Email', 'Empresa', 'NPS Score', 'LTV', 'Potencial Upsell'],
    ];
    
    clients?.forEach(client => {
      clientsData.push([
        client.name,
        client.email,
        client.company || 'N/A',
        client.nps || 0,
        `R$ ${(client.ltv || 0).toLocaleString('pt-BR')}`,
        client.upsellPotential || 'Baixo'
      ]);
    });

    // Combine all data
    const allData = [...analyticsData, ...projectsData, ...clientsData];
    
    // Generate CSV with proper formatting for Excel
    const csvContent = allData.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
    
    // Add BOM for proper Excel encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `relatorio-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Relatório exportado",
      description: "Arquivo CSV gerado com sucesso. Abra no Excel para visualizar as tabelas organizadas.",
    });
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value);
    toast({
      title: "Filtro atualizado",
      description: `Dados filtrados para os últimos ${e.target.value} dias.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header 
          title="Dashboard Analytics" 
          subtitle="Visão geral do desempenho do negócio"
        />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="kpi-card rounded-xl p-6 animate-pulse">
                <div className="h-12 bg-border-secondary rounded mb-4"></div>
                <div className="h-8 bg-border-secondary rounded mb-2"></div>
                <div className="h-4 bg-border-secondary rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Dashboard Analytics" 
        subtitle="Visão geral do desempenho do negócio"
        actions={
          <div className="flex items-center space-x-2 lg:space-x-4 flex-wrap gap-2">
            <select 
              className="btn-secondary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm min-w-0 flex-shrink"
              value={timeFilter}
              onChange={handleTimeFilterChange}
              data-testid="select-time-filter"
            >
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
            </select>
            <button 
              className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              onClick={handleExport}
              data-testid="btn-export"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 p-3 lg:p-6 overflow-auto">
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <KpiCard
            title="MRR (Receita Recorrente)"
            value={`R$ ${(analytics?.mrr || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
            change="+12.5%"
            icon={<DollarSign className="w-6 h-6" />}
            trend="up"
            data-testid="kpi-mrr"
          />
          
          <KpiCard
            title="Taxa de Churn"
            value={`${(analytics?.churnRate || 0).toFixed(1)}%`}
            change="-0.5%"
            icon={<TrendingDown className="w-6 h-6" />}
            trend="down"
            data-testid="kpi-churn"
          />
          
          <KpiCard
            title="LTV por Cliente"
            value={`R$ ${(analytics?.avgLifetimeValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
            change="+8.2%"
            icon={<Users className="w-6 h-6" />}
            trend="up"
            data-testid="kpi-ltv"
          />
          
          <KpiCard
            title="Projetos Ativos"
            value={`${analytics?.activeProjects || 0}`}
            change="3 atrasados"
            icon={<FolderOpen className="w-6 h-6" />}
            trend="warning"
            data-testid="kpi-projects"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <RevenueChart data-testid="chart-revenue" />
          <PipelineChart data-testid="chart-pipeline" />
        </div>

        {/* Alerts Section */}
        <AlertsSection alerts={(alerts as any) || []} data-testid="section-alerts" />
      </main>
    </div>
  );
}
