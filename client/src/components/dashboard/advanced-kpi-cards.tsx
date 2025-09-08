import { useQuery } from "@tanstack/react-query";
import { ProjectWithClient } from "@shared/schema";
import { ClientWithStats } from "@shared/schema";
import { SubscriptionWithClient } from "@shared/schema";
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface AdvancedKpiCardsProps {
  "data-testid"?: string;
}

export default function AdvancedKpiCards({ "data-testid": testId }: AdvancedKpiCardsProps) {
  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clients"],
  });

  const { data: subscriptions } = useQuery<SubscriptionWithClient[]>({
    queryKey: ["/api/subscriptions"],
  });

  const calculateKPIs = () => {
    if (!projects || !clients || !subscriptions) {
      return {
        mrr: 0,
        conversionRate: 0,
        avgProjectValue: 0,
        forecastAccuracy: 92,
        churnRate: 0,
        ltv: 0,
        overdueProjects: 0,
        activeSubscriptions: 0
      };
    }

    // MRR (Monthly Recurring Revenue)
    const activeSubscriptions = subscriptions.filter(s => s.status === "active");
    const mrr = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);

    // Conversion Rate (Prospects to Active)
    const prospects = clients.filter(c => !c.hasActiveSubscription).length;
    const activeClients = clients.filter(c => c.hasActiveSubscription).length;
    const conversionRate = prospects > 0 ? (activeClients / (prospects + activeClients)) * 100 : 0;

    // Average Project Value
    const totalProjectValue = projects.reduce((sum, p) => sum + p.value, 0);
    const avgProjectValue = projects.length > 0 ? totalProjectValue / projects.length : 0;

    // Overdue Projects
    const now = new Date();
    const overdueProjects = projects.filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate < now && p.status !== "completed" && p.status !== "cancelled";
    }).length;

    // Churn Rate (simplified calculation)
    const cancelledSubscriptions = subscriptions.filter(s => s.status === "cancelled").length;
    const churnRate = subscriptions.length > 0 ? (cancelledSubscriptions / subscriptions.length) * 100 : 0;

    // LTV (Lifetime Value) - simplified
    const ltv = activeClients > 0 ? (mrr * 12) / activeClients : 0;

    return {
      mrr,
      conversionRate,
      avgProjectValue,
      forecastAccuracy: 92, // From projects page
      churnRate,
      ltv,
      overdueProjects,
      activeSubscriptions: activeSubscriptions.length
    };
  };

  const kpis = calculateKPIs();

  const kpiCards = [
    {
      title: "MRR",
      value: `R$ ${kpis.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
      change: "+12.5%",
      icon: <DollarSign className="w-6 h-6" />,
      trend: "up" as const,
      color: "text-green-500",
      description: "Receita Recorrente Mensal"
    },
    {
      title: "Taxa de Conversão",
      value: `${kpis.conversionRate.toFixed(1)}%`,
      change: "+2.3%",
      icon: <Target className="w-6 h-6" />,
      trend: "up" as const,
      color: "text-blue-500",
      description: "Prospects → Clientes Ativos"
    },
    {
      title: "Valor Médio Projeto",
      value: `R$ ${kpis.avgProjectValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
      change: "+8.2%",
      icon: <TrendingUp className="w-6 h-6" />,
      trend: "up" as const,
      color: "text-purple-500",
      description: "Valor médio por projeto"
    },
    {
      title: "Precisão Previsão",
      value: `${kpis.forecastAccuracy}%`,
      change: "+1.2%",
      icon: <CheckCircle className="w-6 h-6" />,
      trend: "up" as const,
      color: "text-green-500",
      description: "Previsão vs Real"
    },
    {
      title: "Taxa de Churn",
      value: `${kpis.churnRate.toFixed(1)}%`,
      change: "-0.5%",
      icon: <TrendingDown className="w-6 h-6" />,
      trend: "down" as const,
      color: "text-green-500",
      description: "Clientes perdidos"
    },
    {
      title: "LTV Médio",
      value: `R$ ${kpis.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
      change: "+5.1%",
      icon: <Users className="w-6 h-6" />,
      trend: "up" as const,
      color: "text-blue-500",
      description: "Valor de vida do cliente"
    },
    {
      title: "Projetos Atrasados",
      value: `${kpis.overdueProjects}`,
      change: kpis.overdueProjects > 0 ? "Atenção" : "Em dia",
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: kpis.overdueProjects > 0 ? "warning" as const : "up" as const,
      color: kpis.overdueProjects > 0 ? "text-red-500" : "text-green-500",
      description: "Projetos em atraso"
    },
    {
      title: "Assinaturas Ativas",
      value: `${kpis.activeSubscriptions}`,
      change: "+3",
      icon: <Clock className="w-6 h-6" />,
      trend: "up" as const,
      color: "text-green-500",
      description: "Assinaturas ativas"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8" data-testid={testId}>
      {kpiCards.map((kpi, index) => (
        <div key={index} className="kpi-card rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">
                {kpi.title}
              </h3>
              <p className="text-xs text-text-secondary opacity-75">
                {kpi.description}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.color} bg-opacity-10`}>
              {kpi.icon}
            </div>
          </div>
          <div className="mb-2">
            <span className={`text-2xl font-bold ${kpi.color}`}>
              {kpi.value}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className={`${kpi.trend === "up" ? "text-green-500" : kpi.trend === "down" ? "text-green-500" : "text-yellow-500"} mr-2`}>
              {kpi.change}
            </span>
            <span className="text-text-secondary text-xs">vs. mês anterior</span>
          </div>
        </div>
      ))}
    </div>
  );
}
