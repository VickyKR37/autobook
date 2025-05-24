'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected error. Please try again, or if the problem persists, contact support.
      </p>
      {error.message && (
        <p className="text-sm text-muted-foreground mb-2">Error details: {error.message}</p>
      )}
      <Button
        onClick={() => reset()}
        className="px-6 py-3 text-lg"
      >
        Try Again
      </Button>
    </div>
  );
}
