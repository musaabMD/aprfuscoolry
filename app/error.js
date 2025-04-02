"use client";

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";

// A simple error boundary to show a nice error page if something goes wrong (Error Boundary)
// Users can contanct support, go to the main page or try to reset/refresh to fix the error
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong!</h1>
        <p className="text-gray-600">We apologize for the inconvenience.</p>
        <div className="space-x-4">
          <Button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
