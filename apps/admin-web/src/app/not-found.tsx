"use client";

import { Button } from "@/src/shared/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center space-y-6">
        {/* Code */}
        <h1 className="text-6xl font-bold text-gray-900">404</h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800">
          Page not found
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Action */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>

          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}