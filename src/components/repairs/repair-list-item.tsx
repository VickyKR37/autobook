'use client';

import type { RepairRecord } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Calendar, Gauge, Tool, Edit2, Trash2, DollarSign, User, FileText, Paperclip } from 'lucide-react';

interface RepairListItemProps {
  record: RepairRecord;
  onEdit: (record: RepairRecord) => void;
  onDelete: (recordId: string) => void;
  isDeleting: boolean;
}

export default function RepairListItem({ record, onEdit, onDelete, isDeleting }: RepairListItemProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{record.issue}</CardTitle>
            <CardDescription className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {format(parseISO(record.date), 'PPP')}
              <Gauge className="h-4 w-4 ml-3 mr-1.5 text-muted-foreground" />
              {record.mileage.toLocaleString()} km
            </CardDescription>
          </div>
           <div className="flex gap-2">
            {/* <Button variant="ghost" size="icon" onClick={() => onEdit(record)}><Edit2 className="h-4 w-4" /></Button> */}
            <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)} disabled={isDeleting}>
              {isDeleting ? <Trash2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div>
          <p className="font-medium">Diagnosis:</p>
          <p>{record.diagnosis}</p>
        </div>
        <div>
          <p className="font-medium">Work Done:</p>
          <p>{record.workDone}</p>
        </div>
        {record.partsReplaced && (
          <div className="flex items-center text-muted-foreground">
            <Tool className="h-4 w-4 mr-1.5" /> Parts Replaced: {record.partsReplaced}
          </div>
        )}
        {record.mechanic && (
           <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-1.5" /> Mechanic: {record.mechanic}
          </div>
        )}
        {record.attachments && record.attachments.length > 0 && (
          <div>
            <p className="font-medium flex items-center"><Paperclip className="h-4 w-4 mr-1.5" /> Attachments:</p>
            <ul className="list-disc list-inside pl-2">
              {record.attachments.map(file => (
                <li key={file.id}><a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{file.name}</a></li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {record.cost && (
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1.5" /> Cost: ${record.cost.toFixed(2)}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
