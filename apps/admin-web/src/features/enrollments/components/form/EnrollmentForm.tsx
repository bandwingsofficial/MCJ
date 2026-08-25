"use client";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface EnrollmentFormProps {
  mode: "create" | "edit";
  enrollment?: Enrollment;
  onSuccess?: () => void;
}

/** Edit enrollment form — limited updates via enrollment details flow. */
export function EnrollmentForm({ mode }: EnrollmentFormProps) {
  if (mode === "create") {
    return (
      <p className="text-sm text-slate-500">
        Use Enrollment → Create Enrollment to add a new enrollment.
      </p>
    );
  }

  return (
    <p className="text-sm text-slate-500">
      Enrollment fee and assignment details are managed from the enrollment
      details view. Branch, batch, and student cannot be changed after creation.
    </p>
  );
}
