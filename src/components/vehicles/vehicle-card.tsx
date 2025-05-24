'use client';

import type { Vehicle } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Calendar, Gauge, Car } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={`https://placehold.co/600x400/E0E0E0/757575?text=${vehicle.make}+${vehicle.model}`}
            alt={`${vehicle.make} ${vehicle.model}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${vehicle.make} ${vehicle.model}`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1">{vehicle.make} {vehicle.model}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3">{vehicle.licensePlate}</CardDescription>
        
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-primary" />
            <span>VIN: {vehicle.vin || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>Year: {vehicle.year}</span>
          </div>
          <div className="flex items-center">
            <Gauge className="h-4 w-4 mr-2 text-primary" />
            <span>Mileage: {vehicle.currentMileage?.toLocaleString() || 'N/A'} km</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Link href={`/vehicles/${vehicle.id}`} passHref className="w-full">
          <Button variant="outline" className="w-full">
            <Car className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
