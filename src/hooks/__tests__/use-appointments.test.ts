import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAppointments } from '@/hooks/use-appointments';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { addDays, format } from 'date-fns';

// Mock hooks
vi.mock('@/hooks/use-business-hours', () => ({
  useBusinessHours: vi.fn()
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

// Mock NotificationService
vi.mock('@/lib/notification-service', () => ({
  NotificationService: {
    sendAppointmentConfirmation: vi.fn().mockResolvedValue(true),
    sendAppointmentCancellation: vi.fn().mockResolvedValue(true),
    sendAppointmentReminder: vi.fn().mockResolvedValue(true)
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('useAppointments', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock business hours
    (useBusinessHours as any).mockReturnValue({
      isDateAvailable: (date: Date) => true,
      getHoursForDate: (date: Date) => ({
        openTime: '09:00',
        closeTime: '17:00',
        lunchStart: '12:00',
        lunchEnd: '13:00'
      })
    });
  });

  describe('appointments management', () => {
    it('should add a new appointment', async () => {
      const { addAppointment, appointments } = useAppointments();
      
      const newAppointment = {
        service: {
          id: 'service-1',
          name: 'Test Service',
          description: 'Test Description',
          price: 100,
          duration: 60
        },
        client: {
          id: 'client-1',
          name: 'Test Client',
          email: 'client@example.com',
          phone: '123456789'
        },
        date: new Date('2025-05-01T10:00:00'),
        notes: 'Test notes'
      };
      
      await addAppointment(newAppointment);
      
      expect(appointments).toHaveLength(1);
      expect(appointments[0].service.name).toBe('Test Service');
      expect(appointments[0].client.name).toBe('Test Client');
      expect(appointments[0].status).toBe('scheduled');
    });

    it('should cancel an appointment', async () => {
      const { addAppointment, cancelAppointment, appointments } = useAppointments();
      
      const newAppointment = {
        service: {
          id: 'service-1',
          name: 'Test Service',
          description: 'Test Description',
          price: 100,
          duration: 60
        },
        client: {
          id: 'client-1',
          name: 'Test Client',
          email: 'client@example.com',
          phone: '123456789'
        },
        date: new Date('2025-05-01T10:00:00'),
        notes: 'Test notes'
      };
      
      const added = await addAppointment(newAppointment);
      await cancelAppointment(added.id);
      
      expect(appointments[0].status).toBe('cancelled');
    });

    it('should delete an appointment', async () => {
      const { addAppointment, deleteAppointment, appointments } = useAppointments();
      
      const newAppointment = {
        service: {
          id: 'service-1',
          name: 'Test Service',
          description: 'Test Description',
          price: 100,
          duration: 60
        },
        client: {
          id: 'client-1',
          name: 'Test Client',
          email: 'client@example.com',
          phone: '123456789'
        },
        date: new Date('2025-05-01T10:00:00'),
        notes: 'Test notes'
      };
      
      const added = await addAppointment(newAppointment);
      await deleteAppointment(added.id);
      
      expect(appointments).toHaveLength(0);
    });
  });

  describe('available time slots', () => {
    it('should generate available time slots based on business hours', () => {
      const { getAvailableTimeSlots } = useAppointments();
      
      const date = new Date('2025-05-01');
      const slots = getAvailableTimeSlots(date, 60);
      
      // Should have slots from 9:00 to 17:00, excluding lunch time (12:00-13:00)
      // With 30-minute increments, that's 16 slots - 2 lunch slots = 14 slots
      expect(slots).toHaveLength(14);
      
      // First slot should be 9:00
      expect(slots[0].time).toBe('09:00');
      expect(slots[0].available).toBe(true);
      
      // Lunch slots should not be included
      const lunchSlots = slots.filter(slot => 
        slot.time === '12:00' || slot.time === '12:30'
      );
      expect(lunchSlots).toHaveLength(0);
    });

    it('should mark slots as unavailable if they overlap with existing appointments', async () => {
      const { addAppointment, getAvailableTimeSlots } = useAppointments();
      
      const date = new Date('2025-05-01');
      
      // Add an appointment at 10:00 for 60 minutes
      await addAppointment({
        service: {
          id: 'service-1',
          name: 'Test Service',
          description: 'Test Description',
          price: 100,
          duration: 60
        },
        client: {
          id: 'client-1',
          name: 'Test Client',
          email: 'client@example.com',
          phone: '123456789'
        },
        date: new Date('2025-05-01T10:00:00'),
        notes: 'Test notes'
      });
      
      const slots = getAvailableTimeSlots(date, 30);
      
      // Find the 10:00 and 10:30 slots
      const tenAMSlot = slots.find(slot => slot.time === '10:00');
      const tenThirtyAMSlot = slots.find(slot => slot.time === '10:30');
      
      expect(tenAMSlot?.available).toBe(false);
      expect(tenThirtyAMSlot?.available).toBe(false);
    });

    it('should return empty array if date is not available', () => {
      // Mock business hours to make date unavailable
      (useBusinessHours as any).mockReturnValue({
        isDateAvailable: (date: Date) => false,
        getHoursForDate: (date: Date) => null
      });
      
      const { getAvailableTimeSlots } = useAppointments();
      
      const date = new Date('2025-05-01');
      const slots = getAvailableTimeSlots(date, 60);
      
      expect(slots).toHaveLength(0);
    });
  });

  describe('available dates', () => {
    it('should generate available dates for the next 14 days', () => {
      const { getAvailableDates } = useAppointments();
      
      const dates = getAvailableDates(60);
      
      // Should have dates for the next 14 days
      expect(dates).toHaveLength(14);
      
      // First date should be today
      const today = new Date();
      expect(dates[0].date.getDate()).toBe(today.getDate());
      expect(dates[0].date.getMonth()).toBe(today.getMonth());
      expect(dates[0].date.getFullYear()).toBe(today.getFullYear());
      
      // Last date should be 13 days from today
      const lastDate = addDays(today, 13);
      expect(dates[13].date.getDate()).toBe(lastDate.getDate());
      expect(dates[13].date.getMonth()).toBe(lastDate.getMonth());
      expect(dates[13].date.getFullYear()).toBe(lastDate.getFullYear());
    });

    it('should only include dates that are available', () => {
      // Mock business hours to make some dates unavailable
      (useBusinessHours as any).mockReturnValue({
        isDateAvailable: (date: Date) => {
          // Make weekends unavailable
          const day = date.getDay();
          return day !== 0 && day !== 6;
        },
        getHoursForDate: (date: Date) => ({
          openTime: '09:00',
          closeTime: '17:00',
          lunchStart: '12:00',
          lunchEnd: '13:00'
        })
      });
      
      const { getAvailableDates } = useAppointments();
      
      const dates = getAvailableDates(60);
      
      // Should have fewer than 14 dates (excluding weekends)
      expect(dates.length).toBeLessThan(14);
      
      // All dates should be weekdays
      dates.forEach(dateWithSlots => {
        const day = dateWithSlots.date.getDay();
        expect(day).not.toBe(0); // Not Sunday
        expect(day).not.toBe(6); // Not Saturday
      });
    });
  });
});
