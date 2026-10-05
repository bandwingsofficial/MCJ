"use client";

import type { StudentManageEnrollmentTab } from "@mcj/shared-constants";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { useStudentEnrollments } from "@/src/features/students/hooks/useStudentEnrollments";
import { StudentEnrollmentManageTabs } from "@/src/features/students/components/manage/student-enrollment-manage-tabs";
import { studentService } from "@/src/features/students/services/student.service";
import type { BranchOption, Student } from "@/src/features/students/types/student.types";

import { StudentEnrollmentTable } from "./student-enrollment-table";

interface Props {
  student: Student;
  refreshKey?: number;
  onStudentRefresh?: () => Promise<void>;
  onEnrollmentMutation?: () => Promise<void>;
}

export function StudentManageEnrollmentsPanel({
  student,
  refreshKey = 0,
}: Props) {
  const [enrollmentTab, setEnrollmentTab] =
    useState<StudentManageEnrollmentTab>("all");

  const {
    enrollments,
    total,
    isLoading,
    error,
    page,
    pageSize,
    includeDeleted,
    setPage,
    setIncludeDeleted,
    refetch,
  } = useStudentEnrollments({
    studentId: student.id,
    enrollmentTab,
  });

  const [branches, setBranches] = useState<BranchOption[]>([]);

  const branchMap = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.id, branch.branchName]),
      ),
    [branches],
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchItems = await studentService.getBranches();
        setBranches(branchItems);
      } catch {
        // Branch names are optional for display.
      }
    };

    void loadBranches();
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch, refreshKey]);

  if (error && enrollments.length === 0 && !isLoading) {
    return (
      <ErrorState
        title="Failed to load enrollments"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#102A56]">Enrollments</h2>
        <p className="text-sm text-[#647A9B]">
          Enrollment history for this student
        </p>
      </div>

      <StudentEnrollmentManageTabs
        activeTab={enrollmentTab}
        onChange={(tab) => {
          setEnrollmentTab(tab);
          setPage(1);
        }}
      />

      <div className="mb-3 mt-3 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(event) => setIncludeDeleted(event.target.checked)}
          />
          Show archived enrollments
        </label>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <StudentEnrollmentTable
              enrollments={enrollments}
              branchMap={branchMap}
            />
          </div>
        )}
      </Card>

      {total > 0 ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {from}–{to} of {total}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </>
  );
}
