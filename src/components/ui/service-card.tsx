import { Service } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Pencil, Trash } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (id: string) => void;
  onClick?: (service: Service) => void;
  mode?: "select" | "manage";
  formatPrice: (price: number) => string;
}

export function ServiceCard({ 
  service, 
  onEdit, 
  onDelete, 
  onClick,
  mode = "manage",
  formatPrice
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{service.name}</CardTitle>
          <CardDescription className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
            {service.duration} minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground">{service.description}</p>
          <p className="mt-3 text-lg font-medium">${formatPrice(service.price)}</p>
        </CardContent>
        <CardFooter className="pt-0">
          {mode === "manage" ? (
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(service)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(service.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          ) : (
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => onClick && onClick(service)}
            >
              Select
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
