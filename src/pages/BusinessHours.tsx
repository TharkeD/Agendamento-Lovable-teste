import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { useBusinessHours } from "@/hooks/use-business-hours";
import { BusinessHours as BusinessHoursType, SpecialDate } from "@/lib/types";
import { format, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX, Clock } from "lucide-react";

const BusinessHoursPage = () => {
  const { isAdmin } = useAuth();
  const { 
    businessHours, 
    specialDates, 
    updateBusinessHours, 
    addSpecialDate, 
    updateSpecialDate, 
    deleteSpecialDate 
  } = useBusinessHours();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddingSpecialDate, setIsAddingSpecialDate] = useState(false);
  const [specialDateOpen, setSpecialDateOpen] = useState(true);
  const [specialDateOpenTime, setSpecialDateOpenTime] = useState("09:00");
  const [specialDateCloseTime, setSpecialDateCloseTime] = useState("18:00");
  const [specialDateDescription, setSpecialDateDescription] = useState("");
  
  // Estado para edição de horário comercial
  const [editingDay, setEditingDay] = useState<BusinessHoursType | null>(null);
  
  // Função para obter o nome do dia da semana
  const getDayName = (dayOfWeek: number): string => {
    const days = [
      "Domingo", "Segunda-feira", "Terça-feira", 
      "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
    ];
    return days[dayOfWeek];
  };
  
  // Manipulador para salvar horário comercial
  const handleSaveBusinessHours = () => {
    if (editingDay) {
      updateBusinessHours(editingDay);
      setEditingDay(null);
    }
  };
  
  // Manipulador para adicionar data especial
  const handleAddSpecialDate = () => {
    if (!selectedDate) {
      toast.error("Selecione uma data");
      return;
    }
    
    addSpecialDate({
      date: selectedDate,
      isOpen: specialDateOpen,
      openTime: specialDateOpen ? specialDateOpenTime : undefined,
      closeTime: specialDateOpen ? specialDateCloseTime : undefined,
      description: specialDateDescription || (specialDateOpen ? "Horário especial" : "Fechado")
    });
    
    setIsAddingSpecialDate(false);
    resetSpecialDateForm();
  };
  
  // Resetar formulário de data especial
  const resetSpecialDateForm = () => {
    setSpecialDateOpen(true);
    setSpecialDateOpenTime("09:00");
    setSpecialDateCloseTime("18:00");
    setSpecialDateDescription("");
  };
  
  // Verificar se uma data tem configuração especial
  const getSpecialDateForDate = (date: Date): SpecialDate | undefined => {
    return specialDates.find(sd => 
      isSameDay(sd.date, date)
    );
  };
  
  // Verificar se uma data está marcada como fechada
  const isDateClosed = (date: Date): boolean => {
    const specialDate = getSpecialDateForDate(date);
    if (specialDate) {
      return !specialDate.isOpen;
    }
    
    const dayOfWeek = date.getDay();
    const dayHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    return !dayHours?.isOpen;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Card>
            <CardContent className="py-10">
              <p>Você não tem permissão para acessar esta página.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Gerenciamento de Horários</h1>

          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">Horários Regulares</TabsTrigger>
              <TabsTrigger value="special">Datas Especiais</TabsTrigger>
            </TabsList>

            {/* Horários Regulares */}
            <TabsContent value="regular">
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Funcionamento</CardTitle>
                  <CardDescription>
                    Configure os horários regulares de funcionamento para cada dia da semana.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessHours.map((day) => (
                      <Card key={day.dayOfWeek}>
                        <CardHeader className="py-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{getDayName(day.dayOfWeek)}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`day-${day.dayOfWeek}-switch`}>
                                {day.isOpen ? "Aberto" : "Fechado"}
                              </Label>
                              <Switch
                                id={`day-${day.dayOfWeek}-switch`}
                                checked={day.isOpen}
                                onCheckedChange={(checked) => {
                                  setEditingDay({
                                    ...day,
                                    isOpen: checked
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        {day.isOpen && (
                          <CardContent className="pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`day-${day.dayOfWeek}-open`}>Horário de Abertura</Label>
                                <Input
                                  id={`day-${day.dayOfWeek}-open`}
                                  type="time"
                                  value={editingDay?.dayOfWeek === day.dayOfWeek ? editingDay.openTime : day.openTime}
                                  onChange={(e) => {
                                    setEditingDay({
                                      ...day,
                                      openTime: e.target.value
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`day-${day.dayOfWeek}-close`}>Horário de Fechamento</Label>
                                <Input
                                  id={`day-${day.dayOfWeek}-close`}
                                  type="time"
                                  value={editingDay?.dayOfWeek === day.dayOfWeek ? editingDay.closeTime : day.closeTime}
                                  onChange={(e) => {
                                    setEditingDay({
                                      ...day,
                                      closeTime: e.target.value
                                    });
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`day-${day.dayOfWeek}-lunch-switch`}
                                  checked={!!(editingDay?.dayOfWeek === day.dayOfWeek ? 
                                    editingDay.lunchStart : day.lunchStart)}
                                  onCheckedChange={(checked) => {
                                    setEditingDay({
                                      ...day,
                                      lunchStart: checked ? "12:00" : undefined,
                                      lunchEnd: checked ? "13:00" : undefined
                                    });
                                  }}
                                />
                                <Label htmlFor={`day-${day.dayOfWeek}-lunch-switch`}>
                                  Intervalo para almoço
                                </Label>
                              </div>
                              
                              {(editingDay?.dayOfWeek === day.dayOfWeek ? 
                                editingDay.lunchStart : day.lunchStart) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  <div className="space-y-2">
                                    <Label htmlFor={`day-${day.dayOfWeek}-lunch-start`}>Início do Almoço</Label>
                                    <Input
                                      id={`day-${day.dayOfWeek}-lunch-start`}
                                      type="time"
                                      value={editingDay?.dayOfWeek === day.dayOfWeek ? 
                                        editingDay.lunchStart : day.lunchStart}
                                      onChange={(e) => {
                                        setEditingDay({
                                          ...day,
                                          lunchStart: e.target.value
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`day-${day.dayOfWeek}-lunch-end`}>Fim do Almoço</Label>
                                    <Input
                                      id={`day-${day.dayOfWeek}-lunch-end`}
                                      type="time"
                                      value={editingDay?.dayOfWeek === day.dayOfWeek ? 
                                        editingDay.lunchEnd : day.lunchEnd}
                                      onChange={(e) => {
                                        setEditingDay({
                                          ...day,
                                          lunchEnd: e.target.value
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                        <CardFooter className="flex justify-end py-4">
                          {editingDay?.dayOfWeek === day.dayOfWeek && (
                            <Button onClick={handleSaveBusinessHours}>
                              Salvar Alterações
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Datas Especiais */}
            <TabsContent value="special">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Calendário</CardTitle>
                    <CardDescription>
                      Selecione uma data para adicionar ou editar horários especiais
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
                        closed: (date) => isDateClosed(date),
                        special: (date) => !!getSpecialDateForDate(date)
                      }}
                      modifiersClassNames={{
                        closed: "bg-red-100 text-red-600",
                        special: "bg-blue-100 text-blue-600"
                      }}
                    />
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-100"></div>
                        <span className="text-sm">Data com horário especial</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-100"></div>
                        <span className="text-sm">Data fechada</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        onClick={() => setIsAddingSpecialDate(true)} 
                        className="w-full"
                        disabled={!selectedDate}
                      >
                        {getSpecialDateForDate(selectedDate!) 
                          ? "Editar Data Especial" 
                          : "Adicionar Data Especial"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Datas Especiais</CardTitle>
                    <CardDescription>
                      Gerencie feriados, fechamentos e horários especiais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {specialDates.length > 0 ? (
                      <div className="space-y-4">
                        {specialDates
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((specialDate) => (
                            <Card key={specialDate.id}>
                              <CardHeader className="py-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-lg">
                                      {format(specialDate.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                      {isToday(specialDate.date) && (
                                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                          Hoje
                                        </span>
                                      )}
                                    </CardTitle>
                                    <CardDescription>{specialDate.description}</CardDescription>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {specialDate.isOpen ? (
                                      <Clock className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <CalendarX className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className={specialDate.isOpen ? "text-green-500" : "text-red-500"}>
                                      {specialDate.isOpen ? "Aberto" : "Fechado"}
                                    </span>
                                  </div>
                                </div>
                              </CardHeader>
                              {specialDate.isOpen && (
                                <CardContent className="py-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-medium">Horário:</p>
                                      <p className="text-sm">
                                        {specialDate.openTime} - {specialDate.closeTime}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              )}
                              <CardFooter className="flex justify-end py-4">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      Remover
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso removerá permanentemente esta data especial.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteSpecialDate(specialDate.id)}>
                                        Confirmar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">Nenhuma data especial configurada</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Selecione uma data no calendário e clique em "Adicionar Data Especial"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Dialog para adicionar/editar data especial */}
              <Dialog open={isAddingSpecialDate} onOpenChange={setIsAddingSpecialDate}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedDate && getSpecialDateForDate(selectedDate) 
                        ? "Editar Data Especial" 
                        : "Adicionar Data Especial"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="special-date-open"
                        checked={specialDateOpen}
                        onCheckedChange={setSpecialDateOpen}
                      />
                      <Label htmlFor="special-date-open">
                        {specialDateOpen ? "Aberto" : "Fechado"}
                      </Label>
                    </div>
                    
                    {specialDateOpen && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="special-date-open-time">Horário de Abertura</Label>
                            <Input
                              id="special-date-open-time"
                              type="time"
                              value={specialDateOpenTime}
                              onChange={(e) => setSpecialDateOpenTime(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="special-date-close-time">Horário de Fechamento</Label>
                            <Input
                              id="special-date-close-time"
                              type="time"
                              value={specialDateCloseTime}
                              onChange={(e) => setSpecialDateCloseTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="special-date-description">Descrição</Label>
                      <Input
                        id="special-date-description"
                        value={specialDateDescription}
                        onChange={(e) => setSpecialDateDescription(e.target.value)}
                        placeholder={specialDateOpen ? "Horário especial" : "Feriado"}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingSpecialDate(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddSpecialDate}>
                      Salvar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </div>
  );
};

export default BusinessHoursPage;
