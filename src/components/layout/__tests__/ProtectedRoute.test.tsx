import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false
    });

    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        Navigate: (props: any) => {
          mockNavigate(props.to);
          return null;
        }
      };
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should allow access to admin routes when user is admin', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <div data-testid="admin-content">Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('should redirect non-admin users from admin routes', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false
    });

    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        Navigate: (props: any) => {
          mockNavigate(props.to);
          return null;
        }
      };
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute requireAdmin={true}>
              <div data-testid="admin-content">Admin Content</div>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
