import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import SubscriptionForm from "../components/subscriptions/subscription-form";
import SubscriptionTable from "../components/subscriptions/subscription-table";
import PaymentForm from "../components/subscriptions/payment-form";
import { SubscriptionWithClient } from "@shared/schema";
import { Plus, Filter, DollarSign, Calendar, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Subscriptions() {
  const [filter, setFilter] = useState("all");
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const { data: subscriptions, isLoading } = useQuery<SubscriptionWithClient[]>({
    queryKey: ["/api/subscriptions"],
  });

  // Debug log
  console.log('🔍 [FRONTEND] Subscriptions data:', subscriptions);
  console.log('🔍 [FRONTEND] Is loading:', isLoading);

  const filteredSubscriptions = subscriptions?.filter(subscription => {
    if (filter === "all") return true;
    return subscription.status === filter;
  }) || [];

  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const totalMonthlyRevenue = subscriptions
    ?.filter(s => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0) || 0;
  
  // Calculate overdue subscriptions (next billing date is in the past)
  const now = new Date();
  const overdueSubscriptions = subscriptions?.filter(s => 
    s.status === "active" && s.nextBillingDate < now
  ).length || 0;

  const handlePaymentClick = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowPaymentForm(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Gestão de Assinaturas" 
        subtitle="Controle de assinaturas e pagamentos recorrentes"
        actions={
          <div className="flex space-x-2 lg:space-x-3 flex-wrap gap-2">
            
            <Button
              onClick={() => setShowSubscriptionForm(true)}
              className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              data-testid="button-create-subscription"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Assinatura</span>
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-3 lg:p-6 overflow-auto">
        {/* Subscription KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-6">
          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Assinaturas Ativas</h3>
            <div className="text-2xl font-bold text-blue-500 mb-1" data-testid="kpi-active-subscriptions">
              {activeSubscriptions}
            </div>
            <p className="text-sm text-text-secondary">Em andamento</p>
          </div>

          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Receita Mensal</h3>
            <div className="text-2xl font-bold text-text-primary" data-testid="kpi-monthly-revenue">
              R$ {totalMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-text-secondary">Total das assinaturas</p>
          </div>

          <div className="kpi-card rounded-xl p-6">
            <h3 className="text-sm font-medium mb-2 text-text-secondary">Em Atraso</h3>
            <div className="text-2xl font-bold text-red-500 mb-1" data-testid="kpi-overdue-subscriptions">
              {overdueSubscriptions}
            </div>
            <p className="text-sm text-text-secondary">Pagamentos pendentes</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 lg:space-x-4 mb-4 lg:mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Todas" },
            { key: "active", label: "Ativas" },
            { key: "paused", label: "Pausadas" },
            { key: "cancelled", label: "Canceladas" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                filter === tab.key 
                  ? 'btn-primary' 
                  : 'btn-secondary text-dark-text'
              }`}
              data-testid={`filter-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subscriptions Table */}
        <div className="mb-8">
          {!isLoading && filteredSubscriptions.length === 0 ? (
            <div className="container-bg rounded-xl border border-border-secondary p-12 text-center">
              <DollarSign className="h-16 w-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {filter === "all" ? "Nenhuma assinatura encontrada" : `Nenhuma assinatura ${filter} encontrada`}
              </h3>
              <p className="text-text-secondary mb-6">
                {filter === "all" 
                  ? "Comece criando sua primeira assinatura recorrente."
                  : "Ajuste os filtros ou crie uma nova assinatura."
                }
              </p>
              <Button
                onClick={() => setShowSubscriptionForm(true)}
                className="btn-primary"
                data-testid="button-create-first-subscription"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Assinatura
              </Button>
            </div>
          ) : (
            <SubscriptionTable
              subscriptions={filteredSubscriptions}
              isLoading={isLoading}
              onPaymentClick={handlePaymentClick}
              data-testid="subscriptions-table"
            />
          )}
        </div>
      </main>
      {/* Forms */}
      <SubscriptionForm
        open={showSubscriptionForm}
        onOpenChange={setShowSubscriptionForm}
      />
      <PaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        subscriptionId={selectedSubscriptionId}
      />
    </div>
  );
}