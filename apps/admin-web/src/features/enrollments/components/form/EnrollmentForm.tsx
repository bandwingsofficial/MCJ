"use client";

interface EnrollmentFormProps {
  mode: "create" | "edit";
  enrollment?: unknown;
  onSuccess?: () => void;
}

/** @deprecated Use Student Management → Enrollments instead. */
export function EnrollmentForm(_props: EnrollmentFormProps) {
  return (
    <p className="text-sm text-slate-500">
      Enrollment management has moved to Student Management.
    </p>
  );
}
