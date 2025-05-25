
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleCard from '@/components/vehicles/vehicle-card';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { PlusCircle, Car, Loader2, UserCog } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading, mechanicTargetUser, isMechanicSession, effectiveUserId } = useAuth();
  
  // Fetch all vehicles and then filter, or use a selector that accepts userId if store is updated
  const allVehicles = useAutoBookStore((state) => state.vehicles);
  const [displayedVehicles, setDisplayedVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!user && !isMechanicSession) {
        router.replace('/login');
      } else {
        if (isMechanicSession && mechanicTargetUser) {
          // Filter vehicles for the target owner based on email (contactDetails) or userId if available
          // This assumes vehicle.contactDetails is the owner's email or vehicle.userId is populated
          setDisplayedVehicles(allVehicles.filter(v => v.userId === mechanicTargetUser.userId || v.contactDetails === mechanicTargetUser.email));
        } else if (user) {
          // Filter vehicles for the logged-in user
          setDisplayedVehicles(allVehicles.filter(v => v.userId === user.uid));
        } else {
          setDisplayedVehicles([]); // Should not happen if redirects are correct
        }
      }
    }
  }, [user, authIsLoading, isMechanicSession, mechanicTargetUser, router, allVehicles]);


  if (authIsLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user && !isMechanicSession) {
    return (
       <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Redirecting...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isMechanicSession && mechanicTargetUser && (
            <p className="text-md text-muted-foreground flex items-center">
              <UserCog className="mr-2 h-5 w-5 text-accent" />
              Accessing data for: {mechanicTargetUser.email}
            </p>
          )}
        </div>
        {!isMechanicSession && user && ( // Only show "Add New Vehicle" if it's a regular user session
          <Link href="/vehicles/add" passHref>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Vehicle
            </Button>
          </Link>
        )}
      </div>

      {displayedVehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>
              {isMechanicSession 
                ? `No Vehicles Found for ${mechanicTargetUser?.email}` 
                : "No Vehicles Yet"}
            </CardTitle>
            <CardDescription>
              {isMechanicSession 
                ? "This owner may not have any vehicles registered, or you may not have access."
                : "Start by adding your first vehicle to AutoBook."}
            </CardDescription>
          </CardHeader>
          {!isMechanicSession && user && (
            <CardContent>
              <Link href="/vehicles/add" passHref>
                <Button size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Your First Vehicle
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
