
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helpers para formatação
export const formatUtils = {
  // Formata um valor numérico para moeda brasileira (R$)
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  // Formata data para o formato brasileiro
  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  // Formata horário
  formatTime: (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};
