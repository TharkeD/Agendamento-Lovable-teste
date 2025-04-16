import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Appointment } from '@/lib/types';
import { NotificationService } from '@/lib/notification-service';
import { useAuth } from './use-auth';

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    whatsapp: false,
    reminderHours: 24
  });

  // Carregar preferências do localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedPrefs = localStorage.getItem(`notification_prefs_${user.id}`);
      if (savedPrefs) {
        setNotificationPreferences(JSON.parse(savedPrefs));
      }
    }
  }, [isAuthenticated, user]);

  // Salvar preferências no localStorage
  const savePreferences = (prefs: typeof notificationPreferences) => {
    if (isAuthenticated && user) {
      setNotificationPreferences(prefs);
      localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(prefs));
      toast.success("Preferências de notificação salvas");
    }
  };

  // Atualizar preferências
  const updatePreferences = (updates: Partial<typeof notificationPreferences>) => {
    const newPrefs = { ...notificationPreferences, ...updates };
    savePreferences(newPrefs);
  };

  // Enviar notificação de teste
  const sendTestNotification = async (contactInfo: string, isEmail: boolean) => {
    try {
      if (isEmail) {
        // Simulação de envio de email
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Email de teste enviado com sucesso");
        return true;
      } else {
        // Envio de WhatsApp
        const sent = await NotificationService.sendWhatsAppMessage(
          contactInfo,
          "Esta é uma mensagem de teste do sistema de agendamentos."
        );
        
        if (sent) {
          toast.success("Mensagem WhatsApp de teste enviada com sucesso");
        } else {
          toast.error("Falha ao enviar mensagem de teste");
        }
        
        return sent;
      }
    } catch (error) {
      toast.error("Erro ao enviar notificação de teste");
      console.error(error);
      return false;
    }
  };

  // Verificar se há agendamentos próximos que precisam de lembretes
  const checkUpcomingAppointments = (appointments: Appointment[]) => {
    if (!isAuthenticated || !user) return;
    
    const now = new Date();
    const userAppointments = appointments.filter(
      app => app.client.email === user.email && app.status === 'scheduled'
    );
    
    userAppointments.forEach(appointment => {
      const appointmentTime = new Date(appointment.date);
      const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Verificar se está dentro do intervalo de lembrete configurado
      if (hoursUntilAppointment > 0 && hoursUntilAppointment <= notificationPreferences.reminderHours) {
        // Aqui seria enviado o lembrete real
        // Por enquanto, apenas mostramos um toast para simulação
        toast.info(`Lembrete: Você tem um agendamento de ${appointment.service.name} em ${Math.floor(hoursUntilAppointment)} horas`);
      }
    });
  };

  return {
    notificationPreferences,
    updatePreferences,
    sendTestNotification,
    checkUpcomingAppointments
  };
}
