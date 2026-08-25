"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

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
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { StudentEnrollmentActiveBadge } from "@/src/features/students/components/manage/student-enrollment-active-badge";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { studentManageTabPath } from "@/src/features/students/utils/student-manage.routes";

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

function formatEnrollmentFinalAmount(enrollment: Enrollment): number {
  const fee = normalizeMoney(enrollment.feeAmount);
  const discount = normalizeMoney(enrollment.discountAmount);
  const finalAmount = normalizeMoney(enrollment.finalAmount);

  if (finalAmount > 0) {
    return finalAmount;
  }

  return Math.max(0, fee - discount);
}

export function BranchManageEnrollmentsPanel({ branchId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await enrollmentService.getEnrollments({
        search,
        branchId,
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
      <BranchSectionToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search enrollments..."
      />

      <BranchManageTableShell
        columns={[
          { key: "student", label: "Student" },
          { key: "batch", label: "Batch" },
          { key: "course", label: "Course" },
          { key: "date", label: "Enrollment Date", className: "w-[8rem]" },
          { key: "fee", label: "Fee", className: "w-[6rem]" },
          { key: "discount", label: "Discount", className: "w-[6rem]" },
          { key: "final", label: "Final Amount", className: "w-[7rem]" },
          { key: "status", label: "Status", className: "w-[8rem]" },
          {
            key: "actions",
            label: "Actions",
            className: "w-[4.5rem] text-right",
          },
        ]}
        isLoading={isLoading}
        isEmpty={!isLoading && enrollments.length === 0}
        emptyMessage="No enrollments found yet"
        emptyDescription="Enrollments for this branch will appear here."
      >
        {enrollments.map((enrollment) => (
          <tr key={enrollment.id} className="hover:bg-slate-50">
            <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
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
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {enrollment.course?.title ?? ""}
            </td>
            <td className="px-4 py-3 text-sm text-slate-700">
              {formatStudentDate(
                enrollment.admissionDate ?? enrollment.createdAt,
              )}
            </td>
            <td className="px-4 py-3 text-sm text-slate-700">
              {formatCurrency(enrollment.feeAmount)}
            </td>
            <td className="px-4 py-3 text-sm text-slate-700">
              {formatCurrency(enrollment.discountAmount)}
            </td>
            <td className="px-4 py-3 text-sm text-slate-700">
              {formatCurrency(formatEnrollmentFinalAmount(enrollment))}
            </td>
            <td className="px-4 py-3">
              <StudentEnrollmentActiveBadge enrollment={enrollment} />
            </td>
            <td className="px-4 py-3 text-right">
              {enrollment.student?.id ? (
                <BranchIconAction
                  icon={Eye}
                  label="Manage"
                  onClick={() =>
                    router.push(
                      studentManageTabPath(
                        enrollment.student.id,
                        "enrollments",
                      ),
                    )
                  }
                />
              ) : null}
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
    </Card>
  );
}
