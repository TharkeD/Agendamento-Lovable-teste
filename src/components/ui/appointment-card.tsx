import { Appointment } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, UserCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AppointmentCard({ 
  appointment, 
  onCancel, 
  onDelete
}: AppointmentCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{appointment.service.name}</CardTitle>
        <CardDescription>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{format(appointment.date, "dd/MM/yyyy", { locale: ptBR })}</span>
            <span>às {format(appointment.date, "HH:mm", { locale: ptBR })}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.client.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.service.duration} minutos</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {appointment.status === 'scheduled' ? (
          <>
            {onCancel && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCancel(appointment.id)}
              >
                Cancelar
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(appointment.id)}
              >
                Excluir
              </Button>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            <XCircle className="h-4 w-4 inline-block mr-1" />
            Agendamento Cancelado
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
