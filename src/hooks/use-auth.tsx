
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from "sonner";
import { User, UserService } from '@/lib/user-service';

// Omitimos o campo password para não expor no contexto da aplicação
type AuthUser = Omit<User, 'password'>;

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  createAdmin: (name: string, email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const validatedUser = UserService.validateCredentials(email, password);
      
      if (validatedUser) {
        // Omitir a senha antes de armazenar no estado
        const { password: _, ...safeUser } = validatedUser;
        setUser(safeUser);
        toast.success("Login realizado com sucesso!");
        return true;
      } else {
        toast.error("Email ou senha incorretos!");
        return false;
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info("Você saiu da sua conta");
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const newUser = UserService.createClient(name, email, password);
      // Omitir a senha antes de armazenar no estado
      const { password: _, ...safeUser } = newUser;
      setUser(safeUser);
      toast.success("Conta criada com sucesso!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta";
      toast.error(message);
      console.error(error);
      return false;
    }
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para criar administradores");
      return false;
    }

    try {
      UserService.createAdmin(name, email, password);
      toast.success("Administrador criado com sucesso!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar administrador";
      toast.error(message);
      console.error(error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      createAdmin,
      isAuthenticated, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
