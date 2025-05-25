
'use client';

import { useEffect, useState } from 'react';
import type { VoiceMemo as VoiceMemoType } from '@/types';
import { useAutoBookStore } from '@/lib/store';
import VoiceMemoRecorder from './voice-memo-recorder';
import VoiceMemoListItem from './voice-memo-list-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mic, Info, Loader2 } from 'lucide-react';
import { addVoiceMemoAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
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
  const { effectiveUserId, isLoading: authIsLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const getMemosFromStore = useAutoBookStore((state) => state.getVoiceMemosByVehicleId);
  const addMemoToStore = useAutoBookStore((state) => state.addVoiceMemo);
  const deleteMemoFromStore = useAutoBookStore((state) => state.deleteVoiceMemo);
  
  const [memos, setMemos] = useState<VoiceMemoType[]>([]);

  useEffect(() => {
    if (effectiveUserId && !authIsLoading) {
      setMemos(getMemosFromStore(vehicleId, effectiveUserId));
    }
  }, [vehicleId, effectiveUserId, authIsLoading, getMemosFromStore, useAutoBookStore.getState().voiceMemos]);


  const handleAddMemo = async (data: Omit<VoiceMemoType, 'id' | 'createdAt' | 'vehicleId' | 'audioUrl' | 'userId'> & { fileName?: string }) => {
     if (!effectiveUserId) {
        toast({ title: "Error", description: "User context unavailable.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      const memoDataForAction = { ...data, vehicleId, userId: effectiveUserId };
      const newMemo = await addVoiceMemoAction(memoDataForAction);
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
    if (!effectiveUserId) return;
    setIsDeleting(memoId);
    deleteMemoFromStore(memoId, effectiveUserId); 
    toast({ title: 'Voice Memo Deleted', description: 'Memo removed successfully.' });
    setIsDeleting(null);
  };
  
  if (authIsLoading || !effectiveUserId) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Memos</CardTitle>
          <CardDescription>Loading voice memos...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
