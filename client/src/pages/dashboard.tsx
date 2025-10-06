import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { ProjectWithClient, ClientWithStats, SubscriptionWithClient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import NotificationsSection from "@/components/dashboard/notifications-section";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: projects, isLoading } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clients"],
  });

  const { data: subscriptions } = useQuery<SubscriptionWithClient[]>({
    queryKey: ["/api/subscriptions"],
  });


  // Métricas essenciais
  const calculateMetrics = () => {
    if (!projects || !clients || !subscriptions) return null;

    const now = new Date();
    const activeProjects = projects.filter(p => p.status !== "completed" && p.status !== "cancelled").length;
    const overdueProjects = projects.filter(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate < now && p.status !== "completed" && p.status !== "cancelled";
    }).length;

    const activeClients = clients.filter(c => c.hasActiveSubscription).length;
    const prospects = clients.filter(c => !c.hasActiveSubscription).length;
    
    const activeSubscriptions = subscriptions.filter(s => s.status === "active");
    const mrr = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);

    const totalProjectValue = projects.reduce((sum, p) => sum + p.value, 0);
    const activePipelineValue = projects
      .filter(p => p.status !== "completed" && p.status !== "cancelled")
      .reduce((sum, p) => sum + p.value, 0);

    return {
      activeProjects,
      overdueProjects,
      activeClients,
      prospects,
      mrr,
      totalProjectValue,
      activePipelineValue,
      activeSubscriptions: activeSubscriptions.length
    };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" subtitle="Carregando dados..." />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Analisando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Dashboard" 
        subtitle="Visão geral dos principais indicadores"
      />

      <main className="flex-1 p-6 overflow-auto">
        {/* Métricas Essenciais */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="kpi-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{metrics.activeProjects}</div>
              <div className="text-sm text-gray-300">Projetos em andamento</div>
              {metrics.overdueProjects > 0 && (
                <div className="text-xs text-red-400 mt-1">{metrics.overdueProjects} atrasados</div>
              )}
            </div>
            <div className="kpi-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{metrics.activeClients}</div>
              <div className="text-sm text-gray-300">Clientes Ativos</div>
              {metrics.prospects > 0 && (
                <div className="text-xs text-yellow-400 mt-1">{metrics.prospects} prospects</div>
              )}
            </div>
            <div className="kpi-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">R$ {metrics.totalProjectValue.toLocaleString('pt-BR')}</div>
              <div className="text-sm text-gray-300">
                Faturamento
              </div>
              <Badge variant="secondary" className="text-xs px-1.5 py-0 mt-1">Projetos</Badge>
            </div>
            <div className="kpi-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-300">{metrics.activeSubscriptions}</div>
              <div className="text-sm text-gray-300">Assinaturas Ativas</div>
              <div className="text-xs text-green-400 mt-1">R$ {metrics.mrr.toLocaleString('pt-BR')}/mês</div>
            </div>
          </div>
        )}

        {/* Seção de Notificações */}
        <div className="mb-8">
          <NotificationsSection data-testid="notifications-section" />
        </div>

      </main>
    </div>
  );
}
