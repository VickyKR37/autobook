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
import type { MaintenanceLog } from '@/types';

const maintenanceLogSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Date is required." }),
  mileage: z.coerce.number().min(0, "Mileage must be a positive number."),
  type: z.string().min(1, "Type of maintenance is required."),
  description: z.string().min(1, "Description is required."),
  cost: z.coerce.number().optional(),
  partsUsed: z.string().optional(),
  mechanic: z.string().optional(),
});

type MaintenanceLogFormValues = z.infer<typeof maintenanceLogSchema>;

interface MaintenanceLogFormProps {
  vehicleId: string;
  initialData?: MaintenanceLog;
  onSubmit: (data: Omit<MaintenanceLog, 'id' | 'createdAt' | 'vehicleId'> & { vehicleId: string }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function MaintenanceLogForm({ vehicleId, initialData, onSubmit, onCancel, isSubmitting }: MaintenanceLogFormProps) {
  const form = useForm<MaintenanceLogFormValues>({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: format(parseISO(initialData.date), 'yyyy-MM-dd'),
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
      mileage: undefined, // Use undefined to show placeholder
      type: '',
      description: '',
    },
  });

  const handleFormSubmit = async (values: MaintenanceLogFormValues) => {
    const dataToSubmit = {
      ...values,
      vehicleId,
      date: new Date(values.date).toISOString(), // Ensure ISO string for date
    };
    await onSubmit(dataToSubmit);
    if (!initialData) { // Reset form only if it's for adding new, not editing
      form.reset({
         date: format(new Date(), 'yyyy-MM-dd'),
         mileage: undefined,
         type: '',
         description: '',
         cost: undefined,
         partsUsed: '',
         mechanic: ''
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
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
          <FormField control={form.control} name="mileage" render={({ field }) => (
            <FormItem>
              <FormLabel>Mileage (km)</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 55000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Maintenance</FormLabel>
            <FormControl><Input placeholder="e.g., Oil Change, Tire Rotation" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Detailed description of work done..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="cost" render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (optional)</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 150.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="partsUsed" render={({ field }) => (
            <FormItem>
              <FormLabel>Parts Used (optional)</FormLabel>
              <FormControl><Input placeholder="e.g., Oil filter ABC-123, 5L 5W-30 Oil" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="mechanic" render={({ field }) => (
            <FormItem>
              <FormLabel>Mechanic/Garage (optional)</FormLabel>
              <FormControl><Input placeholder="e.g., John's Auto Shop" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Log')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
