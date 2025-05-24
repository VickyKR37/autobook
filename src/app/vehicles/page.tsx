'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VehicleCard from '@/components/vehicles/vehicle-card';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { PlusCircle, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function VehiclesPage() {
  const allVehicles = useAutoBookStore((state) => state.vehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const filteredVehicles = allVehicles.filter(vehicle =>
    `${vehicle.make} ${vehicle.model} ${vehicle.vin} ${vehicle.licensePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
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
          <CardContent>
            <div className="grid animate-pulse gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="h-48 bg-muted"></Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Vehicles ({filteredVehicles.length})</h1>
        <Link href="/vehicles/add" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Vehicle
          </Button>
        </Link>
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
            <CardTitle>{searchTerm ? 'No Vehicles Found' : 'No Vehicles Yet'}</CardTitle>
            <CardDescription>
              {searchTerm 
                ? `Your search for "${searchTerm}" did not match any vehicles.`
                : "You haven't added any vehicles. Add one to get started."}
            </CardDescription>
          </CardHeader>
          {!searchTerm && (
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
