"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  StudentDashboardPage,
} from "@/src/features/student";

import { BatchSummaryCard } from "@/src/features/student-portal/components/BatchSummaryCard";
import { PaymentSummaryCard } from "@/src/features/student-portal/components/PaymentSummaryCard";
import { StudentPortalAccessDenied } from "@/src/features/student-portal/components/StudentPortalAccessDenied";
import { StudentPortalLoading } from "@/src/features/student-portal/components/StudentPortalLoading";
import { StudentSummaryCard } from "@/src/features/student-portal/components/StudentSummaryCard";

import { CourseError } from "@/src/features/student-course/components/states/CourseError";

import { useStudentPortal } from "@/src/features/student-portal/hooks/use-student-portal";

export function StudentPortalGate() {
  const {
    access,
    isLoading,
    error,
    refetch,
  } =
    useStudentPortal();

  /**
   * Loading
   */
  if (isLoading) {
    return (
      <StudentPortalLoading />
    );
  }

  /**
   * Redirect is already handled inside the hook
   * (Student Profile Not Found).
   *
   * Keep showing the loading state until navigation
   * completes.
   */
  if (error || !access) {
    return (
      <StudentPortalLoading />
    );
  }

  /**
   * Access denied cases.
   */
  if (!access.allowed) {
    /**
     * Student exists but enrollment is not admitted.
     *
     * Show the normal student dashboard instead of
     * blocking access.
     */
    if (
      access.reason ===
      "ENROLLMENT_NOT_ADMITTED"
    ) {
      return (
        <StudentDashboardPage />
      );
    }

    /**
     * Student itself is not admitted.
     */
    return (
      <StudentPortalAccessDenied
        reason={
          access.reason
        }
        onRetry={
          refetch
        }
      />
    );
  }

  /**
   * Safety Check
   */
  if (
    !access.student ||
    !access.batch ||
    !access.enrollment ||
    !access.paymentSummary
  ) {
    return (
      <CourseError
        message="Incomplete portal information received."
        onRetry={
          refetch
        }
      />
    );
  }

  // ... existing imports ...
  return (
    <div className="space-y-6">
      <PageHeader title="Student Portal" description="Welcome back to your dashboard." />
      <StudentSummaryCard student={access.student} />
      <div className="grid gap-6 lg:grid-cols-2">
        <BatchSummaryCard batch={access.batch} trainers={access.trainers ?? []} />
        <PaymentSummaryCard enrollment={access.enrollment} paymentSummary={access.paymentSummary} />
      </div>
    </div>
  );
}