'use client';

import type { MaintenanceLog } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Calendar, Gauge, Wrench, Tag, Edit2, Trash2, DollarSign, User } from 'lucide-react';

interface MaintenanceListItemProps {
  log: MaintenanceLog;
  onEdit: (log: MaintenanceLog) => void;
  onDelete: (logId: string) => void;
  isDeleting: boolean;
}

export default function MaintenanceListItem({ log, onEdit, onDelete, isDeleting }: MaintenanceListItemProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{log.type}</CardTitle>
            <CardDescription className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
              {format(parseISO(log.date), 'PPP')}
              <Gauge className="h-4 w-4 ml-3 mr-1.5 text-muted-foreground" />
              {log.mileage.toLocaleString()} km
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="ghost" size="icon" onClick={() => onEdit(log)}><Edit2 className="h-4 w-4" /></Button> */}
            <Button variant="ghost" size="icon" onClick={() => onDelete(log.id)} disabled={isDeleting}>
              {isDeleting ? <Trash2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p>{log.description}</p>
        {log.partsUsed && (
          <div className="flex items-center text-muted-foreground">
            <Wrench className="h-4 w-4 mr-1.5" /> Parts: {log.partsUsed}
          </div>
        )}
        {log.mechanic && (
           <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-1.5" /> Mechanic: {log.mechanic}
          </div>
        )}
      </CardContent>
      {log.cost && (
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1.5" /> Cost: ${log.cost.toFixed(2)}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
