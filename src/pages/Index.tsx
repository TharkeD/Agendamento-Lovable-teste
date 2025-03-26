
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useServices } from "@/hooks/use-services";
import { ServiceCard } from "@/components/ui/service-card";
import { Navbar } from "@/components/layout/Navbar";
import { CalendarDays, Clock, CheckCircle, Calendar } from "lucide-react";

const Index = () => {
  const { services } = useServices();
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-background to-secondary/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-[10%] rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <motion.span
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full"
              >
                Agendamento Simplificado
              </motion.span>
              
              <motion.h1 
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground"
              >
                Agende compromissos com facilidade
              </motion.h1>
              
              <motion.p
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-lg text-muted-foreground"
              >
                Otimize seu processo de agendamento e gerencie seus serviços em um só lugar. Economize tempo e concentre-se no que é mais importante - seus clientes.
              </motion.p>
              
              <motion.div
                {...fadeIn}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/book">
                  <Button size="lg" className="rounded-full">
                    Agendar Horário
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Ver Painel
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <div className="glass-card rounded-2xl overflow-hidden p-6 shadow-xl">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-primary/10 rounded-full blur-xl"></div>
                
                <div className="relative space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Próximos Agendamentos</h3>
                    <span className="text-sm text-muted-foreground">Julho 2023</span>
                  </div>
                  
                  {[1, 2, 3].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                      className="p-4 rounded-lg bg-white shadow-sm border border-border/50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Sessão de Estratégia</h4>
                          <p className="text-sm text-muted-foreground">João Silva</p>
                        </div>
                        <span className="text-sm text-primary font-medium">9:00</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa plataforma facilita o gerenciamento de agendamentos e serviços
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <CalendarDays className="w-10 h-10 text-primary" />,
                title: "Defina Sua Disponibilidade",
                description: "Estabeleça quando você está disponível para agendamentos"
              },
              {
                icon: <Clock className="w-10 h-10 text-primary" />,
                title: "Gerencie Serviços",
                description: "Crie e configure suas ofertas de serviços"
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-primary" />,
                title: "Aceite Reservas",
                description: "Clientes podem agendar horários disponíveis"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-secondary/50"
              >
                <div className="inline-flex items-center justify-center rounded-full p-3 bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore nossas ofertas de serviços e agende um horário hoje
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, index) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                mode="select"
                onClick={() => {}}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/book">
              <Button size="lg">
                Agendar Horário
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary text-secondary-foreground">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">AgendaFácil</span>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/" className="text-secondary-foreground hover:text-foreground transition-colors">
                Início
              </Link>
              <Link to="/dashboard" className="text-secondary-foreground hover:text-foreground transition-colors">
                Painel
              </Link>
              <Link to="/services" className="text-secondary-foreground hover:text-foreground transition-colors">
                Serviços
              </Link>
              <Link to="/book" className="text-secondary-foreground hover:text-foreground transition-colors">
                Agendar
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/70">
            © {new Date().getFullYear()} AgendaFácil. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
