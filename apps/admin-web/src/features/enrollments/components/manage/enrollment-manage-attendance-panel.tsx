"use client";

import { Card } from "@/src/shared/components/ui/card";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageAttendancePanel({ enrollment }: Props) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#102A56]">Attendance</h2>
      <p className="mt-1 text-sm text-[#647A9B]">
        Attendance records for {enrollment.enrollmentNumber}
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
        <p className="text-sm font-medium text-[#102A56]">No data yet</p>
        <p className="mt-1 text-sm text-[#647A9B]">
          Attendance history will appear here once records exist for this
          enrollment.
        </p>
      </div>
    </Card>
  );
}
