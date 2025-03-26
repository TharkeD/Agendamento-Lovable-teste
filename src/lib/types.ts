
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
