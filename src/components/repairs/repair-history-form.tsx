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
import type { RepairRecord, FileAttachment } from '@/types';
// import FileUpload from '@/components/ui/file-upload'; // Placeholder for file upload component

const repairRecordSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Date is required." }),
  mileage: z.coerce.number().min(0, "Mileage must be a positive number."),
  issue: z.string().min(1, "Issue description is required."),
  diagnosis: z.string().min(1, "Diagnosis is required."),
  workDone: z.string().min(1, "Work done is required."),
  mechanic: z.string().optional(),
  partsReplaced: z.string().optional(),
  cost: z.coerce.number().optional(),
  // attachments: z.array(z.instanceof(File)).optional(), // For actual file uploads
});

type RepairRecordFormValues = z.infer<typeof repairRecordSchema>;

interface RepairRecordFormProps {
  vehicleId: string;
  initialData?: RepairRecord;
  onSubmit: (data: Omit<RepairRecord, 'id' | 'createdAt' | 'vehicleId' | 'attachments'> & { vehicleId: string; attachments?: FileAttachment[] }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function RepairRecordForm({ vehicleId, initialData, onSubmit, onCancel, isSubmitting }: RepairRecordFormProps) {
  const form = useForm<RepairRecordFormValues>({
    resolver: zodResolver(repairRecordSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: format(parseISO(initialData.date), 'yyyy-MM-dd'),
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
      mileage: undefined,
    },
  });

  const handleFormSubmit = async (values: RepairRecordFormValues) => {
    // Simulate file upload processing if attachments were handled
    // const processedAttachments = values.attachments?.map(file => ({ name: file.name, type: file.type, size: file.size, url: 'placeholder_url' })) || [];
    const dataToSubmit = {
      ...values,
      vehicleId,
      date: new Date(values.date).toISOString(),
      // attachments: processedAttachments,
    };
    await onSubmit(dataToSubmit);
    if (!initialData) {
        form.reset({
            date: format(new Date(), 'yyyy-MM-dd'),
            mileage: undefined,
            issue: '',
            diagnosis: '',
            workDone: '',
            mechanic: '',
            partsReplaced: '',
            cost: undefined,
        });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Repair</FormLabel>
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
              <FormControl><Input type="number" placeholder="e.g., 60000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="issue" render={({ field }) => (
          <FormItem>
            <FormLabel>Issue/Symptom</FormLabel>
            <FormControl><Textarea placeholder="Describe the issue observed..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="diagnosis" render={({ field }) => (
          <FormItem>
            <FormLabel>Diagnosis</FormLabel>
            <FormControl><Textarea placeholder="What was diagnosed as the problem?" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="workDone" render={({ field }) => (
          <FormItem>
            <FormLabel>Work Done</FormLabel>
            <FormControl><Textarea placeholder="Detail the repair work performed..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="mechanic" render={({ field }) => (
            <FormItem>
              <FormLabel>Mechanic/Garage (optional)</FormLabel>
              <FormControl><Input placeholder="e.g., Pro Auto Repair" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="partsReplaced" render={({ field }) => (
            <FormItem>
              <FormLabel>Parts Replaced (optional)</FormLabel>
              <FormControl><Input placeholder="e.g., Alternator (Part# XYZ789)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cost" render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (optional)</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 350.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        {/* 
        <FormField control={form.control} name="attachments" render={({ field }) => (
          <FormItem>
            <FormLabel>Attachments (Photos/Scans)</FormLabel>
            <FormControl>
              <FileUpload 
                onFilesSelected={(files) => field.onChange(files)} 
                multiple 
                accept="image/*,application/pdf" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        */}
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Record')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// This is a basic FileUpload component placeholder.
// A real implementation would be more complex.
/*
const FileUpload: React.FC<{
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}> = ({ onFilesSelected, multiple, accept }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(Array.from(event.target.files));
    }
  };
  return <Input type="file" onChange={handleFileChange} multiple={multiple} accept={accept} />;
};
*/
