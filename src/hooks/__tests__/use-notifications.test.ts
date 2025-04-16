import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from '@/hooks/use-auth';
import { NotificationService } from '@/lib/notification-service';

// Mock hooks and services
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/lib/notification-service', () => ({
  NotificationService: {
    sendWhatsAppMessage: vi.fn(),
    sendAppointmentConfirmation: vi.fn(),
    sendAppointmentCancellation: vi.fn(),
    sendAppointmentReminder: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('useNotifications', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock auth
    (useAuth as any).mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'client'
      },
      isAuthenticated: true
    });
  });

  describe('notification preferences', () => {
    it('should initialize with default preferences', () => {
      const { notificationPreferences } = useNotifications();
      
      expect(notificationPreferences.email).toBe(true);
      expect(notificationPreferences.whatsapp).toBe(false);
      expect(notificationPreferences.reminderHours).toBe(24);
    });

    it('should load preferences from localStorage if available', () => {
      // Set preferences in localStorage
      localStorage.setItem('notification_prefs_user-1', JSON.stringify({
        email: false,
        whatsapp: true,
        reminderHours: 12
      }));
      
      const { notificationPreferences } = useNotifications();
      
      expect(notificationPreferences.email).toBe(false);
      expect(notificationPreferences.whatsapp).toBe(true);
      expect(notificationPreferences.reminderHours).toBe(12);
    });

    it('should update preferences', () => {
      const { notificationPreferences, updatePreferences } = useNotifications();
      
      // Update preferences
      updatePreferences({
        email: false,
        whatsapp: true,
        reminderHours: 48
      });
      
      expect(notificationPreferences.email).toBe(false);
      expect(notificationPreferences.whatsapp).toBe(true);
      expect(notificationPreferences.reminderHours).toBe(48);
      
      // Should save to localStorage
      const savedPrefs = JSON.parse(localStorage.getItem('notification_prefs_user-1') || '{}');
      expect(savedPrefs.email).toBe(false);
      expect(savedPrefs.whatsapp).toBe(true);
      expect(savedPrefs.reminderHours).toBe(48);
    });
  });

  describe('test notifications', () => {
    it('should send test email notification', async () => {
      const { sendTestNotification } = useNotifications();
      
      await sendTestNotification('test@example.com', true);
      
      // Should show success toast
      expect(require('sonner').toast.success).toHaveBeenCalled();
    });

    it('should send test WhatsApp notification', async () => {
      (NotificationService.sendWhatsAppMessage as any).mockResolvedValue(true);
      
      const { sendTestNotification } = useNotifications();
      
      await sendTestNotification('+1234567890', false);
      
      // Should call WhatsApp service
      expect(NotificationService.sendWhatsAppMessage).toHaveBeenCalledWith(
        '+1234567890',
        expect.any(String)
      );
      
      // Should show success toast
      expect(require('sonner').toast.success).toHaveBeenCalled();
    });

    it('should handle failed WhatsApp notification', async () => {
      (NotificationService.sendWhatsAppMessage as any).mockResolvedValue(false);
      
      const { sendTestNotification } = useNotifications();
      
      await sendTestNotification('+1234567890', false);
      
      // Should show error toast
      expect(require('sonner').toast.error).toHaveBeenCalled();
    });
  });

  describe('appointment reminders', () => {
    it('should check for upcoming appointments and send reminders', () => {
      const { checkUpcomingAppointments } = useNotifications();
      
      const now = new Date();
      const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const appointments = [
        {
          id: 'appointment-1',
          service: {
            id: 'service-1',
            name: 'Test Service',
            description: 'Test Description',
            price: 100,
            duration: 60
          },
          client: {
            id: 'client-1',
            name: 'Test User',
            email: 'test@example.com',
            phone: '123456789'
          },
          date: inTwoHours,
          notes: 'Test notes',
          status: 'scheduled'
        }
      ];
      
      checkUpcomingAppointments(appointments);
      
      // Should show info toast for reminder
      expect(require('sonner').toast.info).toHaveBeenCalled();
    });

    it('should not send reminders for appointments outside reminder window', () => {
      const { checkUpcomingAppointments, updatePreferences } = useNotifications();
      
      // Set reminder hours to 1
      updatePreferences({
        reminderHours: 1
      });
      
      const now = new Date();
      const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const appointments = [
        {
          id: 'appointment-1',
          service: {
            id: 'service-1',
            name: 'Test Service',
            description: 'Test Description',
            price: 100,
            duration: 60
          },
          client: {
            id: 'client-1',
            name: 'Test User',
            email: 'test@example.com',
            phone: '123456789'
          },
          date: inTwoHours,
          notes: 'Test notes',
          status: 'scheduled'
        }
      ];
      
      checkUpcomingAppointments(appointments);
      
      // Should not show info toast for reminder
      expect(require('sonner').toast.info).not.toHaveBeenCalled();
    });
  });
});
