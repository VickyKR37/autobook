'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './sidebar';
import AppHeader from './header';
import { useAuth } from '@/context/auth-provider'; // Import useAuth

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth(); // Get auth state

  // Determine if the current page is an auth page (login or signup)
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If auth is loading, or if it's an auth page and user is not yet determined (or already logged in, redirecting)
  // we might want to render just children or a minimal layout.
  // For auth pages, we explicitly don't want the main AppLayout (sidebar/header).
  if (isAuthPage) {
    return <>{children}</>; // Render only children for auth pages (login, signup)
  }
  
  // If user is not authenticated and not on an auth page (e.g. trying to access protected route directly)
  // AuthProvider's loading screen or page-level protection should handle this.
  // AppLayout assumes it's rendering for an authenticated context or public pages that use the layout.

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
