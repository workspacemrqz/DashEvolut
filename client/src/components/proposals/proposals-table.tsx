import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, RefreshCw, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Proposal {
  id: number;
  titulo: string;
  codigo: string;
  link: string;
}

interface ProposalsTableProps {
  onEditProposal?: (proposalId: number) => void;
}

export default function ProposalsTable({ onEditProposal }: ProposalsTableProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: proposals, isLoading, error, refetch } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleViewProposal = (link: string) => {
    window.open(link, '_blank');
  };

  const handleEditProposal = (proposalId: number) => {
    if (onEditProposal) {
      onEditProposal(proposalId);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Lista atualizada",
        description: "Propostas atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar as propostas.",
        variant: "destructive",
      });
    } finally {
      // Adiciona um pequeno delay para mostrar a animação
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/proposals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Sucesso",
        description: "Proposta excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir a proposta.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProposal = (proposalId: number) => {
    if (confirm("Tem certeza que deseja excluir esta proposta?")) {
      deleteMutation.mutate(proposalId);
    }
  };

  if (error) {
    return (
      <Card className="container-bg border-border-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-bg rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-text-primary text-xl">
                  Propostas Criadas
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Lista de todas as propostas geradas
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <FileText className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Erro ao carregar propostas
            </h3>
            <p className="text-text-secondary mb-4">
              Não foi possível conectar ao banco de dados das propostas.
            </p>
            <Button 
              onClick={handleRefresh} 
              className="btn-primary" 
              style={{ color: '#F5F5F5' }}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: '#F5F5F5' }} />
              {isRefreshing ? 'Tentando...' : 'Tentar novamente'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="container-bg border-border-secondary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 gradient-bg rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-text-primary text-xl">
                Propostas Criadas
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Lista de todas as propostas geradas
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="btn-secondary proposal-btn-update"
            data-proposal-button="update"
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: '#060606' }} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border border-border-secondary rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-border-secondary rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-border-secondary rounded w-1/4"></div>
                  </div>
                  <div className="h-8 bg-border-secondary rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-3">
            {proposals.map((proposal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border-secondary rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-medium truncate mb-1">
                    {proposal.titulo || 'Proposta sem título'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Código: {proposal.codigo}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleEditProposal(proposal.id)}
                    size="sm"
                    variant="outline"
                    className="btn-secondary proposal-btn-edit flex items-center gap-2"
                    data-proposal-button="edit"
                    data-testid={`button-edit-${proposal.id}`}
                  >
                    <Edit className="w-4 h-4" style={{ color: '#060606' }} />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteProposal(proposal.id)}
                    size="sm"
                    variant="outline"
                    className="btn-secondary proposal-btn-delete flex items-center gap-2"
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${proposal.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Apagar
                  </Button>
                  <Button
                    onClick={() => handleViewProposal(proposal.link)}
                    size="sm"
                    className="btn-primary flex items-center gap-2"
                    style={{ color: '#F5F5F5' }}
                    data-testid={`button-view-${proposal.id}`}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: '#F5F5F5' }} />
                    Ver Proposta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-text-secondary mb-2">
              <FileText className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Nenhuma proposta encontrada
            </h3>
            <p className="text-text-secondary">
              Ainda não há propostas geradas. Crie sua primeira proposta acima.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
