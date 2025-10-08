import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, FileText, Target, Package, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProposalData {
  id: number;
  p1_titulo: string;
  p1_subtitulo: string;
  p1_tags: string;
  p2_subtitulo: string;
  p2_texto: string;
  p2_objetivos: string;
  p2_diferenciais: string;
  p3_titulo_da_entrega: string;
  p3_checklist: string;
  p4_preco: string;
  p4_entrega: string;
  p4_detalhamento: string;
  senha: string;
  url: string;
  audio: string;
}

interface ProposalEditFormProps {
  proposalId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Custom DialogContent without the X button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

export default function ProposalEditForm({ proposalId, open, onOpenChange }: ProposalEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<ProposalData>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch proposal data
  const { data: proposal, isLoading } = useQuery<ProposalData>({
    queryKey: [`/api/propostas/${proposalId}`],
    enabled: !!proposalId,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ProposalData>) => {
      const response = await fetch(`/api/propostas/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update proposal');
      }

      return response.json();
    },
          onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
        toast({
          title: "Sucesso",
          description: "Proposta atualizada com sucesso!",
        });
        onOpenChange(false);
      },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar a proposta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update form data when proposal is loaded
  useEffect(() => {
    if (proposal) {
      setFormData({
        ...proposal,
        p1_tags: jsonArrayToText(proposal.p1_tags),
        p2_objetivos: jsonArrayToText(proposal.p2_objetivos),
        p2_diferenciais: jsonArrayToText(proposal.p2_diferenciais),
        p3_checklist: jsonArrayToText(proposal.p3_checklist),
        p4_detalhamento: jsonArrayToText(proposal.p4_detalhamento),
      });
    }
  }, [proposal]);

  // Apply active tab color via JavaScript
  useEffect(() => {
    const applyActiveTabColor = () => {
      if (tabsRef.current) {
        // Find all tabs (both active and inactive)
        const allTabs = tabsRef.current.querySelectorAll('[role="tab"]');
        
        allTabs.forEach(tab => {
          const isActive = tab.getAttribute('data-state') === 'active';
          
          if (isActive) {
            // Apply dark color to active tab
            (tab as HTMLElement).style.color = '#060606';
            (tab as HTMLElement).style.setProperty('color', '#060606', 'important');
            
            // Apply dark color to all child elements (text and icons)
            const children = tab.querySelectorAll('*');
            children.forEach(child => {
              (child as HTMLElement).style.color = '#060606';
              (child as HTMLElement).style.setProperty('color', '#060606', 'important');
            });
          } else {
            // Reset inactive tabs to default color
            (tab as HTMLElement).style.color = '';
            (tab as HTMLElement).style.removeProperty('color');
            
            const children = tab.querySelectorAll('*');
            children.forEach(child => {
              (child as HTMLElement).style.color = '';
              (child as HTMLElement).style.removeProperty('color');
            });
          }
        });
      }
    };

    // Apply immediately
    applyActiveTabColor();

    // Set up observer to watch for tab changes
    const observer = new MutationObserver(applyActiveTabColor);
    if (tabsRef.current) {
      observer.observe(tabsRef.current, {
        attributes: true,
        attributeFilter: ['data-state'],
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [open]);

  const handleInputChange = (field: keyof ProposalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para converter JSON array para texto editável
  const jsonArrayToText = (jsonString: string | null | undefined): string => {
    if (!jsonString) return '';
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        return parsed.join('\n');
      }
      return jsonString;
    } catch {
      return jsonString;
    }
  };

  // Função para converter texto editável para JSON array
  const textToJsonArray = (text: string): string => {
    if (!text.trim()) return '[]';
    const lines = text.split('\n').filter(line => line.trim());
    return JSON.stringify(lines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter campos de array de volta para JSON
    const dataToSubmit = {
      ...formData,
      p1_tags: textToJsonArray(formData.p1_tags || ''),
      p2_objetivos: textToJsonArray(formData.p2_objetivos || ''),
      p2_diferenciais: textToJsonArray(formData.p2_diferenciais || ''),
      p3_checklist: textToJsonArray(formData.p3_checklist || ''),
      p4_detalhamento: textToJsonArray(formData.p4_detalhamento || ''),
    };
    
    updateMutation.mutate(dataToSubmit);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <CustomDialogContent className="sm:max-w-[800px] container-bg border-border-secondary max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Carregando Proposta</DialogTitle>
          <DialogDescription className="sr-only">
            Carregando dados da proposta para edição
          </DialogDescription>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CustomDialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[800px] container-bg border-border-secondary max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="gradient-text">Editar Proposta</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                form="proposal-edit-form"
                disabled={updateMutation.isPending}
                className="btn-primary"
                data-testid="button-submit-proposal"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
          <DialogDescription className="text-text-secondary">
            Edite os dados da proposta em etapas organizadas
          </DialogDescription>
        </DialogHeader>
        
        <form id="proposal-edit-form" onSubmit={handleSubmit}>
          <Tabs ref={tabsRef} defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-bg-secondary border border-border-secondary">
              <TabsTrigger 
                value="basic" 
                className="data-[state=active]:bg-light-bg text-xs lg:text-sm"
              >
                <FileText className="w-4 h-4 mr-1 lg:mr-2" />
                Básico
              </TabsTrigger>
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:bg-light-bg text-xs lg:text-sm"
              >
                <Target className="w-4 h-4 mr-1 lg:mr-2" />
                Descrição
              </TabsTrigger>
              <TabsTrigger 
                value="delivery" 
                className="data-[state=active]:bg-light-bg text-xs lg:text-sm"
              >
                <Package className="w-4 h-4 mr-1 lg:mr-2" />
                Entrega
              </TabsTrigger>
              <TabsTrigger 
                value="pricing" 
                className="data-[state=active]:bg-light-bg text-xs lg:text-sm"
              >
                <DollarSign className="w-4 h-4 mr-1 lg:mr-2" />
                Preços
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="p1_titulo">Título</Label>
                    <Input
                      id="p1_titulo"
                      value={formData.p1_titulo || ''}
                      onChange={(e) => handleInputChange('p1_titulo', e.target.value)}
                      placeholder="Título da proposta"
                      className="bg-bg-primary border-border-secondary text-text-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="p1_subtitulo">Subtítulo</Label>
                    <Input
                      id="p1_subtitulo"
                      value={formData.p1_subtitulo || ''}
                      onChange={(e) => handleInputChange('p1_subtitulo', e.target.value)}
                      placeholder="Subtítulo da proposta"
                      className="bg-bg-primary border-border-secondary text-text-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="p1_tags">Tags</Label>
                  <Textarea
                    id="p1_tags"
                    value={formData.p1_tags || ''}
                    onChange={(e) => handleInputChange('p1_tags', e.target.value)}
                    placeholder="Digite cada tag em uma linha separada&#10;Exemplo:&#10;Automação&#10;Inteligência Artificial&#10;WhatsApp"
                    rows={4}
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Digite cada tag em uma linha separada
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="description" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Descrição da Proposta</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="p2_subtitulo">Subtítulo</Label>
                  <Input
                    id="p2_subtitulo"
                    value={formData.p2_subtitulo || ''}
                    onChange={(e) => handleInputChange('p2_subtitulo', e.target.value)}
                    placeholder="Subtítulo da seção 2"
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="p2_texto">Texto</Label>
                  <Textarea
                    id="p2_texto"
                    value={formData.p2_texto || ''}
                    onChange={(e) => handleInputChange('p2_texto', e.target.value)}
                    placeholder="Texto da seção 2"
                    rows={4}
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="p2_objetivos">Objetivos</Label>
                  <Textarea
                    id="p2_objetivos"
                    value={formData.p2_objetivos || ''}
                    onChange={(e) => handleInputChange('p2_objetivos', e.target.value)}
                    placeholder="Digite cada objetivo em uma linha separada&#10;Exemplo:&#10;Reduzir custos operacionais&#10;Automatizar processos&#10;Melhorar eficiência"
                    rows={4}
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Digite cada objetivo em uma linha separada
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="p2_diferenciais">Diferenciais</Label>
                  <Textarea
                    id="p2_diferenciais"
                    value={formData.p2_diferenciais || ''}
                    onChange={(e) => handleInputChange('p2_diferenciais', e.target.value)}
                    placeholder="Digite cada diferencial em uma linha separada&#10;Exemplo:&#10;Especialistas em IA&#10;Implantação rápida&#10;Suporte 24/7"
                    rows={4}
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Digite cada diferencial em uma linha separada
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Entrega do Projeto</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="p3_titulo_da_entrega">Título da Entrega</Label>
                  <Input
                    id="p3_titulo_da_entrega"
                    value={formData.p3_titulo_da_entrega || ''}
                    onChange={(e) => handleInputChange('p3_titulo_da_entrega', e.target.value)}
                    placeholder="Título da entrega"
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="p3_checklist">Checklist</Label>
                  <Textarea
                    id="p3_checklist"
                    value={formData.p3_checklist || ''}
                    onChange={(e) => handleInputChange('p3_checklist', e.target.value)}
                    placeholder="Digite cada item do checklist em uma linha separada&#10;Exemplo:&#10;Análise de requisitos&#10;Desenvolvimento da solução&#10;Testes e validação&#10;Treinamento da equipe"
                    rows={5}
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Digite cada item do checklist em uma linha separada
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Preços e Detalhes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="p4_preco">Preço</Label>
                    <Input
                      id="p4_preco"
                      value={formData.p4_preco || ''}
                      onChange={(e) => handleInputChange('p4_preco', e.target.value)}
                      placeholder="Preço da proposta"
                      className="bg-bg-primary border-border-secondary text-text-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="p4_entrega">Entrega</Label>
                    <Input
                      id="p4_entrega"
                      value={formData.p4_entrega || ''}
                      onChange={(e) => handleInputChange('p4_entrega', e.target.value)}
                      placeholder="Prazo de entrega"
                      className="bg-bg-primary border-border-secondary text-text-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="p4_detalhamento">Detalhamento</Label>
                  <Textarea
                    id="p4_detalhamento"
                    value={formData.p4_detalhamento || ''}
                    onChange={(e) => handleInputChange('p4_detalhamento', e.target.value)}
                    placeholder="Digite cada item do detalhamento em uma linha separada&#10;Exemplo:&#10;Análise completa do sistema&#10;Desenvolvimento personalizado&#10;Testes de qualidade&#10;Treinamento da equipe&#10;Suporte pós-implantação"
                    rows={5}
                    className="bg-bg-primary border-border-secondary text-text-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Digite cada item do detalhamento em uma linha separada
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

        </form>
      </CustomDialogContent>
    </Dialog>
  );
}
