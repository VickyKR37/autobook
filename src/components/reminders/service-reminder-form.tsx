'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import type { ServiceReminder } from '@/types';

const serviceReminderSchema = z.object({
  type: z.string().min(1, "Reminder type is required."),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Due date is required." }),
  notes: z.string().optional(),
});

type ServiceReminderFormValues = z.infer<typeof serviceReminderSchema>;

interface ServiceReminderFormProps {
  vehicleId: string;
  initialData?: ServiceReminder;
  onSubmit: (data: Omit<ServiceReminder, 'id' | 'createdAt' | 'vehicleId' | 'isCompleted'> & { vehicleId: string }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function ServiceReminderForm({ vehicleId, initialData, onSubmit, onCancel, isSubmitting }: ServiceReminderFormProps) {
  const form = useForm<ServiceReminderFormValues>({
    resolver: zodResolver(serviceReminderSchema),
    defaultValues: initialData ? {
      ...initialData,
      dueDate: format(parseISO(initialData.dueDate), 'yyyy-MM-dd'),
    } : {
      dueDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const handleFormSubmit = async (values: ServiceReminderFormValues) => {
    const dataToSubmit = {
      ...values,
      vehicleId,
      dueDate: new Date(values.dueDate).toISOString(),
    };
    await onSubmit(dataToSubmit);
    if (!initialData) {
        form.reset({
            type: '',
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            notes: ''
        });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem>
            <FormLabel>Reminder Type</FormLabel>
            <FormControl><Input placeholder="e.g., MOT Due, Oil Change Service" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Due Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (optional)</FormLabel>
            <FormControl><Textarea placeholder="Any specific notes for this reminder..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Reminder')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
