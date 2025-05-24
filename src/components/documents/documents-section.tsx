'use client';

import { useEffect, useState } from 'react';
import type { Document as DocumentType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import DocumentUploadForm from './document-upload-form';
import DocumentListItem from './document-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileArchive, Info } from 'lucide-react';
import { addDocumentAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface DocumentsSectionProps {
  vehicleId: string;
}

export default function DocumentsSection({ vehicleId }: DocumentsSectionProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const documents = useAutoBookStore((state) => state.getDocumentsByVehicleId(vehicleId));
  const addDocumentToStore = useAutoBookStore((state) => state.addDocument);
  const deleteDocumentFromStore = useAutoBookStore((state) => state.deleteDocument);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const handleAddDocument = async (data: Omit<DocumentType, 'id' | 'createdAt' | 'uploadDate' | 'vehicleId' | 'fileUrl'> & { vehicleId: string; fileName: string; file: File }) => {
    setIsSubmitting(true);
    try {
      // The file itself is in `data.file`. The action needs to handle it.
      // For this scaffold, `addDocumentAction` will just simulate and create a placeholder URL.
      const newDocument = await addDocumentAction({
        name: data.name,
        type: data.type,
        vehicleId: data.vehicleId,
        fileName: data.fileName,
        // uploadDate is set by the action/store
      });
      addDocumentToStore(newDocument);
      toast({ title: 'Document Uploaded', description: `"${data.name}" uploaded successfully.` });
      setShowForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload document.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setIsDeleting(docId);
    deleteDocumentFromStore(docId); // Client-side only for now
    toast({ title: 'Document Deleted', description: 'Document removed successfully.' });
    setIsDeleting(null);
  };
  
  if (!mounted) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
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
            <CardTitle className="text-2xl">Documents</CardTitle>
            <CardDescription>Store and manage important vehicle documents.</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Upload New Document'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">New Document Upload Form</AccordionTrigger>
              <AccordionContent>
                <DocumentUploadForm
                  vehicleId={vehicleId}
                  onSubmit={handleAddDocument}
                  isSubmitting={isSubmitting}
                  onCancel={() => setShowForm(false)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {documents.length === 0 && !showForm ? (
          <div className="text-center py-8">
            <FileArchive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground">Click "Upload New Document" to add files.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentListItem
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
                isDeleting={isDeleting === doc.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
