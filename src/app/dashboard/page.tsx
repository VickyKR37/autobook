
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleCard from '@/components/vehicles/vehicle-card';
import type { Vehicle } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import { PlusCircle, Car, Loader2, UserCog, KeyRound, Copy, Info } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { getMechanicAccessCodeForOwnerAction } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
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

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authIsLoading, isMechanicSession, mechanicTargetUser, effectiveUserId } = useAuth();
  
  const getVehiclesByActiveUser = useAutoBookStore((state) => state.getVehiclesByUserId);
  const [displayedVehicles, setDisplayedVehicles] = useState<Vehicle[]>([]);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [currentAccessCode, setCurrentAccessCode] = useState<string | null>(null);
  const [isCodeAlertDialogOpen, setIsCodeAlertDialogOpen] = useState(false);


  useEffect(() => {
    if (!authIsLoading) {
      if (!effectiveUserId) { 
        router.replace('/login');
      } else {
        setDisplayedVehicles(getVehiclesByActiveUser(effectiveUserId));
      }
    }
  }, [authIsLoading, effectiveUserId, router, getVehiclesByActiveUser]);

  const handleGetAccessCode = async () => {
    setIsLoadingCode(true);
    setCurrentAccessCode(null);
    const result = await getMechanicAccessCodeForOwnerAction();
    if (result.success && result.accessCode) {
      setCurrentAccessCode(result.accessCode);
      setIsCodeAlertDialogOpen(true);
      toast({ title: "Access Code Generated", description: "Your new mechanic access code is ready." });
    } else {
      toast({ title: "Error Generating Code", description: result.error || "Could not retrieve your access code.", variant: "destructive" });
    }
    setIsLoadingCode(false);
  };

  const copyToClipboard = () => {
    if (currentAccessCode) {
      navigator.clipboard.writeText(currentAccessCode)
        .then(() => toast({ title: "Copied!", description: "Access code copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy code to clipboard.", variant: "destructive" }));
    }
  };


  if (authIsLoading || (!effectiveUserId && !authIsLoading)) { 
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
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

      {!isMechanicSession && user && (
        <Card>
          <CardHeader>
            <CardTitle>Mechanic Access Code</CardTitle>
            <CardDescription>
              View or regenerate the access code your mechanic can use to view your vehicle data.
              Keep this code secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGetAccessCode} disabled={isLoadingCode}>
              {isLoadingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              {isLoadingCode ? 'Generating...' : 'View/Regenerate My Access Code'}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentAccessCode && (
        <AlertDialog open={isCodeAlertDialogOpen} onOpenChange={setIsCodeAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Your Mechanic Access Code</AlertDialogTitle>
              <AlertDialogDescription>
                Share this code with your mechanic to allow them to access your vehicle data.
                This code is shown once. Keep it secure. Regenerating will invalidate previous codes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 p-4 bg-muted rounded-md text-center">
              <p className="text-2xl font-bold tracking-wider text-primary">{currentAccessCode}</p>
            </div>
            <AlertDialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={copyToClipboard} className="w-full sm:w-auto">
                <Copy className="mr-2 h-4 w-4" /> Copy Code
              </Button>
              <AlertDialogAction onClick={() => setIsCodeAlertDialogOpen(false)} className="w-full sm:w-auto mt-2 sm:mt-0">
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}


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
