import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ProjectCost {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category?: string | null;
  costDate: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectCostsFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

const costCategories = [
  "Hospedagem",
  "Licenças",
  "Terceiros",
  "Materiais",
  "Infraestrutura",
  "Desenvolvimento",
  "Marketing",
  "Consultoria",
  "Outros"
];

const costFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório").transform((val) => parseFloat(val)),
  category: z.string().optional(),
  costDate: z.date({ required_error: "Data é obrigatória" }),
  notes: z.string().optional(),
});

type CostFormData = z.infer<typeof costFormSchema>;

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

export function ProjectCostsForm({
  isOpen,
  onOpenChange,
  projectId,
  projectName,
}: ProjectCostsFormProps) {
  const [costs, setCosts] = useState<ProjectCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CostFormData>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      costDate: new Date(),
    },
  });

  const selectedDate = watch("costDate");

  // Buscar custos do projeto
  const fetchCosts = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projetos/${projectId}/custos`);
      if (!response.ok) throw new Error("Failed to fetch costs");
      const data = await response.json();
      setCosts(data.map((cost: any) => ({
        ...cost,
        costDate: new Date(cost.costDate),
        createdAt: new Date(cost.createdAt),
        updatedAt: new Date(cost.updatedAt),
      })));
    } catch (error) {
      console.error("Error fetching costs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os custos do projeto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchCosts();
    }
  }, [isOpen, projectId]);

  const onSubmit = async (data: CostFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projetos/${projectId}/custos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          costDate: data.costDate.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create cost");

      toast({
        title: "Sucesso",
        description: "Custo adicionado com sucesso!",
      });

      reset();
      fetchCosts();
    } catch (error) {
      console.error("Error creating cost:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o custo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCost = async (costId: string) => {
    try {
      const response = await fetch(`/api/projetos/${projectId}/custos/${costId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete cost");

      toast({
        title: "Sucesso",
        description: "Custo removido com sucesso!",
      });

      fetchCosts();
    } catch (error) {
      console.error("Error deleting cost:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o custo.",
        variant: "destructive",
      });
    }
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Gerenciar Custos do Projeto</DialogTitle>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
          <DialogDescription>
            Projeto: <strong>{projectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário para adicionar novo custo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Novo Custo</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição*</Label>
                <Input
                  id="description"
                  placeholder="Ex: Hospedagem AWS, Licença software..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)*</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label>Categoria</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data do Custo*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setValue("costDate", date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.costDate && (
                  <p className="text-sm text-red-500">{errors.costDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais..."
                  rows={3}
                  {...register("notes")}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Adicionando..." : "Adicionar Custo"}
              </Button>
            </form>
          </div>

          {/* Lista de custos existentes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Custos Existentes</h3>
              <div className="text-sm text-muted-foreground">
                Total: <strong>R$ {totalCosts.toFixed(2)}</strong>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-4">Carregando custos...</div>
            ) : costs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum custo cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="p-3 border rounded-lg bg-card space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{cost.description}</h4>
                        <div className="text-sm text-muted-foreground">
                          {cost.category && (
                            <span className="inline-block bg-secondary px-2 py-1 rounded text-xs mr-2">
                              {cost.category}
                            </span>
                          )}
                          {format(cost.costDate, "dd/MM/yyyy")}
                        </div>
                        {cost.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {cost.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-green-600">
                          R$ {cost.amount.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCost(cost.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </CustomDialogContent>
    </Dialog>
  );
}