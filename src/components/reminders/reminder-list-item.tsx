'use client';

import type { ServiceReminder } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO, isPast } from 'date-fns';
import { CalendarClock, Edit2, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderListItemProps {
  reminder: ServiceReminder;
  onToggleComplete: (reminderId: string, completed: boolean) => void;
  onEdit: (reminder: ServiceReminder) => void;
  onDelete: (reminderId: string) => void;
  isDeleting: boolean;
  isToggling: boolean;
}

export default function ReminderListItem({ reminder, onToggleComplete, onEdit, onDelete, isDeleting, isToggling }: ReminderListItemProps) {
  const dueDate = parseISO(reminder.dueDate);
  const overdue = !reminder.isCompleted && isPast(dueDate);

  return (
    <Card className={cn("shadow-md", reminder.isCompleted ? "bg-muted/50" : overdue ? "border-destructive" : "")}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <Checkbox
              id={`reminder-${reminder.id}`}
              checked={reminder.isCompleted}
              onCheckedChange={(checked) => onToggleComplete(reminder.id, Boolean(checked))}
              disabled={isToggling}
              aria-label="Mark reminder as complete"
            />
            <div>
              <CardTitle className={cn("text-lg", reminder.isCompleted && "line-through text-muted-foreground")}>
                {reminder.type}
              </CardTitle>
              <CardDescription className={cn("flex items-center", reminder.isCompleted && "line-through text-muted-foreground", overdue && "text-destructive font-medium")}>
                <CalendarClock className="h-4 w-4 mr-1.5" />
                Due: {format(dueDate, 'PPP')} {overdue && "(Overdue)"}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Button variant="ghost" size="icon" onClick={() => onEdit(reminder)} disabled={reminder.isCompleted}><Edit2 className="h-4 w-4" /></Button> */}
            <Button variant="ghost" size="icon" onClick={() => onDelete(reminder.id)} disabled={isDeleting}>
              {isDeleting ? <Trash2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {reminder.notes && (
        <CardContent className={cn("text-sm", reminder.isCompleted && "text-muted-foreground")}>
          <p className="flex items-start"><Info className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" /> {reminder.notes}</p>
        </CardContent>
      )}
    </Card>
  );
}
