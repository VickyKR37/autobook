'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/ui/file-upload';
import { Save } from 'lucide-react';
import type { Document as DocumentType } from '@/types';
import { DocumentTypeOptions } from '@/types';

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required."),
  type: z.enum(DocumentTypeOptions.map(opt => opt.value) as [DocumentType['type'], ...DocumentType['type'][]]),
  files: z.array(z.instanceof(File)).min(1, "Please select a file to upload.").max(1, "Only one file per document entry."),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentUploadFormProps {
  vehicleId: string;
  onSubmit: (data: Omit<DocumentType, 'id' | 'createdAt' | 'uploadDate' | 'vehicleId' | 'fileUrl'> & { vehicleId: string; fileName: string; file: File }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function DocumentUploadForm({ vehicleId, onSubmit, onCancel, isSubmitting }: DocumentUploadFormProps) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: '',
      type: undefined,
      files: [],
    },
  });

  const handleFormSubmit = async (values: DocumentFormValues) => {
    const file = values.files[0];
    const dataToSubmit = {
      name: values.name,
      type: values.type,
      vehicleId,
      fileName: file.name,
      file: file, // Pass the actual file for the action to handle (simulation)
    };
    await onSubmit(dataToSubmit);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Document Name</FormLabel>
            <FormControl><Input placeholder="e.g., Insurance Policy 2024" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem>
            <FormLabel>Document Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger></FormControl>
              <SelectContent>
                {DocumentTypeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="files" render={({ field }) => (
          <FormItem>
            <FormLabel>File</FormLabel>
            <FormControl>
               <FileUpload 
                onFilesSelected={(files) => field.onChange(files)} 
                multiple={false} /* Only one file */
                accept="image/*,application/pdf,.doc,.docx,.txt" 
                maxFiles={1}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" disabled={isSubmitting || form.getValues("files").length === 0}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
