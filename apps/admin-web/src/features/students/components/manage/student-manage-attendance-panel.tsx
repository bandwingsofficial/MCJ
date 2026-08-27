"use client";

import { useCallback, useEffect, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { Student } from "@/src/features/students/types/student.types";

interface Props {
  student: Student;
  refreshKey?: number;
}

export function StudentManageAttendancePanel({ student, refreshKey = 0 }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Attendance API is not available yet.
      await Promise.resolve();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey, student.id]);

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#102A56]">Attendance</h2>
      <p className="mt-1 text-sm text-[#647A9B]">
        Attendance records for {student.studentCode}
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          No attendance records yet
        </p>
        <p className="mt-1 text-sm text-[#647A9B]">
          Attendance tracking will appear here once the attendance module is
          connected.
        </p>
      </div>
    </Card>
  );
}
