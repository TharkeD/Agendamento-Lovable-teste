
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Home, LayoutDashboard, Settings } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-semibold tracking-tight">AppointEase</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-center space-x-1 md:justify-end">
          <Link 
            to="/"
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              isActive('/') ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Link 
            to="/dashboard"
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              isActive('/dashboard') ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            to="/services"
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              isActive('/services') ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Services
          </Link>
          <Link 
            to="/book"
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            Book Appointment
          </Link>
        </nav>
      </div>
    </header>
  );
}
