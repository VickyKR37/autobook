
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './sidebar';
import AppHeader from './header';
import { useAuth } from '@/context/auth-provider'; 

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, isLoading, mechanicTargetUser } = useAuth(); 

  // Determine if the current page is an auth page (login, signup, or mechanic-login)
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/mechanic-login';

  // For auth pages, we explicitly don't want the main AppLayout (sidebar/header).
  if (isAuthPage) {
    return <>{children}</>; 
  }
  
  // If not an auth page, but no user and no mechanic session,
  // this implies a protected route is being accessed without auth.
  // The individual page's logic (e.g., in DashboardPage) or AuthProvider's initial load screen should handle redirection.
  // This AppLayout component will render its structure if it's not an auth page.
  // If isLoading, AuthProvider shows a global loader, so AppLayout might not even be reached yet.

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
