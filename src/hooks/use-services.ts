
import { useState, useEffect } from 'react';
import { Service } from '@/lib/types';
import { toast } from "sonner";

export function useServices() {
  // In a real app, this would be fetched from an API
  const [services, setServices] = useState<Service[]>(() => {
    const savedServices = localStorage.getItem('services');
    return savedServices ? JSON.parse(savedServices) : defaultServices;
  });

  useEffect(() => {
    localStorage.setItem('services', JSON.stringify(services));
  }, [services]);

  const addService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: generateId(),
    };
    setServices([...services, newService]);
    toast.success("Service added successfully");
    return newService;
  };

  const updateService = (updatedService: Service) => {
    setServices(services.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    toast.success("Service updated successfully");
  };

  const deleteService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
    toast.success("Service deleted");
  };

  const getService = (id: string) => {
    return services.find(service => service.id === id);
  };

  return { 
    services, 
    addService, 
    updateService, 
    deleteService, 
    getService 
  };
}

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Default services to populate the app initially
const defaultServices: Service[] = [
  {
    id: "service-1",
    name: "Initial Consultation",
    description: "A comprehensive assessment of your needs and goals",
    duration: 30,
    price: 100,
  },
  {
    id: "service-2",
    name: "Strategy Session",
    description: "Develop a strategic plan for your business",
    duration: 60,
    price: 200,
  },
  {
    id: "service-3",
    name: "Implementation Support",
    description: "Hands-on guidance for executing your plan",
    duration: 90,
    price: 300,
  },
];
