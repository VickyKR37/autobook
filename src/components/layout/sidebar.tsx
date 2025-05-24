'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Car, PlusCircle, Settings, Github } from 'lucide-react'; // Added Github for example
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/vehicles', label: 'Vehicles', icon: Car },
  { href: '/vehicles/add', label: 'Add New Vehicle', icon: PlusCircle },
  // { href: '/settings', label: 'Settings', icon: Settings }, // Example for future use
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 justify-center items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <h1 className="text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">AutoBook</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className={cn(
                    (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* Example footer content */}
        <Button variant="outline" size="sm" className="w-full group-data-[collapsible=icon]:hidden">
          <Github className="mr-2 h-4 w-4" />
          View on GitHub
        </Button>
         <Button variant="ghost" size="icon" className="hidden group-data-[collapsible=icon]:flex mx-auto">
          <Github />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
