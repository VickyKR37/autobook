
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VehicleForm from '@/components/vehicles/vehicle-form';
import type { VehicleFormValues } from '@/components/vehicles/vehicle-form-schema';
import { useAutoBookStore } from '@/lib/store';
import { addVehicleAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider'; // Import useAuth

export default function AddVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storeAddVehicle = useAutoBookStore((state) => state.addVehicle);
  const { effectiveUserId, isMechanicSession, mechanicTargetUser } = useAuth(); // Get effectiveUserId and mechanic session details

  const handleSubmit = async (data: VehicleFormValues) => {
    if (!effectiveUserId) {
      toast({ title: "Error", description: "User context is missing. Cannot add vehicle.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for the action, ensuring userId is correctly set
      const vehicleDataForAction = {
        ...data,
        userId: effectiveUserId, // This is the crucial part for data segregation
      };
      
      const newVehicleData = await addVehicleAction(vehicleDataForAction);
      storeAddVehicle(newVehicleData); 

      toast({
        title: 'Vehicle Added',
        description: `${data.make} ${data.model} has been successfully added${isMechanicSession && mechanicTargetUser ? ` for ${mechanicTargetUser.email}` : ''}.`,
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
  };

  if (!effectiveUserId) { // Might show a loader or redirect if user context isn't ready
      return <p>Loading user information...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Vehicle {isMechanicSession && mechanicTargetUser ? `for ${mechanicTargetUser.email}` : ''}</h1>
      <VehicleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
