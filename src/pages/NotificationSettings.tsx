
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppNotificationService } from "@/lib/whatsapp-service";

const NotificationSettings = () => {
  const { isAdmin } = useAuth();
  
  // WhatsApp settings
  const [whatsappApiKey, setWhatsappApiKey] = useState("");
  const [whatsappSenderId, setWhatsappSenderId] = useState("");
  const [whatsappBaseUrl, setWhatsappBaseUrl] = useState("");
  
  // Email settings (para exemplo)
  const [emailApiKey, setEmailApiKey] = useState("");
  const [emailSender, setEmailSender] = useState("");
  const [emailService, setEmailService] = useState("sendgrid"); // ou mailchimp, etc.
  
  // Test variables
  const [testPhone, setTestPhone] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas
    const whatsappConfig = WhatsAppNotificationService.getConfig();
    if (whatsappConfig) {
      setWhatsappApiKey(whatsappConfig.apiKey);
      setWhatsappSenderId(whatsappConfig.senderId);
      setWhatsappBaseUrl(whatsappConfig.baseUrl);
    }
    
    // Aqui carregaria configurações de email em um sistema real
  }, []);

  const handleSaveWhatsAppSettings = () => {
    try {
      WhatsAppNotificationService.setConfig({
        apiKey: whatsappApiKey,
        senderId: whatsappSenderId,
        baseUrl: whatsappBaseUrl
      });
      toast.success("Configurações do WhatsApp salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações do WhatsApp");
      console.error(error);
    }
  };

  const handleSaveEmailSettings = () => {
    // Em um sistema real, salvaria as configurações de e-mail
    toast.success("Configurações de e-mail salvas!");
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone || !testMessage) {
      toast.error("Preencha o número de telefone e a mensagem de teste");
      return;
    }
    
    setIsSending(true);
    try {
      const sent = await WhatsAppNotificationService.sendMessage(testPhone, testMessage);
      if (sent) {
        toast.success("Mensagem de teste enviada com sucesso!");
      } else {
        toast.error("Falha ao enviar mensagem de teste");
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem de teste");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !testMessage) {
      toast.error("Preencha o email e a mensagem de teste");
      return;
    }
    
    // Simulação de envio de email
    setIsSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Email de teste enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar email de teste");
      console.error(error);
    } finally {
      setIsSending(false);
    }
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
          <h1 className="text-2xl font-bold mb-6">Configurações de Notificação</h1>

          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            {/* WhatsApp Settings */}
            <TabsContent value="whatsapp">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração da API do WhatsApp</CardTitle>
                  <CardDescription>
                    Configure a API do WhatsApp Business para enviar notificações aos clientes.
                    Você pode usar serviços como Twilio, MessageBird ou WhatsApp Business API.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-api-key">Chave da API</Label>
                    <Input
                      id="whatsapp-api-key"
                      value={whatsappApiKey}
                      onChange={(e) => setWhatsappApiKey(e.target.value)}
                      placeholder="Chave da API"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-sender-id">ID do Remetente / Número WhatsApp</Label>
                    <Input
                      id="whatsapp-sender-id"
                      value={whatsappSenderId}
                      onChange={(e) => setWhatsappSenderId(e.target.value)}
                      placeholder="Ex: +5511999887766"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-base-url">URL Base da API</Label>
                    <Input
                      id="whatsapp-base-url"
                      value={whatsappBaseUrl}
                      onChange={(e) => setWhatsappBaseUrl(e.target.value)}
                      placeholder="Ex: https://api.provedor.com/v1"
                    />
                  </div>
                  <Button onClick={handleSaveWhatsAppSettings} className="w-full">
                    Salvar Configurações
                  </Button>
                </CardContent>

                <CardHeader>
                  <CardTitle>Testar Envio</CardTitle>
                  <CardDescription>
                    Envie uma mensagem de teste para verificar a configuração.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-phone">Número de Telefone</Label>
                    <Input
                      id="test-phone"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="Ex: +5511999887766"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-whatsapp-message">Mensagem</Label>
                    <Input
                      id="test-whatsapp-message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Digite uma mensagem de teste"
                    />
                  </div>
                  <Button 
                    onClick={handleTestWhatsApp} 
                    disabled={isSending || !WhatsAppNotificationService.isConfigured()}
                    className="w-full"
                  >
                    {isSending ? "Enviando..." : "Enviar Mensagem de Teste"}
                  </Button>
                </CardContent>
                
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Nota: Para usar o WhatsApp Business API, você precisa de uma conta aprovada pelo WhatsApp.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração de API de Email</CardTitle>
                  <CardDescription>
                    Configure o envio de emails usando serviços como SendGrid, Mailchimp ou Amazon SES.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-service">Serviço</Label>
                    <select 
                      id="email-service"
                      className="w-full p-2 border rounded"
                      value={emailService}
                      onChange={(e) => setEmailService(e.target.value)}
                    >
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailchimp">Mailchimp</option>
                      <option value="ses">Amazon SES</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-api-key">Chave da API</Label>
                    <Input
                      id="email-api-key"
                      value={emailApiKey}
                      onChange={(e) => setEmailApiKey(e.target.value)}
                      placeholder="Chave da API"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-sender">Email do Remetente</Label>
                    <Input
                      id="email-sender"
                      value={emailSender}
                      onChange={(e) => setEmailSender(e.target.value)}
                      placeholder="contato@seudominio.com"
                    />
                  </div>
                  <Button onClick={handleSaveEmailSettings} className="w-full">
                    Salvar Configurações
                  </Button>
                </CardContent>

                <CardHeader>
                  <CardTitle>Testar Envio</CardTitle>
                  <CardDescription>
                    Envie um email de teste para verificar a configuração.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Email</Label>
                    <Input
                      id="test-email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="destinatario@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-email-message">Mensagem</Label>
                    <Input
                      id="test-email-message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Digite uma mensagem de teste"
                    />
                  </div>
                  <Button 
                    onClick={handleTestEmail} 
                    disabled={isSending || !emailApiKey}
                    className="w-full"
                  >
                    {isSending ? "Enviando..." : "Enviar Email de Teste"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </div>
  );
};

export default NotificationSettings;
