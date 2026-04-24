"use client";

import { useEffect } from "react";
import { Button } from "@/src/shared/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900">
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-gray-500 text-sm">
          An unexpected error occurred. Please try again.
        </p>

        {/* Action */}
        <Button onClick={() => reset()} className="w-full">
          Try Again
        </Button>
      </div>
    </div>
  );
}