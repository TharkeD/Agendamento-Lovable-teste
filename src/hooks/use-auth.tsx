
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

// Usuário admin padrão para demonstração
const defaultAdmin = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@exemplo.com',
  role: 'admin' as const,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
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
    // Para esta demonstração, aceitamos apenas um usuário fixo
    // Em um sistema real, isso seria validado em um backend
    if (email === 'admin@exemplo.com' && password === 'senha123') {
      setUser(defaultAdmin);
      toast.success("Login realizado com sucesso!");
      return true;
    } else {
      toast.error("Email ou senha incorretos!");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info("Você saiu da sua conta");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
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

