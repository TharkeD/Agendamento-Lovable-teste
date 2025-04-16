import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from "sonner";
import { User, UserService } from '@/lib/user-service';
import { useNavigate, useLocation } from 'react-router-dom';

// Omitimos o campo password para não expor no contexto da aplicação
type AuthUser = Omit<User, 'password'>;

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  createAdmin: (name: string, email: string, password: string) => Promise<boolean>;
  updateProfile: (userData: Partial<Omit<User, 'id' | 'password' | 'role'>>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Salvar usuário no localStorage quando mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const validatedUser = UserService.validateCredentials(email, password);
      
      if (validatedUser) {
        // Omitir a senha antes de armazenar no estado
        const { password: _, ...safeUser } = validatedUser;
        setUser(safeUser);
        
        // Redirecionar para a página original ou dashboard
        const origin = location.state?.from?.pathname || 
                      (safeUser.role === 'admin' ? '/dashboard' : '/');
        
        navigate(origin);
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/');
    toast.info("Você saiu da sua conta");
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newUser = UserService.createClient(name, email, password);
      // Omitir a senha antes de armazenar no estado
      const { password: _, ...safeUser } = newUser;
      setUser(safeUser);
      navigate('/');
      toast.success("Conta criada com sucesso!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta";
      toast.error(message);
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para criar administradores");
      return false;
    }

    try {
      setIsLoading(true);
      UserService.createAdmin(name, email, password);
      toast.success("Administrador criado com sucesso!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar administrador";
      toast.error(message);
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<Omit<User, 'id' | 'password' | 'role'>>): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para atualizar seu perfil");
      return false;
    }

    try {
      setIsLoading(true);
      const updatedUser = UserService.updateUser(user.id, userData);
      const { password: _, ...safeUser } = updatedUser;
      setUser(safeUser);
      toast.success("Perfil atualizado com sucesso!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar perfil";
      toast.error(message);
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para alterar sua senha");
      return false;
    }

    try {
      setIsLoading(true);
      // Verificar se a senha atual está correta
      const validUser = UserService.validateCredentials(user.email, currentPassword);
      
      if (!validUser) {
        toast.error("Senha atual incorreta");
        return false;
      }
      
      // Atualizar a senha
      UserService.updateUser(user.id, { password: newPassword });
      toast.success("Senha alterada com sucesso!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao alterar senha";
      toast.error(message);
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      createAdmin,
      updateProfile,
      changePassword,
      isAuthenticated, 
      isAdmin,
      isLoading
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
