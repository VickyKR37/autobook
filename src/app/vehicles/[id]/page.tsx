
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Car, Loader2, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleProfileView from '@/components/vehicles/vehicle-profile-view';
import EngineSpecsView from '@/components/vehicles/engine-specs-view';
import MaintenanceSection from '@/components/maintenance/maintenance-section';
import RepairSection from '@/components/repairs/repair-section';
import RemindersSection from '@/components/reminders/reminders-section';
import DocumentsSection from '@/components/documents/documents-section';
import DiagnosticAssistant from '@/components/ai/diagnostic-assistant';
import VoiceMemoSection from '@/components/voice-memo/voice-memo-section';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { deleteVehicleAction } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const vehicleId = params.id as string;
  const { effectiveUserId, isLoading: authIsLoading, isMechanicSession, mechanicTargetUser } = useAuth();
  
  const getVehicleByIdStore = useAutoBookStore((state) => state.getVehicleById);
  const deleteVehicleFromStore = useAutoBookStore((state) => state.deleteVehicle);
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (vehicleId && effectiveUserId && !authIsLoading) {
      const foundVehicle = getVehicleByIdStore(vehicleId, effectiveUserId);
      if (foundVehicle) {
        setVehicle(foundVehicle);
      } else {
        toast({ title: "Error", description: "Vehicle not found or you don't have access.", variant: "destructive" });
        router.push('/vehicles');
      }
    } else if (!effectiveUserId && !authIsLoading) {
        router.push('/login');
    }
  }, [vehicleId, effectiveUserId, getVehicleByIdStore, router, toast, authIsLoading]);

  const handleDeleteVehicle = async () => {
    if (!vehicle || !effectiveUserId) return;
    
    try {
      await deleteVehicleAction(vehicle.id, effectiveUserId); // Server action
      deleteVehicleFromStore(vehicle.id, effectiveUserId); // Client-side store update
      toast({
        title: "Vehicle Deleted",
        description: `${vehicle.make} ${vehicle.model} has been deleted.`,
      });
      router.push('/vehicles');
    } catch(error) {
       toast({ title: "Error", description: "Failed to delete vehicle.", variant: "destructive" });
    }
  };

  if (authIsLoading || !effectiveUserId || !vehicle) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">{vehicle.make} {vehicle.model}</h1>
          <p className="text-muted-foreground">{vehicle.licensePlate} - VIN: {vehicle.vin}</p>
           {isMechanicSession && mechanicTargetUser && (
            <p className="text-md text-muted-foreground flex items-center mt-1">
              <UserCog className="mr-2 h-5 w-5 text-accent" />
              Viewing data for: {mechanicTargetUser.email}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/vehicles/${vehicle.id}/edit`} passHref>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the vehicle
                  and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteVehicle}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ai-diagnostics">AI Diagnostics</TabsTrigger>
          <TabsTrigger value="voice-memos">Voice Memos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Overview</CardTitle>
              <CardDescription>Key details and specifications of the vehicle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <VehicleProfileView vehicle={vehicle} />
              <EngineSpecsView vehicle={vehicle} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <MaintenanceSection vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="repairs" className="mt-4">
          <RepairSection vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="reminders" className="mt-4">
          <RemindersSection vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsSection vehicleId={vehicle.id} />
        </TabsContent>

        <TabsContent value="ai-diagnostics" className="mt-4">
          <DiagnosticAssistant vehicle={vehicle} />
        </TabsContent>

        <TabsContent value="voice-memos" className="mt-4">
          <VoiceMemoSection vehicleId={vehicle.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
