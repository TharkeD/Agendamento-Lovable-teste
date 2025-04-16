export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Appointment {
  id: string;
  service: Service;
  client: Client;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export type TimeSlot = {
  time: string;
  available: boolean;
}

export type DateWithSlots = {
  date: Date;
  slots: TimeSlot[];
}

export interface BusinessHours {
  dayOfWeek: number; // 0 = domingo, 1 = segunda, ..., 6 = sábado
  isOpen: boolean;
  openTime: string; // formato "HH:MM"
  closeTime: string; // formato "HH:MM"
  lunchStart?: string; // formato "HH:MM", opcional
  lunchEnd?: string; // formato "HH:MM", opcional
}

export interface SpecialDate {
  id: string;
  date: Date;
  isOpen: boolean;
  openTime?: string; // formato "HH:MM", opcional se isOpen = false
  closeTime?: string; // formato "HH:MM", opcional se isOpen = false
  description: string;
}
