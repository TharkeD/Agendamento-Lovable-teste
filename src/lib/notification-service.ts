
import { Appointment } from "./types";
import { toast } from "sonner";

export class NotificationService {
  static async sendAppointmentConfirmation(appointment: Appointment): Promise<boolean> {
    // Esta é uma simulação. Em um ambiente real, você integraria com:
    // - API de SMS (Twilio, MessageBird)
    // - API de Email (SendGrid, MailChimp)
    // - API do WhatsApp Business

    console.log(`Enviando confirmação para ${appointment.client.name} via email: ${appointment.client.email}`);
    
    // Simula o envio com um timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Notificação enviada com sucesso!');
        toast.success(`Notificação enviada para ${appointment.client.email}`);
        resolve(true);
      }, 1000);
    });
  }

  static async sendAppointmentCancellation(appointment: Appointment): Promise<boolean> {
    console.log(`Enviando cancelamento para ${appointment.client.name} via email: ${appointment.client.email}`);
    
    // Simula o envio com um timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Notificação de cancelamento enviada!');
        toast.success(`Notificação de cancelamento enviada para ${appointment.client.email}`);
        resolve(true);
      }, 1000);
    });
  }

  static async sendAppointmentReminder(appointment: Appointment): Promise<boolean> {
    console.log(`Enviando lembrete para ${appointment.client.name} via email: ${appointment.client.email}`);
    
    // Simula o envio com um timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Lembrete enviado!');
        toast.success(`Lembrete enviado para ${appointment.client.email}`);
        resolve(true);
      }, 1000);
    });
  }
}

