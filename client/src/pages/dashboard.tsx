import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import KpiCard from "@/components/dashboard/kpi-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import PipelineChart from "@/components/dashboard/pipeline-chart";
import AlertsSection from "@/components/dashboard/alerts-section";
import { Analytics } from "@shared/schema";
import { TrendingUp, TrendingDown, Users, FolderOpen, DollarSign, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts/unread"],
  });

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
          <div className="flex items-center space-x-4">
            <select className="btn-secondary px-4 py-2 rounded-lg text-sm">
              <option>Últimos 30 dias</option>
              <option>Últimos 90 dias</option>
              <option>Último ano</option>
            </select>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
              Exportar
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data-testid="chart-revenue" />
          <PipelineChart data-testid="chart-pipeline" />
        </div>

        {/* Alerts Section */}
        <AlertsSection alerts={alerts || []} data-testid="section-alerts" />
      </main>
    </div>
  );
}
