"use client";

import { Card } from "@/src/shared/components/ui/card";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageProgressPanel({ enrollment }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        Progress / Completion
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Course progress for {enrollment.enrollmentNumber}
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">No data yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Module and lesson completion will appear here once progress is
          recorded for this enrollment.
        </p>
      </div>
    </Card>
  );
}
