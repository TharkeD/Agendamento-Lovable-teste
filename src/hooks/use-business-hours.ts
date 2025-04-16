import { useState, useEffect } from 'react';
import { BusinessHours, SpecialDate } from '@/lib/types';
import { toast } from "sonner";

// Horários padrão para inicialização
const defaultBusinessHours: BusinessHours[] = [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Domingo
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "12:00", lunchEnd: "13:00" }, // Segunda
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "12:00", lunchEnd: "13:00" }, // Terça
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "12:00", lunchEnd: "13:00" }, // Quarta
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "12:00", lunchEnd: "13:00" }, // Quinta
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "18:00", lunchStart: "12:00", lunchEnd: "13:00" }, // Sexta
  { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "13:00" }, // Sábado
];

export function useBusinessHours() {
  // Estado para horários comerciais regulares
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(() => {
    const savedHours = localStorage.getItem('business_hours');
    return savedHours ? JSON.parse(savedHours) : defaultBusinessHours;
  });

  // Estado para datas especiais (feriados, fechamentos, horários estendidos)
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(() => {
    const savedDates = localStorage.getItem('special_dates');
    return savedDates 
      ? JSON.parse(savedDates, (key, value) => {
          if (key === 'date') return new Date(value);
          return value;
        })
      : [];
  });

  // Salvar alterações no localStorage
  useEffect(() => {
    localStorage.setItem('business_hours', JSON.stringify(businessHours));
  }, [businessHours]);

  useEffect(() => {
    localStorage.setItem('special_dates', JSON.stringify(specialDates));
  }, [specialDates]);

  // Atualizar horário comercial para um dia específico
  const updateBusinessHours = (updatedHours: BusinessHours) => {
    setBusinessHours(hours => 
      hours.map(hour => 
        hour.dayOfWeek === updatedHours.dayOfWeek ? updatedHours : hour
      )
    );
    toast.success(`Horário de ${getDayName(updatedHours.dayOfWeek)} atualizado`);
  };

  // Adicionar uma data especial
  const addSpecialDate = (specialDate: Omit<SpecialDate, 'id'>) => {
    const newSpecialDate: SpecialDate = {
      ...specialDate,
      id: generateId(),
    };
    setSpecialDates([...specialDates, newSpecialDate]);
    toast.success("Data especial adicionada");
    return newSpecialDate;
  };

  // Atualizar uma data especial
  const updateSpecialDate = (updatedDate: SpecialDate) => {
    setSpecialDates(dates => 
      dates.map(date => 
        date.id === updatedDate.id ? updatedDate : date
      )
    );
    toast.success("Data especial atualizada");
  };

  // Remover uma data especial
  const deleteSpecialDate = (id: string) => {
    setSpecialDates(dates => dates.filter(date => date.id !== id));
    toast.success("Data especial removida");
  };

  // Verificar se uma data está disponível para agendamentos
  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    
    // Verificar se é uma data especial
    const specialDate = specialDates.find(sd => 
      sd.date.getDate() === date.getDate() &&
      sd.date.getMonth() === date.getMonth() &&
      sd.date.getFullYear() === date.getFullYear()
    );
    
    if (specialDate) {
      return specialDate.isOpen;
    }
    
    // Verificar horário comercial regular
    const dayHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    return dayHours?.isOpen || false;
  };

  // Obter horário de abertura e fechamento para uma data específica
  const getHoursForDate = (date: Date): { openTime: string, closeTime: string, lunchStart?: string, lunchEnd?: string } | null => {
    const dayOfWeek = date.getDay();
    
    // Verificar se é uma data especial
    const specialDate = specialDates.find(sd => 
      sd.date.getDate() === date.getDate() &&
      sd.date.getMonth() === date.getMonth() &&
      sd.date.getFullYear() === date.getFullYear()
    );
    
    if (specialDate) {
      if (!specialDate.isOpen) return null;
      return {
        openTime: specialDate.openTime || "09:00",
        closeTime: specialDate.closeTime || "17:00"
      };
    }
    
    // Obter horário comercial regular
    const dayHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    if (!dayHours || !dayHours.isOpen) return null;
    
    return {
      openTime: dayHours.openTime,
      closeTime: dayHours.closeTime,
      lunchStart: dayHours.lunchStart,
      lunchEnd: dayHours.lunchEnd
    };
  };

  return {
    businessHours,
    specialDates,
    updateBusinessHours,
    addSpecialDate,
    updateSpecialDate,
    deleteSpecialDate,
    isDateAvailable,
    getHoursForDate
  };
}

// Função auxiliar para obter o nome do dia da semana
function getDayName(dayOfWeek: number): string {
  const days = [
    "Domingo", "Segunda-feira", "Terça-feira", 
    "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
  ];
  return days[dayOfWeek];
}

// Função auxiliar para gerar ID único
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
