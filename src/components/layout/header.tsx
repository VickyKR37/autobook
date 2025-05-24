'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from 'next/link';

// Function to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = [{ href: '/', label: 'Home' }];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    // Capitalize first letter for display
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    if (index === pathSegments.length - 1) {
      breadcrumbs.push({ href: currentPath, label, isCurrent: true });
    } else {
      breadcrumbs.push({ href: currentPath, label });
    }
  });
  
  if (breadcrumbs.length === 1 && breadcrumbs[0].label === 'Home' && pathSegments.length > 0) { // Dashboard case
     breadcrumbs.push({ href: '/dashboard', label: 'Dashboard', isCurrent: true });
  } else if (breadcrumbs.length === 1 && breadcrumbs[0].label === 'Home' && pathname === '/') {
     breadcrumbs.push({ href: '/dashboard', label: 'Dashboard', isCurrent: true });
  }


  return breadcrumbs;
}


export default function AppHeader() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User Profile">
          <UserCircle className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}

// Need to import React for JSX Fragment
import React from 'react';
