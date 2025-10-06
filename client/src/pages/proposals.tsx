import { useState } from "react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Plus } from "lucide-react";
import ProposalsTable from "@/components/proposals/proposals-table";
import ProposalEditForm from "@/components/proposals/proposal-edit-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Proposals() {
  const [proposalText, setProposalText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Remove espaços para contar caracteres
    const textWithoutSpaces = text.replace(/\s/g, '');
    
    if (textWithoutSpaces.length <= 3500) {
      setProposalText(text);
    }
  };

  const getCharacterCount = () => {
    return proposalText.replace(/\s/g, '').length;
  };

  const handleGenerateProposal = async () => {
    if (!proposalText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o texto da proposta antes de gerar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.evolutionmanagerevolutia.space/webhook/evolutiaproposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: proposalText,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Proposta enviada com sucesso!",
        });
        setProposalText("");
      } else {
        throw new Error('Erro ao enviar proposta');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar a proposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProposal = (proposalId: number) => {
    setEditingProposalId(proposalId);
  };

  const handleCloseEditForm = () => {
    setEditingProposalId(null);
  };

  // Manual proposal creation mutation
  const createManualProposalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Using default values from backend
      });

      if (!response.ok) {
        throw new Error('Failed to create proposal');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Sucesso",
        description: "Proposta criada manualmente com sucesso!",
      });
      // Open the newly created proposal for editing
      setEditingProposalId(data.id);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar a proposta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateManualProposal = () => {
    createManualProposalMutation.mutate();
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Propostas" 
        subtitle="Gerador de propostas personalizadas"
      />

      <main className="flex-1 p-3 lg:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Gerador de Propostas */}
          <Card className="container-bg border-border-secondary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-bg rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-text-primary text-2xl">
                    Gerador de Propostas
                  </CardTitle>
                  <CardDescription className="text-text-secondary text-base">
                    Crie propostas personalizadas automaticamente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="proposal-text" 
                  className="text-sm font-medium text-text-primary"
                >
                  Texto da Proposta
                </label>
                <Textarea
                  id="proposal-text"
                  placeholder="Digite aqui o texto da sua proposta..."
                  value={proposalText}
                  onChange={handleTextChange}
                  className="min-h-[200px] resize-none bg-bg-primary border-border-secondary text-text-primary placeholder:text-text-secondary"
                  maxLength={3500 + (proposalText.length - getCharacterCount())} // Ajusta para incluir espaços no limite visual
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">
                    Caracteres (sem espaços): {getCharacterCount()}/3500
                  </span>
                  {getCharacterCount() > 3000 && (
                    <span className="text-yellow-500">
                      Aproximando-se do limite
                    </span>
                  )}
                  {getCharacterCount() >= 3500 && (
                    <span className="text-red-500">
                      Limite atingido
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleGenerateProposal}
                  disabled={isLoading || !proposalText.trim() || getCharacterCount() > 3500}
                  className="btn-primary px-6 py-2 text-sm font-medium flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gerar Proposta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Propostas Criadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Propostas Criadas</h2>
              <Button
                onClick={handleCreateManualProposal}
                disabled={createManualProposalMutation.isPending}
                className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              >
                {createManualProposalMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Gerar Manualmente
                  </>
                )}
              </Button>
            </div>
            <ProposalsTable onEditProposal={handleEditProposal} />
          </div>
        </div>
      </main>

      {/* Formulário de Edição */}
      <ProposalEditForm
        proposalId={editingProposalId || 0}
        open={editingProposalId !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseEditForm();
          }
        }}
      />
    </div>
  );
}
