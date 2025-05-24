'use client';

import type { VoiceMemo } from '@/types';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Mic, PlayCircle, Trash2, CalendarDays, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VoiceMemoListItemProps {
  memo: VoiceMemo;
  onDelete: (memoId: string) => void;
  isDeleting: boolean;
}

export default function VoiceMemoListItem({ memo, onDelete, isDeleting }: VoiceMemoListItemProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
         <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold" title={memo.title}>{memo.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(memo.id)} disabled={isDeleting}>
            {isDeleting ? <Trash2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
          </Button>
        </div>
        <CardDescription className="text-xs flex items-center">
            <CalendarDays className="h-3 w-3 mr-1" /> {format(parseISO(memo.date), 'PPp')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {memo.transcription && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
            <FileText className="h-4 w-4 mr-1.5 inline-block relative -top-px" />
            {memo.transcription}
          </p>
        )}
        {/* Simulated audio player */}
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
          <PlayCircle className="h-6 w-6 text-primary" />
          <div className="flex-grow h-2 bg-muted rounded-full">
            <div className="h-2 bg-primary rounded-full" style={{width: '30%'}}></div> {/* Simulated progress */}
          </div>
          <span className="text-xs text-muted-foreground">0:00 / 0:00</span>
        </div>
        {memo.fileName && <p className="text-xs text-muted-foreground mt-1">File: {memo.fileName}</p>}
      </CardContent>
    </Card>
  );
}
