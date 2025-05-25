
'use client';

import type { ReactNode } from 'react'; 
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle, LogIn, LogOut, UserPlus, Settings, LayoutDashboard, UserCog, Briefcase } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { signOutAction } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';


function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'dashboard'); 
  const breadcrumbs: { href: string; label: string; isCurrent?: boolean }[] = [];

  if (pathname !== '/dashboard' && pathname !== '/' && !pathname.startsWith('/mechanic-login')) {
    breadcrumbs.push({ href: '/dashboard', label: 'Dashboard' });
  }
  
  let currentPath = '/dashboard'; 

  pathSegments.forEach((segment, index) => {
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const isIdSegment = /^[a-zA-Z0-9-]{8,}$/.test(segment) && index > 0; 
    currentPath += `/${segment}`;

    if (index === pathSegments.length - 1) {
      breadcrumbs.push({ href: currentPath, label: isIdSegment ? "Details" : label, isCurrent: true });
    } else {
      breadcrumbs.push({ href: currentPath, label: isIdSegment ? "Details" : label });
    }
  });

  if (pathname === '/dashboard' || pathname === '/') {
    if (breadcrumbs.some(b => b.href === '/dashboard')) {
        breadcrumbs.find(b => b.href === '/dashboard')!.isCurrent = true;
    } else {
        breadcrumbs.push({ href: '/dashboard', label: 'Dashboard', isCurrent: true });
    }
    return breadcrumbs.filter(b => b.href === '/dashboard');
  }
  if (pathname === '/mechanic-login') {
    return [{ href: '/mechanic-login', label: 'Mechanic Access', isCurrent: true }];
  }
  
  return breadcrumbs;
}


export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, mechanicTargetUser, clearMechanicAccess, isMechanicSession } = useAuth();
  const { toast } = useToast();
  const breadcrumbs = generateBreadcrumbs(pathname);

  const handleSignOut = async () => {
    const result = await signOutAction(); // This signs out Firebase user
    clearMechanicAccess(); // Also clear mechanic session
    if (result.success) {
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/login');
      router.refresh(); 
    } else {
      toast({ title: 'Sign Out Failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleExitMechanicSession = () => {
    clearMechanicAccess();
    toast({ title: 'Mechanic Session Exited', description: 'You are no longer accessing owner data.' });
    router.push('/mechanic-login');
    router.refresh();
  };
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href + index}> 
                <BreadcrumbItem>
                  {crumb.isCurrent ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
         {isMechanicSession && mechanicTargetUser && (
           <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <UserCog className="mr-2 h-4 w-4" />
              Mechanic Mode: {mechanicTargetUser.email}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExitMechanicSession}>
              <LogOut className="mr-2 h-4 w-4" /> Exit Session
            </Button>
          </div>
        )}

        {!isMechanicSession && (
          <>
            <Button variant="ghost" size="icon" aria-label="Notifications (coming soon)" disabled>
              <Bell className="h-5 w-5" />
            </Button>
            {isLoading ? (
              <UserCircle className="h-6 w-6 animate-pulse text-muted-foreground" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled> 
                    <Settings className="mr-2 h-4 w-4" />Settings (coming soon)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/login">
                        <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign In</span>
                    </Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/signup">
                        <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign Up</span>
                    </Link>
                </Button>
                 <Button variant="secondary" size="sm" asChild>
                    <Link href="/mechanic-login">
                        <Briefcase className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Mechanic Access</span>
                    </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

import React from 'react';
