import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { UserService } from '@/lib/user-service';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock UserService
vi.mock('@/lib/user-service', () => ({
  UserService: {
    validateCredentials: vi.fn(),
    createClient: vi.fn(),
    createAdmin: vi.fn(),
    updateUser: vi.fn(),
    getUsers: vi.fn()
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

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

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
const mockLocation = { state: { from: { pathname: '/dashboard' } } };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with null user and not authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      let success;
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123');
      });
      
      expect(success).toBe(true);
      expect(result.current.user).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'client'
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should fail login with invalid credentials', async () => {
      (UserService.validateCredentials as any).mockReturnValue(null);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      let success;
      await act(async () => {
        success = await result.current.login('test@example.com', 'wrongpassword');
      });
      
      expect(success).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('register', () => {
    it('should register a new client successfully', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.createClient as any).mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      let success;
      await act(async () => {
        success = await result.current.register('New User', 'new@example.com', 'password123');
      });
      
      expect(success).toBe(true);
      expect(result.current.user).toEqual({
        id: 'user-1',
        name: 'New User',
        email: 'new@example.com',
        role: 'client'
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should fail registration if email already exists', async () => {
      (UserService.createClient as any).mockImplementation(() => {
        throw new Error('Este email já está em uso');
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      let success;
      await act(async () => {
        success = await result.current.register('New User', 'existing@example.com', 'password123');
      });
      
      expect(success).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('createAdmin', () => {
    it('should create a new admin if user is admin', async () => {
      // Login as admin first
      const adminUser = {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'adminpass',
        role: 'admin'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(adminUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('admin@example.com', 'adminpass');
      });
      
      // Now try to create a new admin
      const newAdmin = {
        id: 'admin-2',
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'adminpass',
        role: 'admin'
      };
      
      (UserService.createAdmin as any).mockReturnValue(newAdmin);
      
      let success;
      await act(async () => {
        success = await result.current.createAdmin('New Admin', 'newadmin@example.com', 'adminpass');
      });
      
      expect(success).toBe(true);
      expect(UserService.createAdmin).toHaveBeenCalledWith('New Admin', 'newadmin@example.com', 'adminpass');
    });

    it('should fail to create admin if user is not admin', async () => {
      // Login as client first
      const clientUser = {
        id: 'client-1',
        name: 'Client',
        email: 'client@example.com',
        password: 'clientpass',
        role: 'client'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(clientUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('client@example.com', 'clientpass');
      });
      
      let success;
      await act(async () => {
        success = await result.current.createAdmin('New Admin', 'newadmin@example.com', 'adminpass');
      });
      
      expect(success).toBe(false);
      expect(UserService.createAdmin).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Login first
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });
      
      // Now update profile
      const updatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.updateUser as any).mockReturnValue(updatedUser);
      
      let success;
      await act(async () => {
        success = await result.current.updateProfile({
          name: 'Updated Name',
          email: 'updated@example.com'
        });
      });
      
      expect(success).toBe(true);
      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.email).toBe('updated@example.com');
    });

    it('should fail to update profile if not logged in', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      let success;
      await act(async () => {
        success = await result.current.updateProfile({
          name: 'Updated Name',
          email: 'updated@example.com'
        });
      });
      
      expect(success).toBe(false);
      expect(UserService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully with correct current password', async () => {
      // Login first
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });
      
      // Now change password
      let success;
      await act(async () => {
        success = await result.current.changePassword('password123', 'newpassword');
      });
      
      expect(success).toBe(true);
      expect(UserService.updateUser).toHaveBeenCalledWith('user-1', { password: 'newpassword' });
    });

    it('should fail to change password with incorrect current password', async () => {
      // Login first
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      };
      
      (UserService.validateCredentials as any).mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });
      
      // Now try to change password with wrong current password
      (UserService.validateCredentials as any).mockReturnValue(null);
      
      let success;
      await act(async () => {
        success = await result.current.changePassword('wrongpassword', 'newpassword');
      });
      
      expect(success).toBe(false);
      expect(UserService.updateUser).not.toHaveBeenCalled();
    });
  });
});
