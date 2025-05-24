'use client';

import { useEffect, useState } from 'react';
import type { VoiceMemo as VoiceMemoType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import VoiceMemoRecorder from './voice-memo-recorder';
import VoiceMemoListItem from './voice-memo-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mic, Info } from 'lucide-react';
import { addVoiceMemoAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface VoiceMemoSectionProps {
  vehicleId: string;
}

export default function VoiceMemoSection({ vehicleId }: VoiceMemoSectionProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const memos = useAutoBookStore((state) => state.getVoiceMemosByVehicleId(vehicleId));
  const addMemoToStore = useAutoBookStore((state) => state.addVoiceMemo);
  const deleteMemoFromStore = useAutoBookStore((state) => state.deleteVoiceMemo);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const handleAddMemo = async (data: Omit<VoiceMemoType, 'id' | 'createdAt' | 'vehicleId' | 'audioUrl'> & { vehicleId: string; fileName?: string }) => {
    setIsSubmitting(true);
    try {
      const newMemo = await addVoiceMemoAction(data);
      addMemoToStore(newMemo);
      toast({ title: 'Voice Memo Saved', description: `"${data.title}" saved successfully.` });
      setShowForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save voice memo.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemo = (memoId: string) => {
    setIsDeleting(memoId);
    deleteMemoFromStore(memoId); // Client-side only for now
    toast({ title: 'Voice Memo Deleted', description: 'Memo removed successfully.' });
    setIsDeleting(null);
  };
  
  if (!mounted) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Memos</CardTitle>
          <CardDescription>Loading voice memos...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
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
            <CardTitle className="text-2xl">Voice Memos</CardTitle>
            <CardDescription>Quickly log repair or maintenance notes via (simulated) voice memo.</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add New Voice Memo'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Accordion type="single" collapsible defaultValue="item-1" className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">New Voice Memo Form</AccordionTrigger>
              <AccordionContent>
                <VoiceMemoRecorder
                  vehicleId={vehicleId}
                  onSubmit={handleAddMemo}
                  isSubmitting={isSubmitting}
                  onCancel={() => setShowForm(false)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {memos.length === 0 && !showForm ? (
          <div className="text-center py-8">
            <Mic className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No voice memos recorded yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add New Voice Memo" to create one.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memos.map((memo) => (
              <VoiceMemoListItem
                key={memo.id}
                memo={memo}
                onDelete={handleDeleteMemo}
                isDeleting={isDeleting === memo.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
