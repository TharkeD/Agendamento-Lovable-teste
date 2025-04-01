
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { PageTransition } from "@/components/layout/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { UserService, User } from "@/lib/user-service";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AdminManagement = () => {
  const { isAdmin, createAdmin } = useAuth();
  const [admins, setAdmins] = useState<Omit<User, 'password'>[]>([]);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar administradores
    const users = UserService.getUsers();
    const adminUsers = users
      .filter(user => user.role === 'admin')
      .map(({ password, ...rest }) => rest); // Remove password field
    setAdmins(adminUsers);
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await createAdmin(newAdminName, newAdminEmail, newAdminPassword);
      if (success) {
        // Recarregar a lista
        const users = UserService.getUsers();
        const adminUsers = users
          .filter(user => user.role === 'admin')
          .map(({ password, ...rest }) => rest);
        setAdmins(adminUsers);
        
        // Limpar formulário
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        setIsDialogOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = (id: string) => {
    try {
      UserService.deleteUser(id);
      // Atualizar a lista
      const users = UserService.getUsers();
      const adminUsers = users
        .filter(user => user.role === 'admin')
        .map(({ password, ...rest }) => rest);
      setAdmins(adminUsers);
      toast.success("Administrador removido com sucesso");
    } catch (error) {
      toast.error("Erro ao remover administrador");
      console.error(error);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gerenciamento de Administradores</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Adicionar Administrador</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Administrador</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Nome</Label>
                    <Input
                      id="adminName"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Senha</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Administrador"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell className="text-right">
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
                                Esta ação não pode ser desfeita. Isso removerá permanentemente o administrador {admin.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default AdminManagement;
