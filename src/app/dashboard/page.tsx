'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleCard from '@/components/vehicles/vehicle-card';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { PlusCircle, Car } from 'lucide-react';

export default function DashboardPage() {
  const vehicles = useAutoBookStore((state) => state.vehicles);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Vehicles...</CardTitle>
            <CardDescription>Please wait while we fetch your vehicle data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid animate-pulse gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => (
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
       {/* Placeholder for future quick stats or reminders */}
       {/*
       <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming reminders.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Total Vehicles: {vehicles.length}</p>
            </CardContent>
          </Card>
        </div>
        */}
    </div>
  );
}
