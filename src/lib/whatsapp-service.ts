
import { Appointment } from './types';
import { toast } from "sonner";

interface WhatsAppNotificationConfig {
  apiKey: string; // API key do serviço de WhatsApp
  senderId: string; // ID do remetente ou número de telefone
  baseUrl: string; // URL base da API
}

export class WhatsAppNotificationService {
  private static config: WhatsAppNotificationConfig | null = null;
  
  // Método para configurar a API
  static setConfig(config: WhatsAppNotificationConfig) {
    this.config = config;
    localStorage.setItem('whatsapp_api_config', JSON.stringify(config));
    return true;
  }
  
  // Carrega a configuração do localStorage
  static getConfig(): WhatsAppNotificationConfig | null {
    if (this.config) return this.config;
    
    const savedConfig = localStorage.getItem('whatsapp_api_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
      return this.config;
    }
    
    return null;
  }
  
  // Verifica se o serviço está configurado
  static isConfigured(): boolean {
    return this.getConfig() !== null;
  }
  
  // Envia mensagem via WhatsApp
  static async sendMessage(phone: string, message: string): Promise<boolean> {
    const config = this.getConfig();
    
    if (!config) {
      console.error('WhatsApp API não configurada');
      return false;
    }
    
    if (!phone) {
      console.error('Número de telefone não informado');
      return false;
    }
    
    // Simulação de envio para este exemplo
    // Em um cenário real, usaria fetch para chamar a API
    console.log(`Enviando WhatsApp para ${phone}: ${message}`);
    
    try {
      // Simulação de resposta da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Em um cenário real, seria algo assim:
      // const response = await fetch(`${config.baseUrl}/send`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${config.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     from: config.senderId,
      //     to: phone,
      //     text: message
      //   })
      // });
      // const data = await response.json();
      // return data.success;
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }
  
  // Envia notificação de confirmação de agendamento
  static async sendAppointmentConfirmation(appointment: Appointment): Promise<boolean> {
    if (!appointment.client.phone) {
      console.log('Cliente não possui número de telefone para WhatsApp');
      return false;
    }
    
    const message = `Olá ${appointment.client.name}, seu agendamento para ${appointment.service.name} foi confirmado para ${new Date(appointment.date).toLocaleString()}. Obrigado por agendar conosco!`;
    
    const sent = await this.sendMessage(appointment.client.phone, message);
    if (sent) {
      toast.success(`WhatsApp de confirmação enviado para ${appointment.client.name}`);
    }
    
    return sent;
  }
  
  // Envia notificação de cancelamento de agendamento
  static async sendAppointmentCancellation(appointment: Appointment): Promise<boolean> {
    if (!appointment.client.phone) {
      console.log('Cliente não possui número de telefone para WhatsApp');
      return false;
    }
    
    const message = `Olá ${appointment.client.name}, seu agendamento para ${appointment.service.name} marcado para ${new Date(appointment.date).toLocaleString()} foi cancelado. Entre em contato para mais informações.`;
    
    const sent = await this.sendMessage(appointment.client.phone, message);
    if (sent) {
      toast.success(`WhatsApp de cancelamento enviado para ${appointment.client.name}`);
    }
    
    return sent;
  }
  
  // Envia lembrete de agendamento
  static async sendAppointmentReminder(appointment: Appointment): Promise<boolean> {
    if (!appointment.client.phone) {
      console.log('Cliente não possui número de telefone para WhatsApp');
      return false;
    }
    
    const message = `Olá ${appointment.client.name}, lembrete do seu agendamento para ${appointment.service.name} amanhã às ${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Estamos aguardando você!`;
    
    const sent = await this.sendMessage(appointment.client.phone, message);
    if (sent) {
      toast.success(`WhatsApp de lembrete enviado para ${appointment.client.name}`);
    }
    
    return sent;
  }
}
