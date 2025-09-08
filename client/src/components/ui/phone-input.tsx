import * as React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, ...props }, ref) => {
    const formatPhoneNumber = (value: string): string => {
      // Remove todos os caracteres não numéricos
      const numbers = value.replace(/\D/g, "");
      
      // Se não há números, retorna vazio
      if (!numbers) return "";
      
      // Se tem apenas 1 dígito, retorna apenas o número
      if (numbers.length === 1) {
        return numbers;
      }
      
      // Se tem 2 dígitos, retorna +55 (XX
      if (numbers.length === 2) {
        return `+55 (${numbers}`;
      }
      
      // Se começar com 55, remove o 55 (código do país)
      let cleanNumbers = numbers;
      if (numbers.startsWith("55") && numbers.length > 2) {
        cleanNumbers = numbers.substring(2);
      }
      
      // Se tem menos de 2 dígitos após remover 55, retorna apenas os números
      if (cleanNumbers.length < 2) {
        return cleanNumbers;
      }
      
      // Pega os 2 primeiros dígitos (DDD)
      const ddd = cleanNumbers.substring(0, 2);
      const remaining = cleanNumbers.substring(2);
      
      // Se não há números restantes, retorna +55 (XX)
      if (remaining.length === 0) {
        return `+55 (${ddd}`;
      }
      
      // Se tem 1-4 dígitos restantes, formata como +55 (XX) XXXX
      if (remaining.length <= 4) {
        return `+55 (${ddd}) ${remaining}`;
      }
      
      // Se tem 5-8 dígitos restantes, formata como +55 (XX) XXXX-XXXX
      if (remaining.length <= 8) {
        const firstPart = remaining.substring(0, 4);
        const secondPart = remaining.substring(4);
        return `+55 (${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
      }
      
      // Se tem 9 dígitos restantes, formata como +55 (XX) XXXXX-XXXX
      if (remaining.length === 9) {
        const firstPart = remaining.substring(0, 5);
        const secondPart = remaining.substring(5);
        return `+55 (${ddd}) ${firstPart}-${secondPart}`;
      }
      
      // Se tem mais de 9 dígitos, limita a 9
      if (remaining.length > 9) {
        const limitedRemaining = remaining.substring(0, 9);
        const firstPart = limitedRemaining.substring(0, 5);
        const secondPart = limitedRemaining.substring(5);
        return `+55 (${ddd}) ${firstPart}-${secondPart}`;
      }
      
      return `+55 (${ddd}) ${remaining}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      e.target.value = formatted;
      onChange?.(formatted);
    };

    return (
      <input
        type="tel"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
