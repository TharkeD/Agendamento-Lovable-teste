import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentCard } from "@/components/ui/appointment-card";
import { PageTransition } from "@/components/layout/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle, XCircle } from "lucide-react";

const ClientAppointments = () => {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filtrar apenas os agendamentos do cliente atual
  const clientAppointments = appointments.filter(
    app => app.client.email === user?.email
  );
  
  // Agrupar agendamentos por status
  const upcomingAppointments = clientAppointments.filter(
    app => app.date > new Date() && app.status === 'scheduled'
  ).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const pastAppointments = clientAppointments.filter(
    app => app.date <= new Date() && app.status === 'scheduled'
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const cancelledAppointments = clientAppointments.filter(
    app => app.status === 'cancelled'
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Obter agendamentos para a data selecionada
  const appointmentsForSelectedDate = clientAppointments.filter(
    app => selectedDate && isSameDay(app.date, selectedDate)
  );
  
  // Datas com agendamentos para destacar no calendário
  const datesWithAppointments = clientAppointments
    .filter(app => app.status === 'scheduled')
    .map(app => app.date);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 page-container">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Meus Agendamentos</h1>
                <p className="text-muted-foreground">
                  Visualize e gerencie seus agendamentos
                </p>
              </div>
              <Link to="/book">
                <Button>Novo Agendamento</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Calendário</CardTitle>
                    <CardDescription>
                      Selecione uma data para ver seus agendamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                      locale={ptBR}
                      modifiers={{
                        appointment: (date) => 
                          datesWithAppointments.some(d => isSameDay(date, d))
                      }}
                      modifiersClassNames={{
                        appointment: "bg-primary/20 font-bold text-primary"
                      }}
                    />
                    
                    {selectedDate && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">
                          {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </h3>
                        
                        {appointmentsForSelectedDate.length > 0 ? (
                          <div className="space-y-2">
                            {appointmentsForSelectedDate.map((appointment) => (
                              <div 
                                key={appointment.id} 
                                className="p-2 rounded-md border flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">{appointment.service.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(appointment.date, "HH:mm")}
                                  </p>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  appointment.status === 'scheduled' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {appointment.status === 'scheduled' ? 'Agendado' : 'Cancelado'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Nenhum agendamento nesta data</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Agendamentos</CardTitle>
                    <CardDescription>
                      Gerencie seus agendamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="upcoming">
                      <TabsList className="mb-4">
                        <TabsTrigger value="upcoming" className="flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Próximos ({upcomingAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="past" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Passados ({pastAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex items-center">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelados ({cancelledAppointments.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upcoming" className="space-y-4">
                        {upcomingAppointments.length > 0 ? (
                          upcomingAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onCancel={cancelAppointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                            <Link to="/book" className="mt-4 inline-block">
                              <Button>Agendar Horário</Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="past" className="space-y-4">
                        {pastAppointments.length > 0 ? (
                          pastAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum agendamento passado</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="cancelled" className="space-y-4">
                        {cancelledAppointments.length > 0 ? (
                          cancelledAppointments.map((appointment) => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum agendamento cancelado</p>
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

export default ClientAppointments;
