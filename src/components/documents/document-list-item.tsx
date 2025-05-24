'use client';

import type { Document as DocumentType } from '@/types';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { FileText, Download, Trash2, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DocumentListItemProps {
  document: DocumentType;
  onDelete: (documentId: string) => void;
  isDeleting: boolean;
}

export default function DocumentListItem({ document, onDelete, isDeleting }: DocumentListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText className="h-8 w-8 text-primary shrink-0" />
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate" title={document.name}>{document.name}</p>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">{document.type.toLowerCase().replace(/\s/g, '-')}</Badge>
            <span className="flex items-center"><CalendarDays className="h-3 w-3 mr-1" />Uploaded: {format(parseISO(document.uploadDate), 'PP')}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Placeholder for download. In a real app, document.fileUrl would be used. */}
        <Button variant="outline" size="sm" asChild>
          <a href={document.fileUrl || "#"} download={document.fileName} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(document.id)} disabled={isDeleting}>
          {isDeleting ? <Trash2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
        </Button>
      </div>
    </div>
  );
}
