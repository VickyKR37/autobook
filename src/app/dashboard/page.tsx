'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleCard from '@/components/vehicles/vehicle-card';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { PlusCircle, Car, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export default function DashboardPage() {
  const vehicles = useAutoBookStore((state) => state.vehicles);
  // const [mounted, setMounted] = useState(false); // Keep for vehicle data loading if separate
  const { user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login
    if (!authIsLoading && !user) {
      router.replace('/login');
    }
  }, [user, authIsLoading, router]);

  // Show loading spinner while auth state is being determined or if no user (before redirect)
  if (authIsLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  // If no user after loading, means redirect should have happened or is about to.
  // Render nothing or a minimal message to avoid flashing content.
  if (!user) {
    return (
       <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Redirecting...</p>
      </div>
    );
  }
  
  // At this point, user is authenticated and authIsLoading is false.
  // Proceed to render dashboard content.

  // Vehicle loading state (if needed, separate from auth)
  // Example: if (vehiclesLoading && mounted) { ... }
  // For now, assume vehicle store is immediately available or doesn't have its own async loading shown here.

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/vehicles/add" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Vehicle
          </Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Vehicles Yet</CardTitle>
            <CardDescription>Start by adding your first vehicle to AutoBook.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vehicles/add" passHref>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Your First Vehicle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
