'use client';

import { useEffect, useState } from 'react';
import type { MaintenanceLog as MaintenanceLogType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import MaintenanceLogForm from './maintenance-log-form';
import MaintenanceListItem from './maintenance-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench, Info } from 'lucide-react';
import { addMaintenanceLogAction } from '@/lib/actions'; // Assuming similar action exists
import { useToast } from '@/hooks/use-toast';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of log being deleted
  const [showForm, setShowForm] = useState(false);

  const logs = useAutoBookStore((state) => state.getMaintenanceLogsByVehicleId(vehicleId));
  const addLogToStore = useAutoBookStore((state) => state.addMaintenanceLog);
  const deleteLogFromStore = useAutoBookStore((state) => state.deleteMaintenanceLog);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const handleAddLog = async (data: Omit<MaintenanceLogType, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      const newLog = await addMaintenanceLogAction(data); // Server action
      addLogToStore(newLog); // Update client store
      toast({ title: 'Maintenance Log Added', description: `${data.type} recorded successfully.` });
      setShowForm(false); // Hide form after successful submission
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add maintenance log.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    setIsDeleting(logId);
    try {
      // Simulate server action for deletion
      // await deleteMaintenanceLogAction(logId); // If you implement this
      deleteLogFromStore(logId); // Update client store
      toast({ title: 'Maintenance Log Deleted', description: 'Log removed successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete maintenance log.', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };
  
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>Loading maintenance records...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
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
                  vehicleId={vehicleId}
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
