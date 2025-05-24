'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth(); // Renamed isLoading to authIsLoading for clarity

  useEffect(() => {
    // Wait until authentication status is resolved
    if (!authIsLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, authIsLoading, router]);

  // Show loading indicator while checking auth status or redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-3 text-xl text-foreground">Loading AutoBook...</p>
    </div>
  );
}
