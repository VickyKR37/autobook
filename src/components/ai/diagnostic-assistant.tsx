'use client';

import { useState } from 'react';
import type { Vehicle, RepairRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, Loader2, AlertTriangle } from 'lucide-react';
import { suggestFailurePoints, type SuggestFailurePointsInput } from '@/ai/flows/suggest-failure-points';
import { useAutoBookStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiagnosticAssistantProps {
  vehicle: Vehicle;
}

export default function DiagnosticAssistant({ vehicle }: DiagnosticAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const getRepairRecordsByVehicleId = useAutoBookStore((state) => state.getRepairRecordsByVehicleId);
  const repairHistoryRecords = getRepairRecordsByVehicleId(vehicle.id);

  const formatRepairHistory = (records: RepairRecord[]): string => {
    if (records.length === 0) return "No repair history available.";
    return records
      .slice(0, 10) // Limit to most recent 10 records to keep prompt size manageable
      .map(r => `Date: ${r.date}, Issue: ${r.issue}, Work Done: ${r.workDone}, Mileage: ${r.mileage}km`)
      .join('\n');
  };

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions(null);
    setError(null);

    const input: SuggestFailurePointsInput = {
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleYear: vehicle.year,
      repairHistory: formatRepairHistory(repairHistoryRecords),
    };

    try {
      const result = await suggestFailurePoints(input);
      setSuggestions(result.suggestedFailurePoints);
    } catch (err) {
      console.error("AI suggestion error:", err);
      setError("Failed to get suggestions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl">AI Diagnostic Assistant</CardTitle>
            <CardDescription>Get AI-powered suggestions for potential failure points based on vehicle data and repair history.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1">Vehicle:</h4>
          <p className="text-sm text-muted-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Repair History Summary (most recent):</h4>
          <ScrollArea className="h-24 p-2 border rounded-md bg-muted/50">
            <pre className="text-xs whitespace-pre-wrap">{formatRepairHistory(repairHistoryRecords)}</pre>
          </ScrollArea>
        </div>
        
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Getting Suggestions...' : 'Suggest Failure Points'}
        </Button>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-2 pt-4">
            <h4 className="font-semibold text-lg">Suggested Failure Points to Inspect:</h4>
            <ScrollArea className="h-48 p-3 border rounded-md bg-background">
              <pre className="text-sm whitespace-pre-wrap">{suggestions}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
