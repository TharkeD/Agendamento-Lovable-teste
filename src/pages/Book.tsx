
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ServiceCard } from "@/components/ui/service-card";
import { Button } from "@/components/ui/button";
import { useServices } from "@/hooks/use-services";
import { useAppointments } from "@/hooks/use-appointments";
import { Service, Client, TimeSlot, DateWithSlots } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";

const clientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

// Steps for the booking process
enum BookingStep {
  SelectService,
  SelectDateTime,
  EnterDetails,
  Confirmation
}

const Book = () => {
  const navigate = useNavigate();
  const { services } = useServices();
  const { addAppointment, getAvailableDates } = useAppointments();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.SelectService);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<DateWithSlots[]>([]);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Calculate available dates based on the selected service duration
    setAvailableDates(getAvailableDates(service.duration));
    setCurrentStep(BookingStep.SelectDateTime);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset time when date changes
    }
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleNextStep = () => {
    if (currentStep === BookingStep.SelectDateTime && selectedDate && selectedTime) {
      setCurrentStep(BookingStep.EnterDetails);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep === BookingStep.SelectDateTime) {
      setCurrentStep(BookingStep.SelectService);
    } else if (currentStep === BookingStep.EnterDetails) {
      setCurrentStep(BookingStep.SelectDateTime);
    }
  };
  
  const onSubmit = (values: ClientFormValues) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Parse the time string to create a proper date object
    const [hours, minutes] = selectedTime.split(':');
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const client: Client = {
      id: Math.random().toString(36).substring(2, 9),
      name: values.name,
      email: values.email,
      phone: values.phone,
    };
    
    try {
      addAppointment({
        service: selectedService,
        client,
        date: appointmentDate,
        notes: values.notes,
      });
      
      setCurrentStep(BookingStep.Confirmation);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  const getAvailableTimeSlotsForDate = (date: Date | null): TimeSlot[] => {
    if (!date || !selectedService) return [];
    
    const dateWithSlots = availableDates.find(d => 
      d.date.getDate() === date.getDate() && 
      d.date.getMonth() === date.getMonth() && 
      d.date.getFullYear() === date.getFullYear()
    );
    
    return dateWithSlots?.slots || [];
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case BookingStep.SelectService:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Select a Service</h2>
              <p className="text-muted-foreground">
                Choose the service you'd like to book
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  mode="select"
                  onClick={handleServiceSelect}
                />
              ))}
            </div>
          </motion.div>
        );
        
      case BookingStep.SelectDateTime:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Select Date & Time</h2>
              <p className="text-muted-foreground">
                Choose a date and time for your {selectedService?.name}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select a Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={handleDateSelect}
                    className="rounded-md border mx-auto"
                    disabled={(date) => {
                      // Disable dates that have no available slots
                      const dateWithSlots = availableDates.find(d => 
                        d.date.getDate() === date.getDate() && 
                        d.date.getMonth() === date.getMonth() && 
                        d.date.getFullYear() === date.getFullYear()
                      );
                      
                      if (!dateWithSlots) return true;
                      
                      return !dateWithSlots.slots.some(slot => slot.available);
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select a Time</CardTitle>
                  <CardDescription>
                    {selectedDate 
                      ? `Available times on ${format(selectedDate, "MMMM d, yyyy")}` 
                      : "Please select a date first"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {getAvailableTimeSlotsForDate(selectedDate).map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={slot.available ? "" : "opacity-50"}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a date to see available times
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={!selectedDate || !selectedTime}
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );
        
      case BookingStep.EnterDetails:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Your Information</h2>
              <p className="text-muted-foreground">
                Please enter your details to complete the booking
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                  <CardDescription>Review your appointment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${selectedService?.price}</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Your email address" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="Your phone number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or information" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      
                      <Button type="submit">
                        Complete Booking
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </motion.div>
        );
        
      case BookingStep.Confirmation:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md mx-auto py-10"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full p-3 bg-green-100">
                <Check className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Your appointment has been scheduled successfully.
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{selectedService?.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">${selectedService?.price}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 page-container pb-20">
          <div className="max-w-5xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex justify-between items-center max-w-md mx-auto">
                {[
                  { step: BookingStep.SelectService, label: "Service" },
                  { step: BookingStep.SelectDateTime, label: "Date & Time" },
                  { step: BookingStep.EnterDetails, label: "Details" },
                  { step: BookingStep.Confirmation, label: "Confirmation" },
                ].map((stepInfo, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`rounded-full w-8 h-8 flex items-center justify-center text-sm ${
                        currentStep >= stepInfo.step
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {currentStep > stepInfo.step ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span 
                      className={`text-xs mt-1 ${
                        currentStep >= stepInfo.step ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stepInfo.label}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="relative mt-2 max-w-md mx-auto">
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-secondary" />
                <div 
                  className="absolute top-0 left-4 h-0.5 bg-primary transition-all duration-300"
                  style={{ 
                    width: `${(currentStep / (Object.keys(BookingStep).length / 2 - 1)) * 100}%`,
                    maxWidth: "calc(100% - 2rem)" 
                  }}
                />
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Book;
