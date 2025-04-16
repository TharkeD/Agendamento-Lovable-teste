import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useServices } from '@/hooks/use-services';

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

describe('useServices', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('services management', () => {
    it('should initialize with default services', () => {
      const { services } = useServices();
      
      // Should have some default services
      expect(services.length).toBeGreaterThan(0);
    });

    it('should add a new service', () => {
      const { services, addService } = useServices();
      
      const initialCount = services.length;
      
      const newService = {
        name: 'Test Service',
        description: 'Test Description',
        price: 100,
        duration: 60
      };
      
      addService(newService);
      
      expect(services.length).toBe(initialCount + 1);
      expect(services[services.length - 1].name).toBe('Test Service');
      expect(services[services.length - 1].price).toBe(100);
      expect(services[services.length - 1].duration).toBe(60);
    });

    it('should update an existing service', () => {
      const { services, addService, updateService } = useServices();
      
      // Add a service first
      const newService = {
        name: 'Test Service',
        description: 'Test Description',
        price: 100,
        duration: 60
      };
      
      addService(newService);
      
      const serviceId = services[services.length - 1].id;
      
      // Update the service
      updateService(serviceId, {
        name: 'Updated Service',
        price: 150
      });
      
      const updatedService = services.find(s => s.id === serviceId);
      
      expect(updatedService?.name).toBe('Updated Service');
      expect(updatedService?.price).toBe(150);
      expect(updatedService?.duration).toBe(60); // Unchanged
    });

    it('should delete a service', () => {
      const { services, addService, deleteService } = useServices();
      
      // Add a service first
      const newService = {
        name: 'Test Service',
        description: 'Test Description',
        price: 100,
        duration: 60
      };
      
      addService(newService);
      
      const initialCount = services.length;
      const serviceId = services[services.length - 1].id;
      
      // Delete the service
      deleteService(serviceId);
      
      expect(services.length).toBe(initialCount - 1);
      expect(services.find(s => s.id === serviceId)).toBeUndefined();
    });
  });

  describe('persistence', () => {
    it('should save services to localStorage', () => {
      const { addService } = useServices();
      
      const newService = {
        name: 'Test Service',
        description: 'Test Description',
        price: 100,
        duration: 60
      };
      
      addService(newService);
      
      // Check localStorage
      const savedServices = JSON.parse(localStorage.getItem('services') || '[]');
      expect(savedServices.length).toBeGreaterThan(0);
      expect(savedServices[savedServices.length - 1].name).toBe('Test Service');
    });

    it('should load services from localStorage', () => {
      // Set services in localStorage
      const mockServices = [
        {
          id: 'service-1',
          name: 'Mock Service',
          description: 'Mock Description',
          price: 200,
          duration: 30
        }
      ];
      
      localStorage.setItem('services', JSON.stringify(mockServices));
      
      // Initialize hook
      const { services } = useServices();
      
      expect(services.length).toBe(1);
      expect(services[0].name).toBe('Mock Service');
      expect(services[0].price).toBe(200);
    });
  });

  describe('service retrieval', () => {
    it('should get a service by id', () => {
      const { services, getService, addService } = useServices();
      
      // Add a service first
      const newService = {
        name: 'Test Service',
        description: 'Test Description',
        price: 100,
        duration: 60
      };
      
      addService(newService);
      
      const serviceId = services[services.length - 1].id;
      
      // Get the service
      const retrievedService = getService(serviceId);
      
      expect(retrievedService).not.toBeNull();
      expect(retrievedService?.name).toBe('Test Service');
    });

    it('should return null for non-existent service id', () => {
      const { getService } = useServices();
      
      const retrievedService = getService('non-existent-id');
      
      expect(retrievedService).toBeNull();
    });
  });
});
