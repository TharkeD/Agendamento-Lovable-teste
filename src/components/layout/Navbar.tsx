
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const menuItems = [
    { label: "Início", href: "/" },
    ...(isAdmin ? [{ label: "Painel", href: "/dashboard" }] : []),
    ...(isAdmin ? [{ label: "Serviços", href: "/services" }] : []),
    { label: "Agendar", href: "/book" },
    ...(isAuthenticated ? [{ label: "Meus Agendamentos", href: "/appointments" }] : []),
  ];

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="container flex items-center justify-between h-14 px-4 md:px-6">
        <Link
          to="/"
          className="font-semibold text-lg mr-4 shrink-0"
        >
          AgendeJá
        </Link>
        <div className="hidden md:flex gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={
                location.pathname === item.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user?.name || "Usuário"}
              </span>
              <Button variant="outline" onClick={logout}>
                Sair
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
          <Link to="/book">
            <Button>Agendar Horário</Button>
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col justify-between">
            <div className="grid gap-1 pt-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="flex items-center py-2"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    Logado como: {user?.name || "Usuário"}
                  </div>
                  <Button variant="outline" onClick={() => { logout(); setOpen(false); }}>
                    Sair
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
              )}
              <Link to="/book" onClick={() => setOpen(false)}>
                <Button className="w-full">Agendar Horário</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
