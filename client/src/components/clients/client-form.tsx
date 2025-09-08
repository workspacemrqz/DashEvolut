import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { insertClientSchema, updateClientSchema, type InsertClient, type UpdateClient, type ClientWithStats } from "@shared/schema";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientToEdit?: ClientWithStats | null;
}

const formSchema = insertClientSchema.extend({
  phone: insertClientSchema.shape.phone.optional(),
});

const updateFormSchema = updateClientSchema.extend({
  phone: updateClientSchema.shape.phone.optional(),
});

export default function ClientForm({ open, onOpenChange, clientToEdit }: ClientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = !!clientToEdit;
  const form = useForm<InsertClient>({
    resolver: zodResolver(isEditing ? updateFormSchema : formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "",
      sector: "",
      nps: undefined,
      upsellPotential: "medium",
    },
  });

  // Reset form when clientToEdit changes
  useEffect(() => {
    if (clientToEdit) {
      form.reset({
        name: clientToEdit.name,
        company: clientToEdit.company,
        email: clientToEdit.email,
        phone: clientToEdit.phone || "",
        source: clientToEdit.source,
        sector: clientToEdit.sector,
        nps: clientToEdit.nps || undefined,
        upsellPotential: clientToEdit.upsellPotential || "medium",
      });
    } else {
      form.reset({
        name: "",
        company: "",
        email: "",
        phone: "",
        source: "",
        sector: "",
        nps: undefined,
        upsellPotential: "medium",
      });
    }
  }, [clientToEdit, form]);

  const createClientMutation = useMutation({
    mutationFn: (data: InsertClient) => apiRequest("POST", "/api/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente criado com sucesso!",
        description: "O novo cliente foi adicionado ao sistema.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar cliente",
        description: "Ocorreu um erro ao adicionar o cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: UpdateClient) => apiRequest("PATCH", `/api/clients/${clientToEdit?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente atualizado com sucesso!",
        description: "As informações do cliente foram atualizadas.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro ao atualizar o cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertClient) => {
    // Remove undefined and empty string values before sending, but keep required fields
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        // Always keep required fields even if empty
        const requiredFields = ['name', 'company', 'email', 'source', 'sector'];
        if (requiredFields.includes(key)) {
          return true;
        }
        return value !== undefined && value !== "";
      })
    );
    
    if (isEditing) {
      updateClientMutation.mutate(cleanData as UpdateClient);
    } else {
      createClientMutation.mutate(cleanData as InsertClient);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] container-bg border-border-secondary">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            {isEditing ? "Atualize as informações do cliente" : "Adicione um novo cliente ao sistema"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Nome do Contato</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="João Silva"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Empresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TechStart LTDA"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-company"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@empresa.com"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Telefone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-phone"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Setor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tecnologia"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-sector"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Fonte de Aquisição</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-bg-primary border-border-secondary text-text-primary"
                          data-testid="select-source"
                        >
                          <SelectValue placeholder="Selecione a fonte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-bg-container border-border-secondary">
                        <SelectItem value="Indicação">Indicação</SelectItem>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Site">Site</SelectItem>
                        <SelectItem value="Evento">Evento</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">

              <FormField
                control={form.control}
                name="upsellPotential"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Potencial Upsell</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-bg-primary border-border-secondary text-text-primary"
                          data-testid="select-upsell"
                        >
                          <SelectValue placeholder="Potencial" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-bg-container border-border-secondary">
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="btn-secondary"
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createClientMutation.isPending || updateClientMutation.isPending}
                className="btn-primary"
                data-testid="button-submit"
              >
                {isEditing 
                  ? (updateClientMutation.isPending ? "Atualizando..." : "Atualizar Cliente")
                  : (createClientMutation.isPending ? "Criando..." : "Criar Cliente")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}