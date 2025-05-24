'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VehicleForm from '@/components/vehicles/vehicle-form';
import type { VehicleFormValues } from '@/components/vehicles/vehicle-form-schema';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { updateVehicleAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Car } from 'lucide-react';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const vehicleId = params.id as string;

  const getVehicleById = useAutoBookStore((state) => state.getVehicleById);
  const storeUpdateVehicle = useAutoBookStore((state) => state.updateVehicle);
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      const foundVehicle = getVehicleById(vehicleId);
      if (foundVehicle) {
        setVehicle(foundVehicle);
      } else {
        toast({ title: "Error", description: "Vehicle not found.", variant: "destructive" });
        router.push('/vehicles');
      }
      setIsLoading(false);
    }
  }, [vehicleId, getVehicleById, router, toast]);

  const handleSubmit = async (data: VehicleFormValues) => {
    if (!vehicle) return;
    setIsSubmitting(true);
    try {
      const vehicleDataToUpdate: Partial<Vehicle> & { id: string } = {
        id: vehicle.id,
        ...data,
        // Ensure dates are in ISO format if they are simple date strings from form
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
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Car className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl">Loading vehicle data for editing...</p>
      </div>
    );
  }

  if (!vehicle) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
    return <p>Vehicle not found.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Vehicle: {vehicle.make} {vehicle.model}</h1>
      <VehicleForm initialData={vehicle} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
