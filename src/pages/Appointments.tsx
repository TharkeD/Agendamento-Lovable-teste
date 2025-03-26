
import { useState } from "react";
import { format, isSameMonth } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { AppointmentCard } from "@/components/ui/appointment-card";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/hooks/use-appointments";
import { Appointment } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheck, Clock, LinkIcon, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const Appointments = () => {
  const { appointments, cancelAppointment, deleteAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Filter appointments based on search query and status filter
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Group appointments by status
  const scheduledAppointments = filteredAppointments.filter(app => app.status === 'scheduled');
  const completedAppointments = filteredAppointments.filter(app => app.status === 'completed');
  const cancelledAppointments = filteredAppointments.filter(app => app.status === 'cancelled');
  
  // Get appointments for the selected date
  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment => 
      date.getDate() === appointment.date.getDate() &&
      date.getMonth() === appointment.date.getMonth() &&
      date.getFullYear() === appointment.date.getFullYear()
    );
  };
  
  // Get dates with appointments for the calendar
  const getDatesWithAppointments = () => {
    return appointments.filter(app => 
      selectedDate && isSameMonth(app.date, selectedDate)
    ).map(app => app.date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 page-container">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                <p className="text-muted-foreground">
                  View and manage all your appointments
                </p>
              </div>
              <Link to="/book">
                <Button>New Appointment</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                    <CardDescription>
                      Select a date to view appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                    />
                    
                    {selectedDate && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">
                          {format(selectedDate, "MMMM d, yyyy")}
                        </h3>
                        
                        {getAppointmentsForDate(selectedDate).length > 0 ? (
                          <div className="space-y-2">
                            {getAppointmentsForDate(selectedDate).map((appointment) => (
                              <div 
                                key={appointment.id} 
                                className="p-2 rounded-md border flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">{appointment.service.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.client.name}
                                  </p>
                                </div>
                                <p className="text-sm font-medium">
                                  {format(appointment.date, "h:mm a")}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No appointments on this date</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle>Appointment List</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search appointments..."
                            className="pl-8 w-full md:w-auto"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select 
                          value={statusFilter} 
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all">
                      <TabsList className="mb-4">
                        <TabsTrigger value="all" className="flex items-center">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          All ({filteredAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Scheduled ({scheduledAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center">
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Completed ({completedAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex items-center">
                          <X className="mr-2 h-4 w-4" />
                          Cancelled ({cancelledAppointments.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="all" className="space-y-4">
                        {filteredAppointments.length > 0 ? (
                          filteredAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onCancel={
                                appointment.status === 'scheduled' 
                                  ? cancelAppointment 
                                  : undefined
                              }
                              onDelete={deleteAppointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No appointments found</p>
                            <Link to="/book" className="mt-4 inline-block">
                              <Button>Create Appointment</Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="scheduled" className="space-y-4">
                        {scheduledAppointments.length > 0 ? (
                          scheduledAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onCancel={cancelAppointment}
                              onDelete={deleteAppointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No scheduled appointments</p>
                            <Link to="/book" className="mt-4 inline-block">
                              <Button>Create Appointment</Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="completed" className="space-y-4">
                        {completedAppointments.length > 0 ? (
                          completedAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onDelete={deleteAppointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No completed appointments</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="cancelled" className="space-y-4">
                        {cancelledAppointments.length > 0 ? (
                          cancelledAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onDelete={deleteAppointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No cancelled appointments</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Appointments;
