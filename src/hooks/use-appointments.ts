import { useState, useEffect } from 'react';
import { Appointment, DateWithSlots, TimeSlot } from '@/lib/types';
import { toast } from "sonner";
import { addDays, format, isSameDay, isWithinInterval, set, parse } from 'date-fns';
import { NotificationService } from '@/lib/notification-service';
import { useBusinessHours } from './use-business-hours';

export function useAppointments() {
  const { isDateAvailable, getHoursForDate } = useBusinessHours();
  
  // Em um app real, isso seria obtido de uma API
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const savedAppointments = localStorage.getItem('appointments');
    return savedAppointments 
      ? JSON.parse(savedAppointments, (key, value) => {
          if (key === 'date') return new Date(value);
          return value;
        })
      : [];
  });

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: generateId(),
      status: 'scheduled',
    };
    setAppointments([...appointments, newAppointment]);
    
    // Enviar notificação de confirmação
    await NotificationService.sendAppointmentConfirmation(newAppointment);
    
    toast.success("Agendamento realizado com sucesso");
    return newAppointment;
  };

  const updateAppointment = async (updatedAppointment: Appointment) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    ));
    
    // Enviar notificação de atualização
    await NotificationService.sendAppointmentConfirmation(updatedAppointment);
    
    toast.success("Agendamento atualizado com sucesso");
  };

  const cancelAppointment = async (id: string) => {
    const appointment = appointments.find(app => app.id === id);
    
    if (!appointment) {
      toast.error("Agendamento não encontrado");
      return;
    }
    
    const updatedAppointment = { ...appointment, status: 'cancelled' as const };
    
    setAppointments(appointments.map(app => 
      app.id === id ? updatedAppointment : app
    ));
    
    // Enviar notificação de cancelamento
    await NotificationService.sendAppointmentCancellation(updatedAppointment);
    
    toast.success("Agendamento cancelado");
  };

  const deleteAppointment = async (id: string) => {
    const appointment = appointments.find(app => app.id === id);
    
    if (!appointment) {
      toast.error("Agendamento não encontrado");
      return;
    }
    
    setAppointments(appointments.filter(app => app.id !== id));
    
    // Enviar notificação de cancelamento/exclusão
    await NotificationService.sendAppointmentCancellation(appointment);
    
    toast.success("Agendamento excluído");
  };

  const sendReminder = async (id: string) => {
    const appointment = appointments.find(app => app.id === id);
    
    if (!appointment) {
      toast.error("Agendamento não encontrado");
      return false;
    }
    
    // Enviar lembrete
    return NotificationService.sendAppointmentReminder(appointment);
  };

  const getAppointment = (id: string) => {
    return appointments.find(appointment => appointment.id === id);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(appointment.date, date) && 
      appointment.status !== 'cancelled'
    );
  };

  // Generate available time slots for a given date and service duration
  const getAvailableTimeSlots = (date: Date, duration: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Verificar se a data está disponível de acordo com os horários de funcionamento
    if (!isDateAvailable(date)) {
      return slots; // Retorna array vazio se a data não estiver disponível
    }
    
    // Obter horários de funcionamento para a data
    const businessHours = getHoursForDate(date);
    if (!businessHours) {
      return slots; // Retorna array vazio se não houver horários definidos
    }
    
    // Converter horários de string para objetos Date
    const openTime = parse(businessHours.openTime, 'HH:mm', date);
    const closeTime = parse(businessHours.closeTime, 'HH:mm', date);
    
    // Definir horário de almoço, se existir
    let lunchStart: Date | null = null;
    let lunchEnd: Date | null = null;
    if (businessHours.lunchStart && businessHours.lunchEnd) {
      lunchStart = parse(businessHours.lunchStart, 'HH:mm', date);
      lunchEnd = parse(businessHours.lunchEnd, 'HH:mm', date);
    }
    
    // Obter agendamentos existentes para a data
    const appointmentsOnDate = appointments.filter(
      app => isSameDay(app.date, date) && app.status !== 'cancelled'
    );
    
    // Gerar slots em incrementos de 30 minutos
    const startHour = openTime.getHours();
    const startMinute = openTime.getMinutes();
    const endHour = closeTime.getHours();
    const endMinute = closeTime.getMinutes();
    
    // Calcular o total de minutos para o loop
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Gerar slots em incrementos de 30 minutos
    for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      
      const slotTime = set(date, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
      const slotEndTime = new Date(slotTime.getTime() + duration * 60000);
      
      // Verificar se o slot está dentro do horário de almoço
      let isDuringLunch = false;
      if (lunchStart && lunchEnd) {
        isDuringLunch = (
          (slotTime >= lunchStart && slotTime < lunchEnd) ||
          (slotEndTime > lunchStart && slotEndTime <= lunchEnd) ||
          (slotTime <= lunchStart && slotEndTime >= lunchEnd)
        );
      }
      
      // Verificar se o slot termina antes do fechamento
      const endsBeforeClose = slotEndTime <= closeTime;
      
      // Verificar se o slot se sobrepõe a algum agendamento existente
      const isOverlapping = appointmentsOnDate.some(app => {
        const appEndTime = new Date(app.date.getTime() + app.service.duration * 60000);
        return (
          isWithinInterval(slotTime, { start: app.date, end: appEndTime }) ||
          isWithinInterval(slotEndTime, { start: app.date, end: appEndTime }) ||
          (slotTime <= app.date && slotEndTime >= appEndTime)
        );
      });
      
      slots.push({
        time: format(slotTime, 'HH:mm'),
        available: !isOverlapping && !isDuringLunch && endsBeforeClose
      });
    }
    
    return slots;
  };

  // Generate available dates and their slots for the next 14 days
  const getAvailableDates = (serviceDuration: number): DateWithSlots[] => {
    const dates: DateWithSlots[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      // Só adiciona a data se estiver disponível de acordo com os horários de funcionamento
      if (isDateAvailable(date)) {
        const slots = getAvailableTimeSlots(date, serviceDuration);
        dates.push({ date, slots });
      }
    }
    
    return dates;
  };

  return { 
    appointments, 
    addAppointment, 
    updateAppointment, 
    cancelAppointment,
    deleteAppointment, 
    sendReminder,
    getAppointment,
    getAppointmentsForDate,
    getAvailableTimeSlots,
    getAvailableDates
  };
}

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
