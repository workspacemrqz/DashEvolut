import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertProjectSchema, type InsertProject, type Client, type ProjectWithClient } from "@shared/schema";
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

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectWithClient | null;
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

const formSchema = insertProjectSchema.extend({
  startDate: insertProjectSchema.shape.startDate.transform((val) => new Date(val)),
  dueDate: insertProjectSchema.shape.dueDate.transform((val) => new Date(val)),
});

export default function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const isEditMode = !!project;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clientes"],
  });

  const getDefaultValues = (project?: ProjectWithClient | null) => ({
    name: project?.name || "",
    description: project?.description || "",
    clientId: project?.clientId || "",
    status: project?.status || "discovery",
    value: project?.value || 0,
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
    mutationFn: (data: InsertProject) => apiRequest("POST", "/api/projetos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projetos"] });
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
    mutationFn: (data: InsertProject) => apiRequest("PATCH", `/api/projetos/${project!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projetos"] });
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
    console.log("📤 [FRONTEND] Form data before formatting:", data);
    const formattedData = {
      ...data,
      startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
      dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate,
    };
    console.log("📤 [FRONTEND] Formatted data being sent:", formattedData);
    
    if (isEditMode) {
      updateProjectMutation.mutate(formattedData as InsertProject);
    } else {
      createProjectMutation.mutate(formattedData as InsertProject);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[700px] container-bg border-border-secondary max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="gradient-text">
              {isEditMode ? "Editar Projeto" : "Novo Projeto"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                form="project-form"
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                className="btn-primary"
                data-testid="button-submit"
              >
                {isEditMode 
                  ? (updateProjectMutation.isPending ? "Salvando..." : "Salvar")
                  : (createProjectMutation.isPending ? "Criando..." : "Criar")
                }
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
          <DialogDescription className="text-text-secondary">
            {isEditMode ? "Edite as informações do projeto" : "Adicione um novo projeto ao sistema"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Nome do Projeto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Website E-commerce"
                        style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
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
                      style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
                      data-testid="input-description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
                          data-testid="select-status"
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-bg-container border-border-secondary">
                        <SelectItem value="discovery" className="focus:outline-none focus:ring-0">Discovery</SelectItem>
                        <SelectItem value="development" className="focus:outline-none focus:ring-0">Desenvolvimento</SelectItem>
                        <SelectItem value="delivery" className="focus:outline-none focus:ring-0">Entrega</SelectItem>
                        <SelectItem value="post_sale" className="focus:outline-none focus:ring-0">Pós-venda</SelectItem>
                        <SelectItem value="completed" className="focus:outline-none focus:ring-0">Concluído</SelectItem>
                        <SelectItem value="cancelled" className="focus:outline-none focus:ring-0">Cancelado</SelectItem>
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
                        style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
                        data-testid="input-value"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Data de Início</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
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
                        style={{ backgroundColor: '#060606', color: '#EBEBEB', borderColor: '#303030', borderWidth: '1px' }}
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


          </form>
        </Form>
      </CustomDialogContent>
    </Dialog>
  );
}