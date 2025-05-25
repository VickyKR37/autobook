
'use client';

// import { useEffect } from 'react'; // Removed for simplification
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error, // error object is still passed, can be logged on the server
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // console.error(error); // The original error should be logged in your server terminal by Next.js

  // Trivial change: adding a comment for build re-evaluation
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected error. Please try again.
      </p>
      {/*
        Displaying error.message was removed to simplify the error component.
        The actual error details should be checked in the server console.
      */}
      <Button
        onClick={() => reset()}
        className="px-6 py-3 text-lg"
      >
        Try Again
      </Button>
    </div>
  );
}
