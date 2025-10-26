import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import type { Expense, InsertExpense, UpdateExpense } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const FREQUENCY_OPTIONS = [
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
  { value: "semanal", label: "Semanal" },
  { value: "unico", label: "Único" },
];

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

export default function ReplitPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [frequencyFilter, setFrequencyFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [searchFilter, setSearchFilter] = useState("");

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/despesas"],
  });

  const filteredExpenses = expenses.filter(expense => {
    const matchesFrequency = frequencyFilter === "Todos" || expense.frequency === frequencyFilter.toLowerCase();
    const matchesStatus = statusFilter === "Todos" || expense.status === statusFilter.toLowerCase();
    const matchesSearch = expense.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesFrequency && matchesStatus && matchesSearch;
  });

  const stats = {
    mensal: {
      total: expenses.filter(e => e.frequency === "mensal").reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter(e => e.frequency === "mensal").length,
    },
    anual: {
      total: expenses.filter(e => e.frequency === "anual").reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter(e => e.frequency === "anual").length,
    },
    semanal: {
      total: expenses.filter(e => e.frequency === "semanal").reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter(e => e.frequency === "semanal").length,
    },
    unico: {
      total: expenses.filter(e => e.frequency === "unico").reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter(e => e.frequency === "unico").length,
    },
  };

  const chartData = [
    {
      name: "Mensal",
      "Valor Total (R$)": stats.mensal.total,
      "Quantidade": stats.mensal.count,
    },
    {
      name: "Anual",
      "Valor Total (R$)": stats.anual.total,
      "Quantidade": stats.anual.count,
    },
    {
      name: "Semanal",
      "Valor Total (R$)": stats.semanal.total,
      "Quantidade": stats.semanal.count,
    },
    {
      name: "Único",
      "Valor Total (R$)": stats.unico.total,
      "Quantidade": stats.unico.count,
    },
  ];

  const createMutation = useMutation({
    mutationFn: (data: InsertExpense) =>
      apiRequest("POST", "/api/despesas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/despesas"] });
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Despesa criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar despesa",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpense }) =>
      apiRequest("PATCH", `/api/despesas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/despesas"] });
      setIsDialogOpen(false);
      setEditingExpense(null);
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar despesa",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/despesas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/despesas"] });
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InsertExpense = {
      description: formData.get("description") as string,
      amount: parseFloat(formData.get("amount") as string),
      frequency: formData.get("frequency") as "mensal" | "anual" | "semanal" | "unico",
      category: formData.get("category") as string || undefined,
      startDate: new Date(formData.get("startDate") as string),
      status: formData.get("status") as "ativo" | "inativo",
      notes: formData.get("notes") as string || undefined,
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta despesa?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingExpense(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
      <div className="container-bg border-b border-border-secondary px-3 py-6 pl-14 sm:px-6 lg:pl-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold break-words" style={{ color: 'hsl(203.89, 88.28%, 53.14%)' }}>Gestão Financeira</h1>
            <p className="text-text-secondary mt-1 text-xs sm:text-sm lg:text-base break-words">Controle de despesas e custos operacionais</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button 
                className="btn-primary px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
                data-testid="button-add-expense"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Despesa</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Editar Despesa" : "Nova Despesa"}
              </DialogTitle>
              <DialogDescription>
                {editingExpense
                  ? "Edite os dados da despesa"
                  : "Adicione uma nova despesa financeira"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  defaultValue={editingExpense?.description || ""}
                  required
                  data-testid="input-description"
                  placeholder="Ex: Aluguel do escritório"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={editingExpense?.amount || ""}
                  required
                  data-testid="input-amount"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Periodicidade *</Label>
                <Select
                  name="frequency"
                  defaultValue={editingExpense?.frequency || "mensal"}
                  required
                >
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue placeholder="Selecione a periodicidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  defaultValue={editingExpense?.category || ""}
                  data-testid="input-category"
                  placeholder="Ex: Infraestrutura, Marketing, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={editingExpense ? formatDateForInput(editingExpense.startDate) : ""}
                  required
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  name="status"
                  defaultValue={editingExpense?.status || "ativo"}
                  required
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingExpense?.notes || ""}
                  data-testid="textarea-notes"
                  placeholder="Observações adicionais sobre a despesa"
                  rows={3}
                />
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingExpense ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <main className="flex-1 p-3 lg:p-6 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6 w-full">
        <Card className="kpi-card rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mensal-total">
              {formatCurrency(stats.mensal.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mensal.count} despesa{stats.mensal.count !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card className="kpi-card rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-anual-total">
              {formatCurrency(stats.anual.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.anual.count} despesa{stats.anual.count !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card className="kpi-card rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semanal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-semanal-total">
              {formatCurrency(stats.semanal.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.semanal.count} despesa{stats.semanal.count !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card className="kpi-card rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Único</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-unico-total">
              {formatCurrency(stats.unico.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.unico.count} despesa{stats.unico.count !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        </div>

        <Card className="kpi-card rounded-xl mb-4 lg:mb-6">
        <CardHeader>
          <CardTitle>Despesas por Periodicidade</CardTitle>
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
                <Bar dataKey="Valor Total (R$)" fill="#10b981" />
                <Bar dataKey="Quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

        <Card className="kpi-card rounded-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle>Lista de Despesas</CardTitle>
            <Input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full sm:w-[200px]"
              data-testid="input-search-filter"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">Periodicidade:</span>
              <Select
                value={frequencyFilter}
                onValueChange={setFrequencyFilter}
              >
                <SelectTrigger className="w-full sm:w-[150px] bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0 data-[state=open]:border-border/50" data-testid="select-frequency-filter">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0">
                  <SelectItem value="Todos" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Todos</SelectItem>
                  <SelectItem value="Mensal" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Mensal</SelectItem>
                  <SelectItem value="Anual" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Anual</SelectItem>
                  <SelectItem value="Semanal" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Semanal</SelectItem>
                  <SelectItem value="Único" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Único</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[130px] bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0 focus:ring-offset-0 data-[state=open]:border-border/50" data-testid="select-status-filter">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-bg-container border-border/50 rounded-lg focus:outline-none focus:ring-0">
                  <SelectItem value="Todos" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Todos</SelectItem>
                  <SelectItem value="Ativo" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Ativo</SelectItem>
                  <SelectItem value="Inativo" className="focus:bg-bg-primary/50 focus:text-text-primary cursor-pointer focus:outline-none focus:ring-0">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {expenses.length === 0 ? "Nenhuma despesa cadastrada" : "Nenhuma despesa encontrada com este filtro"}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-4">
                {filteredExpenses.map((expense) => (
                  <div 
                    key={expense.id}
                    className="border border-border-secondary rounded-lg p-4 bg-bg-primary"
                    data-testid={`card-expense-${expense.id}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm truncate" data-testid={`text-description-${expense.id}`}>
                          {expense.description}
                        </p>
                        <p className="font-semibold text-accent-primary text-lg mt-1" data-testid={`text-amount-${expense.id}`}>
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                          data-testid={`button-edit-${expense.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          data-testid={`button-delete-${expense.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Periodicidade</p>
                        <p className="text-sm font-medium text-text-primary" data-testid={`text-frequency-${expense.id}`}>
                          {FREQUENCY_OPTIONS.find(f => f.value === expense.frequency)?.label || expense.frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Status</p>
                        <Badge 
                          variant={expense.status === "ativo" ? "default" : "secondary"}
                          className={expense.status === "ativo" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}
                          data-testid={`text-status-${expense.id}`}
                        >
                          {expense.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Categoria</p>
                        <p className="text-sm font-medium text-text-primary truncate" data-testid={`text-category-${expense.id}`}>
                          {expense.category || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Data de Início</p>
                        <p className="text-sm font-medium text-text-primary" data-testid={`text-start-date-${expense.id}`}>
                          {formatDate(expense.startDate)}
                        </p>
                      </div>
                    </div>

                    {expense.notes && (
                      <div className="mt-3 pt-3 border-t border-border-secondary">
                        <p className="text-xs text-text-secondary mb-1">Observações</p>
                        <p className="text-sm text-text-primary line-clamp-2">
                          {expense.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Periodicidade</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                        <TableCell data-testid={`text-description-${expense.id}`}>
                          {expense.description}
                        </TableCell>
                        <TableCell data-testid={`text-amount-${expense.id}`}>
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell data-testid={`text-frequency-${expense.id}`}>
                          {FREQUENCY_OPTIONS.find(f => f.value === expense.frequency)?.label || expense.frequency}
                        </TableCell>
                        <TableCell data-testid={`text-category-${expense.id}`}>
                          {expense.category || "-"}
                        </TableCell>
                        <TableCell data-testid={`text-start-date-${expense.id}`}>
                          {formatDate(expense.startDate)}
                        </TableCell>
                        <TableCell data-testid={`text-status-${expense.id}`}>
                          <Badge 
                            variant={expense.status === "ativo" ? "default" : "secondary"}
                            className={expense.status === "ativo" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}
                          >
                            {expense.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                              data-testid={`button-edit-${expense.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense.id)}
                              data-testid={`button-delete-${expense.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
