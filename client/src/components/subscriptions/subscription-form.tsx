import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertSubscriptionSchema, type InsertSubscription, type Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export default function SubscriptionForm({ open, onOpenChange }: SubscriptionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading: loadingClients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    select: (data: any) => data.filter((client: any) => client.status === "active")
  });

  const form = useForm<InsertSubscription>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      billingDay: 1,
      amount: 0,
      notes: "",
      status: "active",
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data: InsertSubscription) => apiRequest("POST", "/api/subscriptions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Assinatura criada com sucesso!",
        description: "A nova assinatura foi adicionada ao sistema.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar assinatura",
        description: "Ocorreu um erro ao adicionar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSubscription) => {
    createSubscriptionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] container-bg border-border-secondary">
        <DialogHeader>
          <DialogTitle className="gradient-text">Nova Assinatura</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Crie uma nova assinatura recorrente para um cliente existente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-text-primary">Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-field" data-testid="select-client">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dropdown-content">
                        {loadingClients ? (
                          <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                        ) : clients?.length === 0 ? (
                          <SelectItem value="no-clients" disabled>Nenhum cliente ativo encontrado</SelectItem>
                        ) : (
                          clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="btn-secondary"
                data-testid="button-cancel-subscription"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createSubscriptionMutation.isPending}
                className="btn-primary"
                data-testid="button-submit-subscription"
              >
                {createSubscriptionMutation.isPending ? "Criando..." : "Criar Assinatura"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}