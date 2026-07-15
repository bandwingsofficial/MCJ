"use client";

import {
  Lock,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type {
  StudentPortalAccessReason,
} from "@/src/features/student-portal/types/student-portal.types";

interface StudentPortalAccessDeniedProps {
  reason: StudentPortalAccessReason;

  onRetry: () => void;
}

const ACCESS_MESSAGES: Record<
  Exclude<
    StudentPortalAccessReason,
    "ACCESS_GRANTED"
  >,
  {
    title: string;
    description: string;
  }
> = {
  STUDENT_NOT_ADMITTED: {
    title:
      "Student Admission Pending",
    description:
      "Your student profile has not been admitted yet. Please contact the institute administrator to complete your admission process.",
  },

  ENROLLMENT_NOT_ADMITTED: {
    title:
      "Enrollment Not Yet Approved",
    description:
      "Your enrollment has not been admitted yet. Once your enrollment and payment are approved, you'll be able to access all learning resources.",
  },
};

export function StudentPortalAccessDenied({
  reason,
  onRetry,
}: StudentPortalAccessDeniedProps) {
  if (
    reason ===
    "ACCESS_GRANTED"
  ) {
    return null;
  }

  const message =
    ACCESS_MESSAGES[
      reason
    ];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
      <Card className="w-full p-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <Lock className="h-10 w-10 text-red-600" />
        </div>

        <h2 className="mt-6 text-2xl font-bold">
          {message.title}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {message.description}
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={
              onRetry
            }
          >
            Retry
          </Button>
        </div>
      </Card>
    </div>  
  );
}