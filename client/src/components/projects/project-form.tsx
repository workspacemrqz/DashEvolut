import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertProjectSchema, type InsertProject, type Client, type ProjectWithClient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
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

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectWithClient | null;
}

const formSchema = insertProjectSchema.extend({
  startDate: insertProjectSchema.shape.startDate.transform((val) => new Date(val)),
  dueDate: insertProjectSchema.shape.dueDate.transform((val) => new Date(val)),
});

export default function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const isEditMode = !!project;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const getDefaultValues = (project?: ProjectWithClient | null) => ({
    name: project?.name || "",
    description: project?.description || "",
    clientId: project?.clientId || "",
    status: project?.status || "discovery",
    value: project?.value || 0,
    estimatedHours: project?.estimatedHours || 0,
    workedHours: project?.workedHours || 0,
    profitMargin: project?.profitMargin || 0,
    progress: project?.progress || 0,
    startDate: project?.startDate ? new Date(project.startDate) : new Date(),
    dueDate: project?.dueDate ? new Date(project.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isRecurring: project?.isRecurring || false,
  });

  const form = useForm<InsertProject>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(project),
  });

  // Reset form when project changes
  useEffect(() => {
    form.reset(getDefaultValues(project));
  }, [project, form]);

  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("/api/projects", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projeto criado com sucesso!",
        description: "O novo projeto foi adicionado ao sistema.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar projeto",
        description: "Ocorreu um erro ao adicionar o projeto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest(`/api/projects/${project!.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projeto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar projeto",
        description: "Ocorreu um erro ao salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProject) => {
    if (isEditMode) {
      updateProjectMutation.mutate(data);
    } else {
      createProjectMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] container-bg border-border-secondary max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            {isEditMode ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            {isEditMode ? "Edite as informações do projeto" : "Adicione um novo projeto ao sistema"}
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
                    <FormLabel className="text-text-primary">Nome do Projeto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Website E-commerce"
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
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-bg-primary border-border-secondary text-text-primary"
                          data-testid="select-client"
                        >
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-bg-container border-border-secondary">
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-primary">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Desenvolvimento completo de plataforma e-commerce..."
                      className="bg-bg-primary border-border-secondary text-text-primary"
                      data-testid="input-description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="bg-bg-primary border-border-secondary text-text-primary"
                          data-testid="select-status"
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-bg-container border-border-secondary">
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="development">Desenvolvimento</SelectItem>
                        <SelectItem value="delivery">Entrega</SelectItem>
                        <SelectItem value="post_sale">Pós-venda</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-value"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Horas Estimadas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-estimated-hours"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Data de Início</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-start-date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Data de Entrega</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-due-date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="profitMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Margem de Lucro (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="65"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-profit-margin"
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Progresso (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-progress"
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary" style={{color: '#F5F5F5 !important'}} data-testid="label-worked-hours">Horas Trabalhadas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-bg-primary border-border-secondary text-text-primary"
                        data-testid="input-worked-hours"
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
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
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                className="btn-primary"
                data-testid="button-submit"
              >
                {isEditMode 
                  ? (updateProjectMutation.isPending ? "Salvando..." : "Salvar Alterações")
                  : (createProjectMutation.isPending ? "Criando..." : "Criar Projeto")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}