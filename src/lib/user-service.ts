
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // Em um sistema real, isso seria um hash armazenado no backend
  role: 'admin' | 'client';
};

// Em um sistema real, isso seria armazenado em um banco de dados
const USERS_STORAGE_KEY = 'app_users';

// Inicializar com um administrador padrão
const defaultAdmins: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@exemplo.com',
    password: 'senha123', // Em um sistema real, seria um hash
    role: 'admin'
  }
];

export class UserService {
  // Obter todos os usuários
  static getUsers(): User[] {
    const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJSON) {
      // Se não existir, inicializa com o admin padrão
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultAdmins));
      return defaultAdmins;
    }
    return JSON.parse(usersJSON);
  }

  // Salvar usuários
  static saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Adicionar um novo usuário
  static addUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    
    // Verificar se o email já existe
    if (users.some(u => u.email === user.email)) {
      throw new Error('Este email já está em uso');
    }
    
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`
    };
    
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  // Atualizar um usuário existente
  static updateUser(id: string, userData: Partial<Omit<User, 'id'>>): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    users[index] = { ...users[index], ...userData };
    this.saveUsers(users);
    return users[index];
  }

  // Deletar um usuário
  static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) {
      return false; // Nenhum usuário foi removido
    }
    
    this.saveUsers(filteredUsers);
    return true;
  }

  // Verificar credenciais
  static validateCredentials(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  // Criar um novo administrador
  static createAdmin(name: string, email: string, password: string): User {
    return this.addUser({
      name,
      email,
      password,
      role: 'admin'
    });
  }

  // Criar um novo cliente
  static createClient(name: string, email: string, password: string): User {
    return this.addUser({
      name,
      email, 
      password,
      role: 'client'
    });
  }
}

// Inicializar usuários ao carregar o módulo
UserService.getUsers();
