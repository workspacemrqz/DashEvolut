import { useQuery } from "@tanstack/react-query";
import { FileText, Send, Clock, TrendingUp } from "lucide-react";

interface ProposalsInsightsProps {
  "data-testid"?: string;
}

// Mock data for proposals since we don't have a proposals API endpoint yet
const mockProposalsData = [
  { id: 1, text: "Proposta para desenvolvimento de sistema...", createdAt: "2024-01-15", status: "sent" },
  { id: 2, text: "Proposta para consultoria em marketing...", createdAt: "2024-01-20", status: "draft" },
  { id: 3, text: "Proposta para projeto de tecnologia...", createdAt: "2024-01-25", status: "sent" },
  { id: 4, text: "Proposta para serviços de consultoria...", createdAt: "2024-02-01", status: "sent" },
  { id: 5, text: "Proposta para desenvolvimento web...", createdAt: "2024-02-05", status: "draft" },
];

export default function ProposalsInsights({ "data-testid": testId }: ProposalsInsightsProps) {
  // For now, we'll use mock data since proposals don't have a proper API endpoint
  const proposals = mockProposalsData;

  const calculateProposalsMetrics = () => {
    const totalProposals = proposals.length;
    const sentProposals = proposals.filter(p => p.status === "sent").length;
    const draftProposals = proposals.filter(p => p.status === "draft").length;
    
    // Calculate average character count
    const avgCharacterCount = proposals.reduce((sum, p) => sum + p.text.length, 0) / totalProposals;
    
    // Calculate proposals per month (mock calculation)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthProposals = proposals.filter(p => {
      const proposalDate = new Date(p.createdAt);
      return proposalDate.getMonth() === currentMonth && proposalDate.getFullYear() === currentYear;
    }).length;

    return {
      totalProposals,
      sentProposals,
      draftProposals,
      avgCharacterCount: Math.round(avgCharacterCount),
      thisMonthProposals,
      conversionRate: totalProposals > 0 ? (sentProposals / totalProposals * 100) : 0
    };
  };

  const metrics = calculateProposalsMetrics();

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Insights de Propostas</h3>
        <p className="text-sm text-text-secondary">Análise de propostas geradas e enviadas</p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500 mb-1">
            {metrics.totalProposals}
          </div>
          <div className="text-sm text-text-secondary">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">
            {metrics.sentProposals}
          </div>
          <div className="text-sm text-text-secondary">Enviadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500 mb-1">
            {metrics.draftProposals}
          </div>
          <div className="text-sm text-text-secondary">Rascunhos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500 mb-1">
            {metrics.thisMonthProposals}
          </div>
          <div className="text-sm text-text-secondary">Este Mês</div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Taxa de Envio</div>
                <div className="text-xs text-text-secondary">Propostas enviadas vs total</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-500">
                {metrics.conversionRate.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Tamanho Médio</div>
                <div className="text-xs text-text-secondary">Caracteres por proposta</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-500">
                {metrics.avgCharacterCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Status das Propostas</div>
                <div className="text-xs text-text-secondary">Distribuição atual</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Enviadas</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${metrics.conversionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{metrics.sentProposals}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Rascunhos</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full" 
                      style={{ width: `${100 - metrics.conversionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{metrics.draftProposals}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className="mt-6 pt-4 border-t border-border-secondary">
        <h4 className="text-md font-medium text-text-primary mb-3">Propostas Recentes</h4>
        <div className="space-y-2">
          {proposals.slice(0, 3).map((proposal) => (
            <div key={proposal.id} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  proposal.status === "sent" ? "bg-green-500" : "bg-yellow-500"
                }`}></div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {proposal.text.substring(0, 50)}...
                  </div>
                  <div className="text-xs text-text-secondary">
                    {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                proposal.status === "sent" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}>
                {proposal.status === "sent" ? "Enviada" : "Rascunho"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
