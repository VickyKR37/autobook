
'use client';

import { useEffect, useState } from 'react';
import type { RepairRecord as RepairRecordType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import RepairRecordForm from './repair-history-form';
import RepairListItem from './repair-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Tool, Info, Loader2 } from 'lucide-react';
import { addRepairRecordAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface RepairSectionProps {
  vehicleId: string;
}

export default function RepairSection({ vehicleId }: RepairSectionProps) {
  const { toast } = useToast();
  const { effectiveUserId, isLoading: authIsLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const getRecordsFromStore = useAutoBookStore((state) => state.getRepairRecordsByVehicleId);
  const addRecordToStore = useAutoBookStore((state) => state.addRepairRecord);
  const deleteRecordFromStore = useAutoBookStore((state) => state.deleteRepairRecord);
  
  const [records, setRecords] = useState<RepairRecordType[]>([]);

  useEffect(() => {
    if (effectiveUserId && !authIsLoading) {
      setRecords(getRecordsFromStore(vehicleId, effectiveUserId));
    }
  }, [vehicleId, effectiveUserId, authIsLoading, getRecordsFromStore, useAutoBookStore.getState().repairRecords]);


  const handleAddRecord = async (data: Omit<RepairRecordType, 'id' | 'createdAt' | 'vehicleId' | 'userId'>) => {
    if(!effectiveUserId) {
        toast({ title: "Error", description: "User context unavailable.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      const recordDataForAction = { ...data, vehicleId, userId: effectiveUserId };
      const newRecord = await addRepairRecordAction(recordDataForAction);
      addRecordToStore(newRecord);
      toast({ title: 'Repair Record Added', description: `Repair for "${data.issue}" recorded successfully.` });
      setShowForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add repair record.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if(!effectiveUserId) return;
    setIsDeleting(recordId);
    try {
      // await deleteRepairRecordServerAction(recordId, effectiveUserId); // If implemented
      deleteRecordFromStore(recordId, effectiveUserId);
      toast({ title: 'Repair Record Deleted', description: 'Record removed successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete repair record.', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  if (authIsLoading || !effectiveUserId) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Repair History & Diagnostics</CardTitle>
          <CardDescription>Loading repair records...</CardDescription>
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
            <CardTitle className="text-2xl">Repair History & Diagnostics</CardTitle>
            <CardDescription>Log repairs, diagnostics, and parts replaced.</CardDescription>
          </div>
           <Button onClick={() => setShowForm(!showForm)} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add New Record'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">New Repair Record Form</AccordionTrigger>
              <AccordionContent>
                <RepairRecordForm
                  vehicleId={vehicleId}
                  onSubmit={handleAddRecord}
                  isSubmitting={isSubmitting}
                  onCancel={() => setShowForm(false)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {records.length === 0 && !showForm ? (
          <div className="text-center py-8">
            <Tool className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No repair records found.</p>
            <p className="text-sm text-muted-foreground">Click "Add New Record" to log a repair.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <RepairListItem
                key={record.id}
                record={record}
                onEdit={() => { /* TODO: Implement edit */ }}
                onDelete={handleDeleteRecord}
                isDeleting={isDeleting === record.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
