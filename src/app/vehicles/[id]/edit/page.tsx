
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VehicleForm from '@/components/vehicles/vehicle-form';
import type { VehicleFormValues } from '@/components/vehicles/vehicle-form-schema';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { updateVehicleAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Car, UserCog } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const vehicleId = params.id as string;
  const { effectiveUserId, isMechanicSession, mechanicTargetUser } = useAuth();

  const getVehicleByIdStore = useAutoBookStore((state) => state.getVehicleById);
  const storeUpdateVehicle = useAutoBookStore((state) => state.updateVehicle);
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vehicleId && effectiveUserId) {
      const foundVehicle = getVehicleByIdStore(vehicleId, effectiveUserId); // Pass effectiveUserId for scoped fetch
      if (foundVehicle) {
        setVehicle(foundVehicle);
      } else {
        toast({ title: "Error", description: "Vehicle not found or you don't have access.", variant: "destructive" });
        router.push('/vehicles');
      }
      setIsLoading(false);
    } else if (!effectiveUserId && !isLoading) { // If effectiveUserId is not yet available but not loading
        router.push('/login'); // Or a more appropriate redirect
    }
  }, [vehicleId, effectiveUserId, getVehicleByIdStore, router, toast, isLoading]);

  const handleSubmit = async (data: VehicleFormValues) => {
    if (!vehicle || !effectiveUserId) {
        toast({ title: "Error", description: "Cannot update vehicle. Missing context.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    setIsSubmitting(true);
    try {
      const vehicleDataToUpdate: Partial<Vehicle> & { id: string; userId: string } = {
        id: vehicle.id,
        userId: effectiveUserId, // Crucial for ensuring update is for the correct user context
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
        taxDueDate: data.taxDueDate ? new Date(data.taxDueDate).toISOString() : undefined,
        insuranceRenewalDate: data.insuranceRenewalDate ? new Date(data.insuranceRenewalDate).toISOString() : undefined,
      };
      
      const updatedVehicleData = await updateVehicleAction(vehicleDataToUpdate);
      storeUpdateVehicle(updatedVehicleData);

      toast({
        title: 'Vehicle Updated',
        description: `${data.make} ${data.model} has been successfully updated.`,
      });
      router.push(`/vehicles/${vehicle.id}`);
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading || !effectiveUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Car className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl">Loading vehicle data for editing...</p>
      </div>
    );
  }

  if (!vehicle) {
    return <p>Vehicle not found or access denied.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Vehicle: {vehicle.make} {vehicle.model}</h1>
      {isMechanicSession && mechanicTargetUser && (
        <p className="text-md text-muted-foreground flex items-center">
          <UserCog className="mr-2 h-5 w-5 text-accent" />
          Editing data for: {mechanicTargetUser.email}
        </p>
      )}
      <VehicleForm initialData={vehicle} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
