import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface ChecklistEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helpText?: string;
}

export default function ChecklistEditor({ 
  value, 
  onChange, 
  placeholder = "Digite um item...",
  label,
  helpText = "Clique em + para adicionar itens"
}: ChecklistEditorProps) {
  const [items, setItems] = useState<string[]>([]);

  // Converter valor inicial para array
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          // Se não for JSON válido, tratar como texto com quebras de linha
          const lines = value.split('\n').filter(line => line.trim());
          setItems(lines);
        }
      } catch {
        // Se falhar no parse, tratar como texto com quebras de linha
        const lines = value.split('\n').filter(line => line.trim());
        setItems(lines);
      }
    } else {
      setItems([]);
    }
  }, [value]);

  // Função para atualizar o valor pai
  const updateValue = (newItems: string[]) => {
    const jsonValue = JSON.stringify(newItems);
    onChange(jsonValue);
  };

  const addItem = () => {
    const newItems = [...items, ""];
    setItems(newItems);
    updateValue(newItems);
  };

  const updateItem = (index: number, newValue: string) => {
    const newItems = items.map((item, i) => i === index ? newValue : item);
    setItems(newItems);
    updateValue(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    updateValue(newItems);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="bg-bg-primary border-border-secondary text-text-primary flex-1"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-text-secondary text-sm">
            Nenhum item adicionado ainda
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full border-dashed border-border-secondary hover:border-border-primary hover:bg-bg-secondary"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>

      {helpText && (
        <p className="text-xs text-text-secondary">
          {helpText}
        </p>
      )}
    </div>
  );
}