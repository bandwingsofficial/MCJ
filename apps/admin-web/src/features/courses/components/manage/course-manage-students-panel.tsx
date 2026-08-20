"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { appToast } from "@/src/shared/components/ui/toast";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
}

export function CourseManageStudentsPanel({ courseId }: Props) {
  const [search, setSearch] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await enrollmentService.getEnrollments({
        search,
        courseId,
        skip: 0,
        take: 100,
      });
      setEnrollments(response.data.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, search]);

  useEffect(() => {
    void loadEnrollments();
  }, [loadEnrollments]);

  const uniqueStudents = Array.from(
    new Map(
      enrollments.map((item) => [item.student.id, item.student]),
    ).values(),
  );

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <SearchInput
            value={search}
            placeholder="Search students..."
            onChange={setSearch}
          />
        </div>
        <Link
          href="/students"
          className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Manage Students
        </Link>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading students...
        </p>
      ) : uniqueStudents.length === 0 ? (
        <EmptyState
          title="No students enrolled"
          description="Students enrolled in this course will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {uniqueStudents.map((student) => {
                const name = [student.firstName, student.lastName]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {student.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/students/${student.id}/manage/enrollments`}
                        className="text-sm font-medium text-[#2447A8] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
