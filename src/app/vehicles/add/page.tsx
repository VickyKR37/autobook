'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VehicleForm from '@/components/vehicles/vehicle-form';
import type { VehicleFormValues } from '@/components/vehicles/vehicle-form-schema';
import { useAutoBookStore } from '@/lib/store';
import { addVehicleAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storeAddVehicle = useAutoBookStore((state) => state.addVehicle);

  const handleSubmit = async (data: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      // Server action (simulated, returns data for client store update)
      const newVehicleData = await addVehicleAction(data);
      // Client-side store update
      storeAddVehicle(newVehicleData); 

      toast({
        title: 'Vehicle Added',
        description: `${data.make} ${data.model} has been successfully added.`,
      });
      router.push(`/vehicles/${newVehicleData.id}`);
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to add vehicle. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
    // No finally block to set isSubmitting to false, as navigation occurs on success
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Vehicle</h1>
      <VehicleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
