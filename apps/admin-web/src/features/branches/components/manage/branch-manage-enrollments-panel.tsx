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
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { studentManagePath } from "@/src/features/students/utils/student-manage.routes";
import { formatEnrollmentCategoryName } from "@/src/features/students/utils/enrollment-display.utils";

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
        searchPlaceholder="Search enrolled students..."
      />

      <BranchManageTableShell
        columns={[
          { key: "code", label: "Student Code", className: "w-[7rem]" },
          { key: "student", label: "Student" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone", className: "w-[7rem]" },
          { key: "batch", label: "Batch" },
          { key: "course", label: "Course" },
          { key: "category", label: "Category", className: "w-[7rem]" },
          { key: "date", label: "Enrollment Date", className: "w-[8rem]" },
          { key: "payment", label: "Payment", className: "w-[7rem]" },
          { key: "status", label: "Enrollment Status", className: "w-[8rem]" },
          {
            key: "actions",
            label: "Actions",
            className: "w-[4.5rem] text-right",
          },
        ]}
        isLoading={isLoading}
        isEmpty={!isLoading && enrollments.length === 0}
        emptyMessage="No students enrolled yet"
        emptyDescription="Students enrolled in this branch through the Enrollment module will appear here."
      >
        {enrollments.map((enrollment) => (
          <tr key={enrollment.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-sm text-slate-700">
              {enrollment.student?.studentCode ?? "—"}
            </td>
            <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
              {formatStudentName(enrollment)}
            </td>
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {enrollment.student?.email ?? "—"}
            </td>
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {enrollment.student?.phone ?? "—"}
            </td>
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {enrollment.batch?.name
                ? formatBatchLabel(
                    enrollment.batch.name,
                    enrollment.batch.code,
                  )
                : "—"}
            </td>
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {enrollment.course?.title ?? "—"}
            </td>
            <td className="truncate px-4 py-3 text-sm text-slate-700">
              {formatEnrollmentCategoryName(enrollment)}
            </td>
            <td className="px-4 py-3 text-sm text-slate-700">
              {formatStudentDate(
                enrollment.admissionDate ?? enrollment.createdAt,
              )}
            </td>
            <td className="px-4 py-3">
              <PaymentStatusBadge status={enrollment.paymentStatus} />
            </td>
            <td className="px-4 py-3">
              <EnrollmentStatusBadge status={enrollment.status} />
            </td>
            <td className="px-4 py-3 text-right">
              {enrollment.student?.id ? (
                <BranchIconAction
                  icon={Eye}
                  label="View student"
                  onClick={() =>
                    router.push(studentManagePath(enrollment.student.id))
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
