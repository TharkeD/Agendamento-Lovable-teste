
import { Appointment } from "./types";
import { toast } from "sonner";
import { WhatsAppNotificationService } from "./whatsapp-service";

export class NotificationService {
  static async sendAppointmentConfirmation(appointment: Appointment): Promise<boolean> {
    // Simulação de envio por email
    console.log(`Enviando confirmação para ${appointment.client.name} via email: ${appointment.client.email}`);
    
    // Tentar enviar por WhatsApp se estiver configurado e tiver o número
    let whatsappSent = false;
    
    if (WhatsAppNotificationService.isConfigured() && appointment.client.phone) {
      whatsappSent = await WhatsAppNotificationService.sendAppointmentConfirmation(appointment);
    }
    
    // Simulação de envio de email
    const emailSent = await new Promise<boolean>(resolve => {
      setTimeout(() => {
        console.log('Notificação por email enviada com sucesso!');
        toast.success(`Notificação por email enviada para ${appointment.client.email}`);
        resolve(true);
      }, 800);
    });
    
    return whatsappSent || emailSent;
  }

  static async sendAppointmentCancellation(appointment: Appointment): Promise<boolean> {
    // Simulação de envio por email
    console.log(`Enviando cancelamento para ${appointment.client.name} via email: ${appointment.client.email}`);
    
    // Tentar enviar por WhatsApp se estiver configurado e tiver o número
    let whatsappSent = false;
    
    if (WhatsAppNotificationService.isConfigured() && appointment.client.phone) {
      whatsappSent = await WhatsAppNotificationService.sendAppointmentCancellation(appointment);
    }
    
    // Simulação de envio de email
    const emailSent = await new Promise<boolean>(resolve => {
      setTimeout(() => {
        console.log('Notificação de cancelamento por email enviada!');
        toast.success(`Notificação de cancelamento enviada para ${appointment.client.email}`);
        resolve(true);
      }, 800);
    });
    
    return whatsappSent || emailSent;
  }

  static async sendAppointmentReminder(appointment: Appointment): Promise<boolean> {
    // Simulação de envio por email
    console.log(`Enviando lembrete para ${appointment.client.name} via email: ${appointment.client.email}`);
    
    // Tentar enviar por WhatsApp se estiver configurado e tiver o número
    let whatsappSent = false;
    
    if (WhatsAppNotificationService.isConfigured() && appointment.client.phone) {
      whatsappSent = await WhatsAppNotificationService.sendAppointmentReminder(appointment);
    }
    
    // Simulação de envio de email
    const emailSent = await new Promise<boolean>(resolve => {
      setTimeout(() => {
        console.log('Lembrete por email enviado!');
        toast.success(`Lembrete enviado para ${appointment.client.email}`);
        resolve(true);
      }, 800);
    });
    
    return whatsappSent || emailSent;
  }
}
