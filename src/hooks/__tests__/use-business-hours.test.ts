import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useBusinessHours } from '@/hooks/use-business-hours';

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

describe('useBusinessHours', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('business hours management', () => {
    it('should initialize with default business hours', () => {
      const { businessHours } = useBusinessHours();
      
      // Should have 7 days of the week
      expect(businessHours).toHaveLength(7);
      
      // Monday should be open
      expect(businessHours[0].dayOfWeek).toBe(1); // Monday
      expect(businessHours[0].isOpen).toBe(true);
      expect(businessHours[0].openTime).toBe('09:00');
      expect(businessHours[0].closeTime).toBe('17:00');
      
      // Sunday should be closed
      expect(businessHours[6].dayOfWeek).toBe(0); // Sunday
      expect(businessHours[6].isOpen).toBe(false);
    });

    it('should update business hours', () => {
      const { businessHours, updateBusinessHours } = useBusinessHours();
      
      // Update Monday hours
      const updatedHours = [...businessHours];
      updatedHours[0] = {
        ...updatedHours[0],
        openTime: '10:00',
        closeTime: '18:00',
        lunchStart: '13:00',
        lunchEnd: '14:00'
      };
      
      updateBusinessHours(updatedHours);
      
      // Monday should have updated hours
      expect(businessHours[0].openTime).toBe('10:00');
      expect(businessHours[0].closeTime).toBe('18:00');
      expect(businessHours[0].lunchStart).toBe('13:00');
      expect(businessHours[0].lunchEnd).toBe('14:00');
    });
  });

  describe('special dates management', () => {
    it('should add a special date', () => {
      const { specialDates, addSpecialDate } = useBusinessHours();
      
      // Initially should have no special dates
      expect(specialDates).toHaveLength(0);
      
      // Add a holiday
      const holiday = {
        date: new Date('2025-12-25'),
        isOpen: false,
        name: 'Christmas',
        openTime: '',
        closeTime: '',
        lunchStart: '',
        lunchEnd: ''
      };
      
      addSpecialDate(holiday);
      
      // Should have one special date
      expect(specialDates).toHaveLength(1);
      expect(specialDates[0].name).toBe('Christmas');
      expect(specialDates[0].isOpen).toBe(false);
    });

    it('should remove a special date', () => {
      const { specialDates, addSpecialDate, removeSpecialDate } = useBusinessHours();
      
      // Add a holiday
      const holiday = {
        date: new Date('2025-12-25'),
        isOpen: false,
        name: 'Christmas',
        openTime: '',
        closeTime: '',
        lunchStart: '',
        lunchEnd: ''
      };
      
      addSpecialDate(holiday);
      
      // Should have one special date
      expect(specialDates).toHaveLength(1);
      
      // Remove the holiday
      removeSpecialDate(0);
      
      // Should have no special dates
      expect(specialDates).toHaveLength(0);
    });
  });

  describe('date availability checking', () => {
    it('should check if a date is available based on business hours', () => {
      const { isDateAvailable, updateBusinessHours, businessHours } = useBusinessHours();
      
      // Set all days to closed
      const closedHours = businessHours.map(day => ({
        ...day,
        isOpen: false
      }));
      
      updateBusinessHours(closedHours);
      
      // Check a Monday
      const monday = new Date('2025-04-21'); // A Monday
      expect(isDateAvailable(monday)).toBe(false);
      
      // Set Monday to open
      const updatedHours = [...closedHours];
      updatedHours[0] = {
        ...updatedHours[0],
        isOpen: true
      };
      
      updateBusinessHours(updatedHours);
      
      // Check Monday again
      expect(isDateAvailable(monday)).toBe(true);
    });

    it('should check if a date is available based on special dates', () => {
      const { isDateAvailable, addSpecialDate } = useBusinessHours();
      
      // Add a holiday
      const holiday = {
        date: new Date('2025-12-25'),
        isOpen: false,
        name: 'Christmas',
        openTime: '',
        closeTime: '',
        lunchStart: '',
        lunchEnd: ''
      };
      
      addSpecialDate(holiday);
      
      // Check Christmas
      const christmas = new Date('2025-12-25');
      expect(isDateAvailable(christmas)).toBe(false);
      
      // Add a special open day
      const specialDay = {
        date: new Date('2025-12-26'),
        isOpen: true,
        name: 'Boxing Day Special',
        openTime: '10:00',
        closeTime: '16:00',
        lunchStart: '',
        lunchEnd: ''
      };
      
      addSpecialDate(specialDay);
      
      // Check Boxing Day
      const boxingDay = new Date('2025-12-26');
      expect(isDateAvailable(boxingDay)).toBe(true);
    });
  });

  describe('hours retrieval', () => {
    it('should get hours for a specific date based on business hours', () => {
      const { getHoursForDate } = useBusinessHours();
      
      // Check a Monday
      const monday = new Date('2025-04-21'); // A Monday
      const mondayHours = getHoursForDate(monday);
      
      expect(mondayHours).not.toBeNull();
      expect(mondayHours?.openTime).toBe('09:00');
      expect(mondayHours?.closeTime).toBe('17:00');
    });

    it('should get hours for a specific date based on special dates', () => {
      const { getHoursForDate, addSpecialDate } = useBusinessHours();
      
      // Add a special open day
      const specialDay = {
        date: new Date('2025-12-26'),
        isOpen: true,
        name: 'Boxing Day Special',
        openTime: '10:00',
        closeTime: '16:00',
        lunchStart: '12:30',
        lunchEnd: '13:30'
      };
      
      addSpecialDate(specialDay);
      
      // Check Boxing Day
      const boxingDay = new Date('2025-12-26');
      const boxingDayHours = getHoursForDate(boxingDay);
      
      expect(boxingDayHours).not.toBeNull();
      expect(boxingDayHours?.openTime).toBe('10:00');
      expect(boxingDayHours?.closeTime).toBe('16:00');
      expect(boxingDayHours?.lunchStart).toBe('12:30');
      expect(boxingDayHours?.lunchEnd).toBe('13:30');
    });

    it('should return null for hours if date is not available', () => {
      const { getHoursForDate, addSpecialDate } = useBusinessHours();
      
      // Add a holiday
      const holiday = {
        date: new Date('2025-12-25'),
        isOpen: false,
        name: 'Christmas',
        openTime: '',
        closeTime: '',
        lunchStart: '',
        lunchEnd: ''
      };
      
      addSpecialDate(holiday);
      
      // Check Christmas
      const christmas = new Date('2025-12-25');
      const christmasHours = getHoursForDate(christmas);
      
      expect(christmasHours).toBeNull();
    });
  });
});
