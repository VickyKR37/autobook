
'use client';

import { useEffect, useState } from 'react';
import type { MaintenanceLog as MaintenanceLogType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import MaintenanceLogForm from './maintenance-log-form';
import MaintenanceListItem from './maintenance-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench, Info, Loader2 } from 'lucide-react';
import { addMaintenanceLogAction } from '@/lib/actions'; 
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface MaintenanceSectionProps {
  vehicleId: string;
}

export default function MaintenanceSection({ vehicleId }: MaintenanceSectionProps) {
  const { toast } = useToast();
  const { effectiveUserId, isLoading: authIsLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); 
  const [showForm, setShowForm] = useState(false);

  const getLogsFromStore = useAutoBookStore((state) => state.getMaintenanceLogsByVehicleId);
  const addLogToStore = useAutoBookStore((state) => state.addMaintenanceLog);
  const deleteLogFromStore = useAutoBookStore((state) => state.deleteMaintenanceLog);
  
  const [logs, setLogs] = useState<MaintenanceLogType[]>([]);

  useEffect(() => {
    if (effectiveUserId && !authIsLoading) {
      setLogs(getLogsFromStore(vehicleId, effectiveUserId));
    }
  }, [vehicleId, effectiveUserId, authIsLoading, getLogsFromStore, useAutoBookStore.getState().maintenanceLogs]); // Re-run if global logs change too


  const handleAddLog = async (data: Omit<MaintenanceLogType, 'id' | 'createdAt' | 'vehicleId' | 'userId'>) => {
    if (!effectiveUserId) {
        toast({ title: "Error", description: "User context unavailable.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      const logDataForAction = { ...data, vehicleId, userId: effectiveUserId };
      const newLog = await addMaintenanceLogAction(logDataForAction); 
      addLogToStore(newLog); 
      toast({ title: 'Maintenance Log Added', description: `${data.type} recorded successfully.` });
      setShowForm(false); 
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add maintenance log.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!effectiveUserId) return;
    setIsDeleting(logId);
    try {
      // await deleteMaintenanceLogServerAction(logId, effectiveUserId); // If implementing server-side delete
      deleteLogFromStore(logId, effectiveUserId); 
      toast({ title: 'Maintenance Log Deleted', description: 'Log removed successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete maintenance log.', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };
  
  if (authIsLoading || !effectiveUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>Loading maintenance records...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-2xl">Maintenance History</CardTitle>
            <CardDescription>Track all maintenance performed on this vehicle.</CardDescription>
          </div>
           <Button onClick={() => setShowForm(!showForm)} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add New Log'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">New Maintenance Log Form</AccordionTrigger>
              <AccordionContent>
                <MaintenanceLogForm
                  vehicleId={vehicleId} // Passed for context, though userId will be primary key for data
                  onSubmit={handleAddLog}
                  isSubmitting={isSubmitting}
                  onCancel={() => setShowForm(false)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {logs.length === 0 && !showForm ? (
          <div className="text-center py-8">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No maintenance logs recorded yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add New Log" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <MaintenanceListItem
                key={log.id}
                log={log}
                onEdit={() => { /* TODO: Implement edit functionality */ }}
                onDelete={handleDeleteLog}
                isDeleting={isDeleting === log.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
