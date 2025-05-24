'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Save, Square, Info, Loader2 } from 'lucide-react';
import type { VoiceMemo } from '@/types';
import { Input } from '../ui/input';

interface VoiceMemoRecorderProps {
  vehicleId: string;
  onSubmit: (data: Omit<VoiceMemo, 'id' | 'createdAt' | 'vehicleId' | 'audioUrl'> & { vehicleId: string; fileName?: string }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function VoiceMemoRecorder({ vehicleId, onSubmit, onCancel, isSubmitting }: VoiceMemoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState('');
  const [transcription, setTranscription] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscription(''); // Clear previous transcription
    setTitle(`Voice Note - ${new Date().toLocaleDateString()}`);
    setFileName(`voicememo_${Date.now()}.mp3`); // Simulated file name
    // In a real app, you would initialize MediaRecorder here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // In a real app, you would stop MediaRecorder and process audio data
    // For simulation, we might auto-fill transcription or require manual input
    if (!transcription) {
        setTranscription("Simulated voice memo content. Please edit as needed.");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || (!transcription.trim() && !isRecording)) { // Allow submitting if still "recording" to capture title
      alert("Please provide a title and some content for the memo.");
      return;
    }
    const dataToSubmit = {
      title,
      date: new Date().toISOString(),
      transcription: isRecording ? "Recording in progress..." : transcription,
      vehicleId,
      fileName: isRecording ? `recording_${Date.now()}.mp3` : fileName, // Use current filename if recording
    };
    await onSubmit(dataToSubmit);
    // Reset form state
    setTitle('');
    setTranscription('');
    setIsRecording(false);
    setFileName('');
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card space-y-4">
      <h3 className="text-lg font-semibold">New Voice Memo</h3>
      <div>
        <label htmlFor="memo-title" className="text-sm font-medium">Title</label>
        <Input 
          id="memo-title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="e.g., Engine noise observation"
          disabled={isRecording || isSubmitting}
        />
      </div>
      
      {!isRecording ? (
        <Button onClick={handleStartRecording} disabled={isSubmitting} className="w-full sm:w-auto">
          <Mic className="mr-2 h-4 w-4" /> Start Recording
        </Button>
      ) : (
        <div className="flex items-center gap-4">
            <Button onClick={handleStopRecording} variant="destructive" className="w-full sm:w-auto">
                <Square className="mr-2 h-4 w-4" /> Stop Recording
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-destructive"/>
                <span>Recording: {formatTime(recordingTime)}</span>
            </div>
        </div>
      )}

      { (transcription || isRecording) && (
        <div>
            <label htmlFor="memo-transcription" className="text-sm font-medium">Transcription / Notes</label>
            <Textarea
            id="memo-transcription"
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder={isRecording ? "Recording... Speak your notes. Transcription will appear here after stopping (simulated)." : "Enter transcription or notes here..."}
            rows={4}
            disabled={isSubmitting}
            />
        </div>
      )}
      
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Info size={14}/> 
            <span>Voice recording is simulated. Enter text manually.</span>
        </div>
        <div className="flex gap-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isRecording}>Cancel</Button>}
            <Button onClick={handleSubmit} disabled={isSubmitting || isRecording || !title.trim()}>
                <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Save Memo'}
            </Button>
        </div>
      </div>
    </div>
  );
}
