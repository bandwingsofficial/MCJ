"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, UserMinus } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchManageTableShell } from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  formatBatchLabel,
  formatPersonName,
} from "@/src/features/branches/utils/branch-display.utils";
import {
  UnenrollEnrollmentDialog,
  type UnenrollEnrollmentTarget,
} from "@/src/features/enrollments/components/dialogs/unenroll-enrollment-dialog";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { useUnenrollEnrollment } from "@/src/features/enrollments/hooks/useUnenrollEnrollment";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { canUnenrollEnrollment } from "@/src/features/enrollments/utils/current-enrollment";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { studentManagePath } from "@/src/features/students/utils/student-manage.routes";

const PAGE_SIZE = 10;

interface Props {
  branchId: string;
}

function formatStudentName(enrollment: Enrollment): string {
  return formatPersonName(
    enrollment.student?.firstName,
    enrollment.student?.lastName,
  );
}

export function BranchManageEnrollmentsPanel({ branchId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [unenrollTarget, setUnenrollTarget] =
    useState<UnenrollEnrollmentTarget | null>(null);
  const { unenrollEnrollment, isLoading: isUnenrolling } =
    useUnenrollEnrollment();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await enrollmentService.getEnrollments({
        search,
        branchId,
        currentOnly: true,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
      const parsed = parseEnrollmentListResponse(response);
      setEnrollments(parsed.items);
      setTotal(parsed.total);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setEnrollments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, page, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-[#102A56]">
          Enrolled Students
        </h2>
      </div>
      <BranchSectionToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search enrolled students..."
      />

      <BranchManageTableShell
        columns={[
          { key: "code", label: "Student Code", className: "w-[10rem]" },
          { key: "name", label: "Student Name" },
          { key: "batch", label: "Batch" },
          { key: "status", label: "Status", className: "w-[9rem]" },
          {
            key: "actions",
            label: "Actions",
            className: "w-[7rem] text-right",
          },
        ]}
        isLoading={isLoading}
        isEmpty={!isLoading && enrollments.length === 0}
        emptyMessage="No students enrolled yet"
        emptyDescription="Students enrolled in this branch through the Enrollment module will appear here."
      >
        {enrollments.map((enrollment) => (
          <tr key={enrollment.id} className="hover:bg-slate-50">
            <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-700">
              {enrollment.student?.studentCode ?? ""}
            </td>
            <td className="truncate px-4 py-3 text-sm font-medium text-[#102A56]">
              {formatStudentName(enrollment)}
            </td>
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {enrollment.batch?.name
                ? formatBatchLabel(
                    enrollment.batch.name,
                    enrollment.batch.code,
                  )
                : ""}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <EnrollmentStatusBadge status={enrollment.status} />
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1">
                {canUnenrollEnrollment(enrollment) ? (
                  <BranchIconAction
                    icon={UserMinus}
                    label="Unenroll student"
                    destructive
                    onClick={() =>
                      setUnenrollTarget({
                        enrollmentId: enrollment.id,
                        studentName: formatStudentName(enrollment),
                        branchName: enrollment.branch?.branchName ?? undefined,
                        batchName: enrollment.batch?.name ?? undefined,
                        courseTitle: enrollment.course?.title ?? undefined,
                      })
                    }
                  />
                ) : null}
                {enrollment.student?.id ? (
                  <BranchIconAction
                    icon={Eye}
                    label="View student"
                    onClick={() =>
                      router.push(studentManagePath(enrollment.student.id))
                    }
                  />
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </BranchManageTableShell>

      {!isLoading && enrollments.length > 0 ? (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <UnenrollEnrollmentDialog
        open={Boolean(unenrollTarget)}
        target={unenrollTarget}
        loading={isUnenrolling}
        onClose={() => setUnenrollTarget(null)}
        onConfirm={async (reason) => {
          if (!unenrollTarget) {
            return;
          }

          try {
            await unenrollEnrollment(unenrollTarget.enrollmentId, reason);
            setUnenrollTarget(null);
            await loadData();
          } catch {
            // Toast handled in hook.
          }
        }}
      />
    </Card>
  );
}
