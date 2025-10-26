import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { insertSubscriptionSchema, type InsertSubscription, type Client, type SubscriptionWithClient, type ClientWithStats } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
import { Users, Search } from "lucide-react";

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionWithClient | null;
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
  const queryClient = useQueryClient();
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const { data: allClients, isLoading: loadingClients } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clientes"],
  });

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const form = useForm<InsertSubscription>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: subscription?.clientId || "",
      billingDay: subscription?.billingDay || 1,
      amount: subscription?.amount || 0,
      notes: subscription?.notes || "",
      status: subscription?.status || "active",
      plataforma: subscription?.plataforma || "",
      login: subscription?.login || "",
      senha: subscription?.senha || "",
      secrets: subscription?.secrets || "",
      attachmentFileId: subscription?.attachmentFileId || "",
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const formData = new FormData();
      
      // Add all subscription data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Add file if present
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }
      
      const url = subscription 
        ? `/api/assinaturas/${subscription.id}` 
        : "/api/assinaturas";
      
      const method = subscription ? "PATCH" : "POST";
      
      // Use fetch directly for FormData
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assinaturas"] });
      toast({
        title: subscription ? "Assinatura atualizada com sucesso!" : "Assinatura criada com sucesso!",
        description: subscription ? "As alterações foram salvas com sucesso." : "A nova assinatura foi adicionada ao sistema.",
      });
      form.reset();
      setAttachmentFile(null);
      onOpenChange(false);
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
        plataforma: subscription.plataforma || "",
        login: subscription.login || "",
        senha: subscription.senha || "",
        secrets: subscription.secrets || "",
        attachmentFileId: subscription.attachmentFileId || "",
      });
    } else {
      form.reset({
        clientId: "",
        billingDay: 1,
        amount: 0,
        notes: "",
        status: "active",
        plataforma: "",
        login: "",
        senha: "",
        secrets: "",
        attachmentFileId: "",
      });
    }
    setAttachmentFile(null);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[600px] container-bg border-border-secondary">
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
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

            {/* Credenciais Section */}
            <div className="space-y-4 border-t border-border-secondary pt-4 mt-4">
              <h3 className="text-md font-semibold text-text-primary">Credenciais de Acesso</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="plataforma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary">Plataforma</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome da plataforma"
                          className="input-field"
                          data-testid="input-plataforma"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary">Login</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Usuário/Email"
                          className="input-field"
                          data-testid="input-login"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary">Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Senha de acesso"
                          className="input-field"
                          data-testid="input-senha"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="secrets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Secrets</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais de segurança, tokens, chaves de API, etc..."
                        className="input-field min-h-[100px]"
                        data-testid="textarea-secrets"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-text-primary">Arquivo Anexo</FormLabel>
                <Input
                  type="file"
                  accept=".json,.zip,.txt,.pdf,.doc,.docx,.xls,.xlsx,image/*"
                  className="input-field mt-2"
                  data-testid="input-attachment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachmentFile(file);
                    }
                  }}
                />
                {attachmentFile && (
                  <p className="text-sm text-text-secondary mt-1">
                    Arquivo selecionado: {attachmentFile.name}
                  </p>
                )}
                {subscription?.file && !attachmentFile && (
                  <p className="text-sm text-text-secondary mt-1">
                    Arquivo atual: {subscription.file.originalName}
                  </p>
                )}
              </div>
            </div>

          </form>
        </Form>
      </CustomDialogContent>

      <Sheet open={showClientSheet} onOpenChange={setShowClientSheet}>
        <SheetContent className="w-full sm:max-w-2xl bg-bg-container border-border-secondary overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-text-primary">Selecionar Cliente</SheetTitle>
            <SheetDescription className="text-text-secondary">
              Escolha um cliente da lista abaixo para criar a assinatura.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Search Input */}
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

            {/* Clients List */}
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
                            <span className="truncate">{client.sector}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Dialog>
  );
}