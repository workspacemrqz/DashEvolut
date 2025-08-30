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
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="btn-secondary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
                  data-testid="button-filter-subscriptions"
                >
                  <Filter className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline text-dynamic-light">Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-content">
                <DropdownMenuLabel>Status da Assinatura</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("active")}>
                  Ativas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("paused")}>
                  Pausadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("cancelled")}>
                  Canceladas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              onClick={() => setShowSubscriptionForm(true)}
              className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              data-testid="button-create-subscription"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Nova Assinatura</span>
            </Button>
          </div>
        }
      />
      {/* Stats Cards */}
      <div className="px-4 lg:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stats-card">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-accent-primary" />
              <div>
                <p className="text-text-secondary text-sm">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-text-primary">{activeSubscriptions}</p>
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-accent-primary" />
              <div>
                <p className="text-text-secondary text-sm">Receita Mensal</p>
                <p className="text-2xl font-bold text-text-primary">
                  R$ {totalMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-error" />
              <div>
                <p className="text-text-secondary text-sm">Em Atraso</p>
                <p className="text-2xl font-bold text-text-primary">{overdueSubscriptions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Subscriptions Table */}
      <div className="flex-1 px-4 lg:px-6 pb-6">
        {!isLoading && filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-neutral mx-auto mb-4" />
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