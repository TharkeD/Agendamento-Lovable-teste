import { useState, useEffect } from 'react';
import { Appointment, DateWithSlots, TimeSlot } from '@/lib/types';
import { toast } from "sonner";
import { addDays, format, isSameDay, isWithinInterval, set } from 'date-fns';
import { NotificationService } from '@/lib/notification-service';

export function useAppointments() {
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
    // Business hours from 9 AM to 5 PM
    const startHour = 9;
    const endHour = 17;
    const slots: TimeSlot[] = [];
    
    const appointmentsOnDate = appointments.filter(
      app => isSameDay(app.date, date) && app.status !== 'cancelled'
    );
    
    // Generate slots in 30-minute increments
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = set(date, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
        const slotEndTime = new Date(slotTime.getTime() + duration * 60000);
        
        // Check if slot overlaps with any existing appointment
        const isOverlapping = appointmentsOnDate.some(app => {
          const appEndTime = new Date(app.date.getTime() + app.service.duration * 60000);
          return (
            isWithinInterval(slotTime, { start: app.date, end: appEndTime }) ||
            isWithinInterval(slotEndTime, { start: app.date, end: appEndTime }) ||
            (slotTime <= app.date && slotEndTime >= appEndTime)
          );
        });
        
        slots.push({
          time: format(slotTime, 'h:mm a'),
          available: !isOverlapping
        });
      }
    }
    
    return slots;
  };

  // Generate available dates and their slots for the next 14 days
  const getAvailableDates = (serviceDuration: number): DateWithSlots[] => {
    const dates: DateWithSlots[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const slots = getAvailableTimeSlots(date, serviceDuration);
      dates.push({ date, slots });
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
