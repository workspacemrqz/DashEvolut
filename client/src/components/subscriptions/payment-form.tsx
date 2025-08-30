import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertPaymentSchema, type InsertPayment, type SubscriptionWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
import { Upload, FileText } from "lucide-react";

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string | null;
}

const formSchema = insertPaymentSchema.extend({
  amount: insertPaymentSchema.shape.amount.refine(
    (amount) => amount > 0,
    { message: "O valor deve ser maior que zero" }
  ),
  referenceMonth: insertPaymentSchema.shape.referenceMonth.refine(
    (month) => month >= 1 && month <= 12,
    { message: "Mês deve estar entre 1 e 12" }
  ),
  referenceYear: insertPaymentSchema.shape.referenceYear.refine(
    (year) => year >= 2020 && year <= 2030,
    { message: "Ano deve estar entre 2020 e 2030" }
  ),
});

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export default function PaymentForm({ open, onOpenChange, subscriptionId }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: subscription } = useQuery<SubscriptionWithDetails>({
    queryKey: ["/api/subscriptions", subscriptionId],
    enabled: !!subscriptionId && open,
  });

  type PaymentFormData = Omit<InsertPayment, 'paymentDate'> & { 
    paymentDate: string;
  };

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(formSchema.omit({ paymentDate: true }).extend({
      paymentDate: formSchema.shape.paymentDate.transform((date) => new Date(date)).optional()
    })),
    defaultValues: {
      subscriptionId: subscriptionId || "",
      amount: subscription?.amount || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceMonth: new Date().getMonth() + 1,
      referenceYear: new Date().getFullYear(),
      notes: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('paymentDate', data.paymentDate);
      formData.append('referenceMonth', data.referenceMonth.toString());
      formData.append('referenceYear', data.referenceYear.toString());
      if (data.notes) formData.append('notes', data.notes);
      if (selectedFile) formData.append('receipt', selectedFile);

      const response = await fetch(`/api/subscriptions/${subscriptionId}/payments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions", subscriptionId, "payments"] });
      toast({
        title: "Pagamento registrado com sucesso!",
        description: "O pagamento foi adicionado ao histórico da assinatura.",
      });
      form.reset();
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao registrar pagamento",
        description: "Ocorreu um erro ao registrar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Apenas imagens (JPG, PNG, GIF, WebP) e PDFs são aceitos.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] container-bg border-border-secondary">
        <DialogHeader>
          <DialogTitle className="gradient-text">Registrar Pagamento</DialogTitle>
          <DialogDescription className="text-text-secondary">
            {subscription 
              ? `Registre um pagamento para ${subscription.client.name}`
              : "Registre um novo pagamento de assinatura"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Valor Pago (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        className="input-field"
                        data-testid="input-payment-amount"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Data do Pagamento *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="input-field"
                        data-testid="input-payment-date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Mês de Referência *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="input-field" data-testid="select-reference-month">
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dropdown-content">
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Ano de Referência *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2020"
                        max="2030"
                        placeholder="2024"
                        className="input-field"
                        data-testid="input-reference-year"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-text-primary">Comprovante de Pagamento</FormLabel>
              <div className="mt-2 border border-border-secondary border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="receipt-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-receipt-file"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    {selectedFile ? (
                      <>
                        <FileText className="h-8 w-8 text-accent-primary" />
                        <p className="text-sm text-text-primary font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-text-secondary" />
                        <p className="text-sm text-text-secondary">
                          Clique para fazer upload do comprovante
                        </p>
                        <p className="text-xs text-text-secondary">
                          PDF, JPG, PNG (máx. 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-primary">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre este pagamento..."
                      className="input-field"
                      data-testid="textarea-payment-notes"
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
                data-testid="button-cancel-payment"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="btn-primary"
                data-testid="button-submit-payment"
              >
                {createPaymentMutation.isPending ? "Registrando..." : "Registrar Pagamento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}