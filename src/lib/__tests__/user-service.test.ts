import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/lib/user-service';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('UserService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUsers', () => {
    it('should return default admin when no users exist', () => {
      const users = UserService.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('admin@exemplo.com');
      expect(users[0].role).toBe('admin');
    });

    it('should return users from localStorage', () => {
      const mockUsers = [
        {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@exemplo.com',
          password: 'senha123',
          role: 'admin'
        },
        {
          id: 'client-1',
          name: 'Cliente',
          email: 'cliente@exemplo.com',
          password: 'senha123',
          role: 'client'
        }
      ];
      localStorage.setItem('app_users', JSON.stringify(mockUsers));
      
      const users = UserService.getUsers();
      expect(users).toHaveLength(2);
      expect(users[1].email).toBe('cliente@exemplo.com');
    });
  });

  describe('addUser', () => {
    it('should add a new user', () => {
      const newUser = UserService.createClient('Test User', 'test@example.com', 'password123');
      
      expect(newUser.id).toBeDefined();
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('test@example.com');
      expect(newUser.role).toBe('client');
      
      const users = UserService.getUsers();
      expect(users).toHaveLength(2);
      expect(users[1].email).toBe('test@example.com');
    });

    it('should throw error if email already exists', () => {
      UserService.createClient('Test User', 'test@example.com', 'password123');
      
      expect(() => {
        UserService.createClient('Another User', 'test@example.com', 'password456');
      }).toThrow('Este email já está em uso');
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', () => {
      const user = UserService.createClient('Test User', 'test@example.com', 'password123');
      
      const updatedUser = UserService.updateUser(user.id, { name: 'Updated Name' });
      
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('test@example.com');
      
      const users = UserService.getUsers();
      const foundUser = users.find(u => u.id === user.id);
      expect(foundUser?.name).toBe('Updated Name');
    });

    it('should throw error if user not found', () => {
      expect(() => {
        UserService.updateUser('non-existent-id', { name: 'New Name' });
      }).toThrow('Usuário não encontrado');
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', () => {
      const user = UserService.createClient('Test User', 'test@example.com', 'password123');
      
      const result = UserService.deleteUser(user.id);
      
      expect(result).toBe(true);
      
      const users = UserService.getUsers();
      const foundUser = users.find(u => u.id === user.id);
      expect(foundUser).toBeUndefined();
    });

    it('should return false if user not found', () => {
      const result = UserService.deleteUser('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('validateCredentials', () => {
    it('should return user if credentials are valid', () => {
      UserService.createClient('Test User', 'test@example.com', 'password123');
      
      const user = UserService.validateCredentials('test@example.com', 'password123');
      
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null if credentials are invalid', () => {
      UserService.createClient('Test User', 'test@example.com', 'password123');
      
      const user = UserService.validateCredentials('test@example.com', 'wrongpassword');
      
      expect(user).toBeNull();
    });
  });

  describe('createAdmin', () => {
    it('should create a new admin user', () => {
      const admin = UserService.createAdmin('Admin User', 'admin2@example.com', 'adminpass');
      
      expect(admin.role).toBe('admin');
      
      const users = UserService.getUsers();
      const foundAdmin = users.find(u => u.id === admin.id);
      expect(foundAdmin?.role).toBe('admin');
    });
  });

  describe('createClient', () => {
    it('should create a new client user', () => {
      const client = UserService.createClient('Client User', 'client@example.com', 'clientpass');
      
      expect(client.role).toBe('client');
      
      const users = UserService.getUsers();
      const foundClient = users.find(u => u.id === client.id);
      expect(foundClient?.role).toBe('client');
    });
  });
});
