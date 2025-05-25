
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VehicleCard from '@/components/vehicles/vehicle-card';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { PlusCircle, Car, UserCog, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';


export default function VehiclesPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading, isMechanicSession, mechanicTargetUser, effectiveUserId } = useAuth();
  const getVehiclesByActiveUser = useAutoBookStore((state) => state.getVehiclesByUserId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedVehicles, setDisplayedVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!effectiveUserId) {
         router.replace('/login'); // Should be caught by AuthProvider or page higher up mostly
      } else {
        setDisplayedVehicles(getVehiclesByActiveUser(effectiveUserId));
      }
    }
  }, [authIsLoading, effectiveUserId, router, getVehiclesByActiveUser]);
  
  const filteredVehicles = displayedVehicles.filter(vehicle =>
    `${vehicle.make} ${vehicle.model} ${vehicle.vin} ${vehicle.licensePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authIsLoading || (!effectiveUserId && !authIsLoading)) {
     return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vehicles</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Vehicles...</CardTitle>
            <CardDescription>Please wait while we fetch your vehicle data.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isMechanicSession ? "Owner's Vehicles" : "My Vehicles"} ({filteredVehicles.length})
          </h1>
          {isMechanicSession && mechanicTargetUser && (
             <p className="text-md text-muted-foreground flex items-center">
              <UserCog className="mr-2 h-5 w-5 text-accent" />
              Accessing data for: {mechanicTargetUser.email} (ID: {mechanicTargetUser.userId || 'N/A'})
            </p>
          )}
        </div>
        {!isMechanicSession && user && (
          <Link href="/vehicles/add" passHref>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Vehicle
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vehicles (make, model, VIN, license plate)..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>
              {searchTerm 
                ? 'No Vehicles Found' 
                : (isMechanicSession ? `No Vehicles for ${mechanicTargetUser?.email}` : 'No Vehicles Yet')}
            </CardTitle>
            <CardDescription>
              {searchTerm 
                ? `Your search for "${searchTerm}" did not match any vehicles.`
                : (isMechanicSession 
                    ? "This owner may not have any vehicles, or they are not yet associated with their account."
                    : "You haven't added any vehicles. Add one to get started.")
              }
            </CardDescription>
          </CardHeader>
          {!searchTerm && !isMechanicSession && user && (
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
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
