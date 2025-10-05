import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ReplitUnit, InsertReplitUnit } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const STATUS_OPTIONS = [
  { value: "Solicitado", bgColor: "bg-yellow-500", textColor: "text-black" },
  { value: "Concluído", bgColor: "bg-green-500", textColor: "text-white" },
  { value: "Limpo", bgColor: "bg-[#030303]", textColor: "text-[#060606]" },
  { value: "Negado", bgColor: "bg-red-500", textColor: "text-white" },
  { value: "Reenviado", bgColor: "bg-blue-500", textColor: "text-white" },
];

export default function ReplitPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ReplitUnit | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<"Todos" | "Camargo" | "Marquez">("Todos");

  const { data: units = [], isLoading } = useQuery<ReplitUnit[]>({
    queryKey: ["/api/replit-units"],
  });

  const filteredUnits = units.filter(unit => {
    if (nameFilter === "Todos") return true;
    return unit.nome === nameFilter;
  });

  const stats = {
    camargo: {
      total: units.filter(u => u.nome === "Camargo").reduce((sum, u) => sum + u.valor, 0),
      count: units.filter(u => u.nome === "Camargo").length,
    },
    marquez: {
      total: units.filter(u => u.nome === "Marquez").reduce((sum, u) => sum + u.valor, 0),
      count: units.filter(u => u.nome === "Marquez").length,
    },
  };

  const chartData = [
    {
      name: "Camargo",
      "Valor Investido (R$)": stats.camargo.total,
      "Unidades": stats.camargo.count,
    },
    {
      name: "Marquez",
      "Valor Investido (R$)": stats.marquez.total,
      "Unidades": stats.marquez.count,
    },
  ];

  const createMutation = useMutation({
    mutationFn: (data: InsertReplitUnit) =>
      apiRequest("POST", "/api/replit-units", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replit-units"] });
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Unidade criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar unidade",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertReplitUnit> }) =>
      apiRequest("PUT", `/api/replit-units/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replit-units"] });
      setIsDialogOpen(false);
      setEditingUnit(null);
      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar unidade",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/replit-units/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replit-units"] });
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir unidade",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InsertReplitUnit = {
      valor: parseFloat(formData.get("valor") as string),
      email: formData.get("email") as string,
      nome: formData.get("nome") as "Camargo" | "Marquez",
      dataHorario: formData.get("dataHorario") as string,
      status: selectedStatus,
    };

    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (unit: ReplitUnit) => {
    setEditingUnit(unit);
    setSelectedStatus(unit.status || []);
    setIsDialogOpen(true);
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingUnit(null);
      setSelectedStatus([]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusStyle = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option 
      ? { bgColor: option.bgColor, textColor: option.textColor }
      : { bgColor: "bg-gray-500", textColor: "text-white" };
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Unidades Replit</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button 
              className="btn-primary px-2 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 flex-shrink-0"
              data-testid="button-add-unit"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Unidade</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUnit ? "Editar Unidade" : "Nova Unidade"}
              </DialogTitle>
              <DialogDescription>
                {editingUnit
                  ? "Edite os dados da unidade Replit"
                  : "Adicione uma nova unidade Replit"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  defaultValue={editingUnit?.valor || ""}
                  required
                  data-testid="input-valor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUnit?.email || ""}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Select
                  name="nome"
                  defaultValue={editingUnit?.nome || "Camargo"}
                  required
                >
                  <SelectTrigger data-testid="select-nome">
                    <SelectValue placeholder="Selecione o nome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Camargo">Camargo</SelectItem>
                    <SelectItem value="Marquez">Marquez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataHorario">Data & Horário</Label>
                <Input
                  id="dataHorario"
                  name="dataHorario"
                  type="text"
                  defaultValue={editingUnit?.dataHorario || ""}
                  placeholder="Ex: 01/01/2025 14:30"
                  required
                  data-testid="input-data-horario"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={selectedStatus.includes(option.value)}
                        onCheckedChange={() => handleStatusToggle(option.value)}
                        data-testid={`checkbox-${option.value}`}
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <span 
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${option.bgColor} ${option.textColor}`}
                          style={option.value === "Limpo" ? { color: "#060606" } : undefined}
                        >
                          {option.value}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="btn-primary"
                  data-testid="button-submit"
                >
                  {editingUnit ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estatísticas por Pessoa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#F9FAFB" />
                <YAxis stroke="#F9FAFB" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1a1a1a", 
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#F9FAFB"
                  }}
                />
                <Legend />
                <Bar dataKey="Valor Investido (R$)" fill="#10b981" />
                <Bar dataKey="Unidades" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle>Lista de Unidades</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={nameFilter === "Todos" ? "default" : "outline"}
                onClick={() => setNameFilter("Todos")}
                data-testid="filter-todos"
                className={nameFilter === "Todos" ? "btn-primary" : ""}
              >
                Todos
              </Button>
              <Button
                variant={nameFilter === "Camargo" ? "default" : "outline"}
                onClick={() => setNameFilter("Camargo")}
                data-testid="filter-camargo"
                className={nameFilter === "Camargo" ? "btn-primary" : ""}
              >
                Camargo
              </Button>
              <Button
                variant={nameFilter === "Marquez" ? "default" : "outline"}
                onClick={() => setNameFilter("Marquez")}
                data-testid="filter-marquez"
                className={nameFilter === "Marquez" ? "btn-primary" : ""}
              >
                Marquez
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {units.length === 0 ? "Nenhuma unidade cadastrada" : "Nenhuma unidade encontrada com este filtro"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data & Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id} data-testid={`row-unit-${unit.id}`}>
                    <TableCell data-testid={`text-valor-${unit.id}`}>
                      {formatCurrency(unit.valor)}
                    </TableCell>
                    <TableCell data-testid={`text-email-${unit.id}`}>
                      {unit.email}
                    </TableCell>
                    <TableCell data-testid={`text-nome-${unit.id}`}>
                      {unit.nome}
                    </TableCell>
                    <TableCell data-testid={`text-data-${unit.id}`}>
                      {unit.dataHorario}
                    </TableCell>
                    <TableCell data-testid={`text-status-${unit.id}`}>
                      <div className="flex flex-wrap gap-1">
                        {unit.status && unit.status.map((status, index) => {
                          const style = getStatusStyle(status);
                          return (
                            <span 
                              key={index} 
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${style.bgColor} ${style.textColor}`}
                              style={status === "Limpo" ? { color: "#060606" } : undefined}
                            >
                              {status}
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(unit)}
                          data-testid={`button-edit-${unit.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(unit.id)}
                          data-testid={`button-delete-${unit.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
