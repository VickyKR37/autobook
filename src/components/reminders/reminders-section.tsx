
'use client';

import { useEffect, useState } from 'react';
import type { ServiceReminder as ReminderType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import ServiceReminderForm from './service-reminder-form';
import ReminderListItem from './reminder-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, CalendarCheck2, Info, Loader2 } from 'lucide-react';
import { addServiceReminderAction, toggleServiceReminderAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface RemindersSectionProps {
  vehicleId: string;
}

export default function RemindersSection({ vehicleId }: RemindersSectionProps) {
  const { toast } = useToast();
  const { effectiveUserId, isLoading: authIsLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const getRemindersFromStore = useAutoBookStore((state) => state.getServiceRemindersByVehicleId);
  const addReminderToStore = useAutoBookStore((state) => state.addServiceReminder);
  const deleteReminderFromStore = useAutoBookStore((state) => state.deleteServiceReminder);
  const toggleReminderCompletionInStore = useAutoBookStore((state) => state.toggleReminderCompletion);
  
  const [reminders, setReminders] = useState<ReminderType[]>([]);

  useEffect(() => {
    if (effectiveUserId && !authIsLoading) {
      setReminders(getRemindersFromStore(vehicleId, effectiveUserId));
    }
  }, [vehicleId, effectiveUserId, authIsLoading, getRemindersFromStore, useAutoBookStore.getState().serviceReminders]);


  const handleAddReminder = async (data: Omit<ReminderType, 'id' | 'createdAt' | 'vehicleId' | 'isCompleted' | 'userId'>) => {
    if(!effectiveUserId) {
        toast({ title: "Error", description: "User context unavailable.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      const reminderDataForAction = { ...data, vehicleId, userId: effectiveUserId };
      const newReminder = await addServiceReminderAction(reminderDataForAction);
      addReminderToStore(newReminder);
      toast({ title: 'Reminder Added', description: `Reminder for "${data.type}" set successfully.` });
      setShowForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add reminder.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (reminderId: string, completed: boolean) => {
    if(!effectiveUserId) return;
    setIsToggling(reminderId);
    try {
      await toggleServiceReminderAction(reminderId, vehicleId, completed, effectiveUserId); // server action
      toggleReminderCompletionInStore(reminderId, effectiveUserId); // client store
      toast({ title: 'Reminder Updated', description: `Reminder marked as ${completed ? 'complete' : 'incomplete'}.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update reminder status.', variant: 'destructive' });
    } finally {
      setIsToggling(null);
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    if(!effectiveUserId) return;
    setIsDeleting(reminderId);
    // For now, client-side only deletion, ensure scoped by userId
    deleteReminderFromStore(reminderId, effectiveUserId);
    toast({ title: 'Reminder Deleted', description: 'Reminder removed successfully.' });
    setIsDeleting(null);
  };

  if (authIsLoading || !effectiveUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Reminders</CardTitle>
          <CardDescription>Loading reminders...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }


  const upcomingReminders = reminders.filter(r => !r.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const completedReminders = reminders.filter(r => r.isCompleted).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());


  return (
    <Card>
      <CardHeader>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-2xl">Service Reminders</CardTitle>
              <CardDescription>Stay on top of upcoming maintenance and renewals.</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add New Reminder'}
            </Button>
          </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">New Reminder Form</AccordionTrigger>
              <AccordionContent>
                 <ServiceReminderForm
                  vehicleId={vehicleId}
                  onSubmit={handleAddReminder}
                  isSubmitting={isSubmitting}
                  onCancel={() => setShowForm(false)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {reminders.length === 0 && !showForm ? (
           <div className="text-center py-8">
            <CalendarCheck2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reminders set up yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add New Reminder" to create one.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Upcoming Reminders</h3>
                <div className="space-y-4">
                  {upcomingReminders.map((reminder) => (
                    <ReminderListItem
                      key={reminder.id}
                      reminder={reminder}
                      onToggleComplete={handleToggleComplete}
                      onEdit={() => { /* TODO */ }}
                      onDelete={handleDeleteReminder}
                      isDeleting={isDeleting === reminder.id}
                      isToggling={isToggling === reminder.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedReminders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 mt-6">Completed Reminders</h3>
                 <div className="space-y-4">
                  {completedReminders.map((reminder) => (
                    <ReminderListItem
                      key={reminder.id}
                      reminder={reminder}
                      onToggleComplete={handleToggleComplete}
                      onEdit={() => { /* TODO */ }}
                      onDelete={handleDeleteReminder}
                      isDeleting={isDeleting === reminder.id}
                      isToggling={isToggling === reminder.id}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {upcomingReminders.length === 0 && completedReminders.length > 0 && !showForm && (
                 <div className="text-center py-8 border-t mt-6">
                    <CalendarCheck2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No upcoming reminders.</p>
                    <p className="text-sm text-muted-foreground">All set for now!</p>
                </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}
