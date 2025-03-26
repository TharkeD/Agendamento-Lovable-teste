
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentCard } from "@/components/ui/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import { useServices } from "@/hooks/use-services";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, CreditCard, DollarSign, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { appointments, cancelAppointment, deleteAppointment, getAppointmentsForDate } = useAppointments();
  const { services } = useServices();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const todaysAppointments = selectedDate 
    ? appointments.filter(app => isSameDay(app.date, selectedDate))
    : [];

  const upcomingAppointments = appointments.filter(
    app => app.date > new Date() && app.status === 'scheduled'
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalRevenue = appointments
    .filter(app => app.status !== 'cancelled')
    .reduce((total, app) => total + app.service.price, 0);

  const totalClients = [...new Set(appointments.map(app => app.client.id))].length;
  
  const totalBookings = appointments.filter(app => app.status !== 'cancelled').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 page-container">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <Link to="/book">
                <Button>Book Appointment</Button>
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    From {totalBookings} bookings
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Appointments
                  </CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {upcomingAppointments.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming appointments
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clients
                  </CardTitle>
                  <UsersRound className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClients}</div>
                  <p className="text-xs text-muted-foreground">
                    Total clients served
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Services
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available services
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>
                    Manage your upcoming appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="today">Today</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="space-y-4">
                      {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(appointment => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onCancel={cancelAppointment}
                            onDelete={deleteAppointment}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No upcoming appointments</p>
                          <Link to="/book" className="mt-4 inline-block">
                            <Button>Book Appointment</Button>
                          </Link>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="today" className="space-y-4">
                      {todaysAppointments.length > 0 ? (
                        todaysAppointments.map(appointment => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onCancel={cancelAppointment}
                            onDelete={deleteAppointment}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No appointments today</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>
                    View and select dates to see appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border mx-auto"
                  />
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">
                      {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                    </h3>
                    <div className="space-y-2">
                      {todaysAppointments.length > 0 ? (
                        todaysAppointments.map(appointment => (
                          <div key={appointment.id} className="flex justify-between items-center p-2 border rounded-md">
                            <div>
                              <p className="font-medium">{appointment.service.name}</p>
                              <p className="text-sm text-muted-foreground">{appointment.client.name}</p>
                            </div>
                            <p className="text-sm">
                              {format(appointment.date, "h:mm a")}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No appointments on this date</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Dashboard;
