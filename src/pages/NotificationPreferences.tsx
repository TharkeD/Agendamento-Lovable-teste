import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { PageTransition } from "@/components/layout/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Bell, Mail, Phone } from "lucide-react";

const NotificationPreferences = () => {
  const { user } = useAuth();
  const { notificationPreferences, updatePreferences, sendTestNotification } = useNotifications();
  
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    setIsSending(true);
    try {
      await sendTestNotification(testEmail, true);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleTestWhatsApp = async () => {
    if (!testPhone) return;
    
    setIsSending(true);
    try {
      await sendTestNotification(testPhone, false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 page-container">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Preferências de Notificação</h1>
                <p className="text-muted-foreground">
                  Gerencie como você deseja receber notificações sobre seus agendamentos
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="channels" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="channels">Canais de Notificação</TabsTrigger>
                <TabsTrigger value="reminders">Lembretes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="channels">
                <Card>
                  <CardHeader>
                    <CardTitle>Canais de Notificação</CardTitle>
                    <CardDescription>
                      Escolha como deseja receber notificações sobre seus agendamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor="email-notifications">Notificações por Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba confirmações e lembretes por email
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notificationPreferences.email}
                        onCheckedChange={(checked) => updatePreferences({ email: checked })}
                      />
                    </div>
                    
                    {notificationPreferences.email && (
                      <div className="ml-7 pl-2 border-l space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="test-email">Enviar email de teste</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="test-email"
                                placeholder="seu@email.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                              />
                              <Button 
                                onClick={handleTestEmail}
                                disabled={isSending || !testEmail}
                              >
                                {isSending ? "Enviando..." : "Testar"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor="whatsapp-notifications">Notificações por WhatsApp</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba confirmações e lembretes por WhatsApp
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="whatsapp-notifications"
                        checked={notificationPreferences.whatsapp}
                        onCheckedChange={(checked) => updatePreferences({ whatsapp: checked })}
                      />
                    </div>
                    
                    {notificationPreferences.whatsapp && (
                      <div className="ml-7 pl-2 border-l space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="test-whatsapp">Enviar WhatsApp de teste</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="test-whatsapp"
                                placeholder="+5511999887766"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                              />
                              <Button 
                                onClick={handleTestWhatsApp}
                                disabled={isSending || !testPhone}
                              >
                                {isSending ? "Enviando..." : "Testar"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reminders">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuração de Lembretes</CardTitle>
                    <CardDescription>
                      Defina quando deseja receber lembretes sobre seus agendamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <Label>Lembrete antes do agendamento</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Horas antes</span>
                          <span className="text-sm font-medium">{notificationPreferences.reminderHours} horas</span>
                        </div>
                        <Slider
                          value={[notificationPreferences.reminderHours]}
                          min={1}
                          max={72}
                          step={1}
                          onValueChange={(value) => updatePreferences({ reminderHours: value[0] })}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 hora</span>
                          <span>24 horas</span>
                          <span>72 horas</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default NotificationPreferences;
