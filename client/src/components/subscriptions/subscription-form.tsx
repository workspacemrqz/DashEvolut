import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { insertSubscriptionSchema, type InsertSubscription, type SubscriptionWithClient, type ClientWithStats, type SubscriptionCredential, type SubscriptionFile, type InsertSubscriptionCredential } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Plus, Edit, Trash2, Download, Upload, Key, FileText } from "lucide-react";

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionWithClient | null;
}

interface CredentialFormData {
  id?: string;
  plataforma: string;
  login: string;
  senha: string;
  secrets: string;
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
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

const formSchema = insertSubscriptionSchema.extend({
  billingDay: insertSubscriptionSchema.shape.billingDay.refine(
    (day) => day >= 1 && day <= 31,
    { message: "O dia de cobrança deve estar entre 1 e 31" }
  ),
  amount: insertSubscriptionSchema.shape.amount.refine(
    (amount) => amount > 0,
    { message: "O valor deve ser maior que zero" }
  ),
});

export default function SubscriptionForm({ open, onOpenChange, subscription }: SubscriptionFormProps) {
  const { toast } = useToast();
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  
  // Credentials state
  const [credentials, setCredentials] = useState<CredentialFormData[]>([]);
  const [credentialsToDelete, setCredentialsToDelete] = useState<string[]>([]);
  const [editingCredential, setEditingCredential] = useState<CredentialFormData | null>(null);
  const [showCredentialDialog, setShowCredentialDialog] = useState(false);
  
  // Files state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<SubscriptionFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const { data: allClients, isLoading: loadingClients } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clientes"],
  });

  const form = useForm<InsertSubscription>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: subscription?.clientId || "",
      billingDay: subscription?.billingDay || 1,
      amount: subscription?.amount || 0,
      notes: subscription?.notes || "",
      status: subscription?.status || "active",
    },
  });

  // Fetch existing credentials and files when editing
  useEffect(() => {
    if (subscription?.id) {
      // Fetch credentials
      fetch(`/api/assinaturas/${subscription.id}/credenciais`)
        .then(res => res.json())
        .then(data => setCredentials(data))
        .catch(err => console.error("Error fetching credentials:", err));
      
      // Fetch files
      fetch(`/api/assinaturas/${subscription.id}/arquivos`)
        .then(res => res.json())
        .then(data => setExistingFiles(data))
        .catch(err => console.error("Error fetching files:", err));
    }
  }, [subscription?.id]);

  const subscriptionMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const url = subscription 
        ? `/api/assinaturas/${subscription.id}` 
        : "/api/assinaturas";
      
      const method = subscription ? "PATCH" : "POST";
      
      // Submit core subscription data
      const response = await apiRequest<SubscriptionWithClient>(url, {
        method,
        body: JSON.stringify(data),
      });
      
      return response;
    },
    onSuccess: async (savedSubscription) => {
      try {
        const subscriptionId = savedSubscription.id;
        
        // Handle credentials
        // Delete removed credentials
        for (const credId of credentialsToDelete) {
          await apiRequest(`/api/credenciais-assinatura/${credId}`, {
            method: "DELETE",
          });
        }
        
        // Create or update credentials
        for (const cred of credentials) {
          if (cred.id && !cred.id.startsWith('temp-')) {
            // Update existing
            await apiRequest(`/api/credenciais-assinatura/${cred.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                plataforma: cred.plataforma,
                login: cred.login,
                senha: cred.senha,
                secrets: cred.secrets,
              }),
            });
          } else {
            // Create new
            await apiRequest(`/api/assinaturas/${subscriptionId}/credenciais`, {
              method: "POST",
              body: JSON.stringify({
                plataforma: cred.plataforma,
                login: cred.login,
                senha: cred.senha,
                secrets: cred.secrets,
              }),
            });
          }
        }
        
        // Handle files
        // Delete removed files
        for (const fileId of filesToDelete) {
          await apiRequest(`/api/arquivos-assinatura/${fileId}`, {
            method: "DELETE",
          });
        }
        
        // Upload new files
        for (const file of pendingFiles) {
          const formData = new FormData();
          formData.append('file', file);
          
          await fetch(`/api/assinaturas/${subscriptionId}/arquivos`, {
            method: "POST",
            body: formData,
            credentials: 'include'
          });
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/assinaturas"] });
        toast({
          title: subscription ? "Assinatura atualizada com sucesso!" : "Assinatura criada com sucesso!",
          description: subscription ? "As alterações foram salvas com sucesso." : "A nova assinatura foi adicionada ao sistema.",
        });
        
        // Reset form and state
        form.reset();
        setCredentials([]);
        setCredentialsToDelete([]);
        setPendingFiles([]);
        setExistingFiles([]);
        setFilesToDelete([]);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Erro ao processar credenciais/arquivos",
          description: "A assinatura foi salva, mas houve erro ao processar credenciais ou arquivos.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: subscription ? "Erro ao atualizar assinatura" : "Erro ao criar assinatura",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Reset form values when subscription changes
  useEffect(() => {
    if (subscription) {
      form.reset({
        clientId: subscription.clientId,
        billingDay: subscription.billingDay,
        amount: subscription.amount,
        notes: subscription.notes || "",
        status: subscription.status,
      });
    } else {
      form.reset({
        clientId: "",
        billingDay: 1,
        amount: 0,
        notes: "",
        status: "active",
      });
      setCredentials([]);
      setCredentialsToDelete([]);
      setPendingFiles([]);
      setExistingFiles([]);
      setFilesToDelete([]);
    }
  }, [subscription, form]);

  const onSubmit = (data: InsertSubscription) => {
    subscriptionMutation.mutate(data);
  };

  const handleClientSelect = (clientId: string) => {
    form.setValue("clientId", clientId);
    setShowClientSheet(false);
    setClientSearch("");
  };

  const filteredClients = allClients?.filter((client) => {
    const searchLower = clientSearch.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.company.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.sector.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getClientStatus = (client: ClientWithStats) => {
    if (client.hasActiveSubscription) {
      return { label: "Ativo", className: "bg-green-500/10 text-green-500 border-green-500/20" };
    }
    return { label: "Prospect", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
  };

  // Credential handlers
  const handleAddCredential = () => {
    setEditingCredential({ plataforma: "", login: "", senha: "", secrets: "" });
    setShowCredentialDialog(true);
  };

  const handleEditCredential = (credential: CredentialFormData) => {
    setEditingCredential(credential);
    setShowCredentialDialog(true);
  };

  const handleSaveCredential = () => {
    if (!editingCredential) return;
    
    if (editingCredential.id) {
      // Update existing
      setCredentials(credentials.map(c => 
        c.id === editingCredential.id ? editingCredential : c
      ));
    } else {
      // Add new (with temporary ID)
      setCredentials([...credentials, { ...editingCredential, id: `temp-${Date.now()}` }]);
    }
    
    setShowCredentialDialog(false);
    setEditingCredential(null);
  };

  const handleDeleteCredential = (credential: CredentialFormData) => {
    if (credential.id?.startsWith('temp-')) {
      // Just remove from local state
      setCredentials(credentials.filter(c => c.id !== credential.id));
    } else if (credential.id) {
      // Mark for deletion
      setCredentialsToDelete([...credentialsToDelete, credential.id]);
      setCredentials(credentials.filter(c => c.id !== credential.id));
    }
  };

  // File handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles([...pendingFiles, ...files]);
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = (file: SubscriptionFile) => {
    setFilesToDelete([...filesToDelete, file.id]);
    setExistingFiles(existingFiles.filter(f => f.id !== file.id));
  };

  const handleDownloadFile = (fileId: string) => {
    window.open(`/api/subscription-files/${fileId}`, '_blank');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <CustomDialogContent className="container-bg border-border-secondary">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="gradient-text">{subscription ? "Editar Assinatura" : "Nova Assinatura"}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  form="subscription-form"
                  disabled={subscriptionMutation.isPending}
                  className="btn-primary"
                  data-testid="button-submit-subscription"
                >
                  {subscriptionMutation.isPending ? (subscription ? "Salvando..." : "Criando...") : (subscription ? "Salvar Alterações" : "Criar Assinatura")}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-form">
                  Fechar
                </Button>
              </div>
            </div>
            <DialogDescription className="text-text-secondary">
              {subscription ? "Edite os dados da assinatura existente." : "Crie uma nova assinatura recorrente para um cliente existente."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form id="subscription-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Core Subscription Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-text-primary">Cliente *</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="input-field flex-1" data-testid="select-client">
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dropdown-content">
                            {loadingClients ? (
                              <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                            ) : !allClients || allClients.length === 0 ? (
                              <SelectItem value="no-clients" disabled>Nenhum cliente cadastrado</SelectItem>
                            ) : (
                              allClients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name} - {client.company}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowClientSheet(true)}
                          className="border-border-secondary hover:bg-bg-secondary"
                          data-testid="button-view-clients"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary">Dia de Cobrança *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1-31"
                          className="input-field"
                          data-testid="input-billing-day"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary">Valor Mensal (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          className="input-field"
                          data-testid="input-amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Observações do Cliente</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre esta assinatura..."
                        className="input-field min-h-[100px]"
                        data-testid="textarea-notes"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Credentials Section */}
              <div className="space-y-4 border-t border-border-secondary pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text-primary">Credenciais de Acesso</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCredential}
                    className="btn-secondary"
                    data-testid="button-add-credential"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Credencial
                  </Button>
                </div>

                {credentials.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary border border-dashed border-border-secondary rounded-lg">
                    Nenhuma credencial adicionada. Clique em "Adicionar Credencial" para começar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {credentials.map((credential, index) => (
                      <Card key={credential.id || index} className="bg-bg-secondary border-border-secondary" data-testid={`card-credential-${credential.id || index}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span className="text-primary">{credential.plataforma || "Sem plataforma"}</span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCredential(credential)}
                                className="h-7 w-7 p-0"
                                data-testid={`button-edit-credential-${credential.id || index}`}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCredential(credential)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                data-testid={`button-delete-credential-${credential.id || index}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs">
                          <div>
                            <span className="text-text-secondary">Login: </span>
                            <span className="text-text-primary">{credential.login || "-"}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary">Senha: </span>
                            <span className="text-text-primary">{credential.senha ? "•••••••" : "-"}</span>
                          </div>
                          {credential.secrets && (
                            <div>
                              <span className="text-text-secondary">Secrets: </span>
                              <span className="text-text-primary">Definido</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Files Section */}
              <div className="space-y-4 border-t border-border-secondary pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text-primary">Arquivos</h3>
                  </div>
                  <div>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      data-testid="input-file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="btn-secondary"
                      data-testid="button-upload-file"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Adicionar Arquivo
                    </Button>
                  </div>
                </div>

                {existingFiles.length === 0 && pendingFiles.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary border border-dashed border-border-secondary rounded-lg">
                    Nenhum arquivo anexado. Clique em "Adicionar Arquivo" para fazer upload.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Existing files */}
                    {existingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-bg-secondary border border-border-secondary rounded-lg"
                        data-testid={`file-existing-${file.id}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary truncate">{file.originalName}</p>
                            <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFile(file.id)}
                            className="h-8 px-2"
                            data-testid={`button-download-file-${file.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExistingFile(file)}
                            className="h-8 px-2 text-red-500 hover:text-red-600"
                            data-testid={`button-delete-file-${file.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Pending files */}
                    {pendingFiles.map((file, index) => (
                      <div
                        key={`pending-${index}`}
                        className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                        data-testid={`file-pending-${index}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Upload className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                            <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(2)} KB - Pendente upload</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePendingFile(index)}
                          className="h-8 px-2 text-red-500 hover:text-red-600"
                          data-testid={`button-remove-pending-file-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CustomDialogContent>
      </Dialog>

      {/* Client Selection Sheet */}
      <Sheet open={showClientSheet} onOpenChange={setShowClientSheet}>
        <SheetContent className="w-full sm:max-w-2xl bg-bg-container border-border-secondary overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-text-primary">Selecionar Cliente</SheetTitle>
            <SheetDescription className="text-text-secondary">
              Escolha um cliente da lista abaixo para criar a assinatura.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Buscar por nome, empresa, email ou setor..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="pl-10 bg-bg-primary border-border-secondary text-text-primary"
                data-testid="input-search-clients"
              />
            </div>

            <div className="space-y-2">
              {loadingClients ? (
                <div className="text-center py-8 text-text-secondary">
                  Carregando clientes...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  Nenhum cliente encontrado.
                </div>
              ) : (
                filteredClients.map((client) => {
                  const status = getClientStatus(client);
                  const isSelected = form.watch("clientId") === client.id;

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border text-left transition-all hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border-secondary bg-bg-primary hover:border-primary/50"
                      )}
                      data-testid={`client-item-${client.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-text-primary truncate">
                              {client.name}
                            </h3>
                            <Badge className={status.className}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary truncate">
                            {client.company}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                            <span className="truncate">{client.email}</span>
                            <span>•</span>
                            <span>{client.sector}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Credential Dialog */}
      <Dialog open={showCredentialDialog} onOpenChange={setShowCredentialDialog}>
        <CustomDialogContent className="sm:max-w-[500px] container-bg border-border-secondary">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {editingCredential?.id ? "Editar Credencial" : "Nova Credencial"}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Preencha os dados de acesso da plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Plataforma *</label>
              <Input
                value={editingCredential?.plataforma || ""}
                onChange={(e) => setEditingCredential(prev => prev ? {...prev, plataforma: e.target.value} : null)}
                placeholder="Nome da plataforma"
                className="input-field mt-1"
                data-testid="input-credential-plataforma"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">Login *</label>
              <Input
                value={editingCredential?.login || ""}
                onChange={(e) => setEditingCredential(prev => prev ? {...prev, login: e.target.value} : null)}
                placeholder="Usuário/Email"
                className="input-field mt-1"
                data-testid="input-credential-login"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">Senha *</label>
              <Input
                type="text"
                value={editingCredential?.senha || ""}
                onChange={(e) => setEditingCredential(prev => prev ? {...prev, senha: e.target.value} : null)}
                placeholder="Senha de acesso"
                className="input-field mt-1"
                data-testid="input-credential-senha"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">Secrets</label>
              <Textarea
                value={editingCredential?.secrets || ""}
                onChange={(e) => setEditingCredential(prev => prev ? {...prev, secrets: e.target.value} : null)}
                placeholder="Informações adicionais de segurança, tokens, chaves de API, etc..."
                className="input-field min-h-[100px] mt-1"
                data-testid="input-credential-secrets"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCredentialDialog(false);
                  setEditingCredential(null);
                }}
                data-testid="button-cancel-credential"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveCredential}
                disabled={!editingCredential?.plataforma || !editingCredential?.login || !editingCredential?.senha}
                className="btn-primary"
                data-testid="button-save-credential"
              >
                Salvar
              </Button>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>
    </>
  );
}
