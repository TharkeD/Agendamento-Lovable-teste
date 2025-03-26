
import { Appointment } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, User, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  const statusColors = {
    scheduled: "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-green-50 text-green-600 border-green-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={cn(
        "overflow-hidden h-full transition-all duration-200 hover:shadow-md",
        appointment.status === "cancelled" && "opacity-70"
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{appointment.service.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {appointment.service.description}
              </CardDescription>
            </div>
            <Badge className={statusColors[appointment.status]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {appointment.client.name} · {appointment.client.email}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {format(appointment.date, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {format(appointment.date, "h:mm a")} · {appointment.service.duration} minutes
            </span>
          </div>
          {appointment.notes && (
            <div className="text-sm text-muted-foreground mt-2">
              <p className="font-medium">Notes:</p>
              <p>{appointment.notes}</p>
            </div>
          )}
        </CardContent>
        {appointment.status === "scheduled" && (
          <CardFooter className="pt-0">
            <div className="flex gap-2">
              {onCancel && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCancel(appointment.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(appointment.id)}
                  className="text-muted-foreground"
                >
                  Delete
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
