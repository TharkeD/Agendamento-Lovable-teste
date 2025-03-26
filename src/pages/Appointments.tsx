
import { useState } from "react";
import { format, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  
  // Função para formatar preço em Reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Filtrar compromissos com base na consulta de pesquisa e filtro de status
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
  
  // Agrupar compromissos por status
  const scheduledAppointments = filteredAppointments.filter(app => app.status === 'scheduled');
  const completedAppointments = filteredAppointments.filter(app => app.status === 'completed');
  const cancelledAppointments = filteredAppointments.filter(app => app.status === 'cancelled');
  
  // Obter compromissos para a data selecionada
  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment => 
      date.getDate() === appointment.date.getDate() &&
      date.getMonth() === appointment.date.getMonth() &&
      date.getFullYear() === appointment.date.getFullYear()
    );
  };
  
  // Obter datas com compromissos para o calendário
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
                <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
                <p className="text-muted-foreground">
                  Visualize e gerencie todos os seus agendamentos
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
                      Selecione uma data para ver agendamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                      locale={ptBR}
                    />
                    
                    {selectedDate && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">
                          {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                                  {format(appointment.date, "HH:mm")}
                                </p>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle>Lista de Agendamentos</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Buscar agendamentos..."
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
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="scheduled">Agendados</SelectItem>
                            <SelectItem value="completed">Concluídos</SelectItem>
                            <SelectItem value="cancelled">Cancelados</SelectItem>
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
                          Todos ({filteredAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="scheduled" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Agendados ({scheduledAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center">
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Concluídos ({completedAppointments.length})
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex items-center">
                          <X className="mr-2 h-4 w-4" />
                          Cancelados ({cancelledAppointments.length})
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
                              formatPrice={(price) => formatCurrency(price)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                            <Link to="/book" className="mt-4 inline-block">
                              <Button>Criar Agendamento</Button>
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
                              formatPrice={(price) => formatCurrency(price)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum agendamento programado</p>
                            <Link to="/book" className="mt-4 inline-block">
                              <Button>Criar Agendamento</Button>
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
                              formatPrice={(price) => formatCurrency(price)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhum agendamento concluído</p>
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
                              formatPrice={(price) => formatCurrency(price)}
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

export default Appointments;
