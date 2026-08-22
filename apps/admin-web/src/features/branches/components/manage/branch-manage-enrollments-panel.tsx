"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
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

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading enrollments...
        </p>
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description="No enrollments for this branch yet."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium text-slate-900">
                      {formatStudentName(enrollment)}
                    </TableCell>
                    <TableCell>
                      {formatBatchLabel(
                        enrollment.batch?.name,
                        enrollment.batch?.code,
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.course?.title ?? "—"}
                    </TableCell>
                    <TableCell>
                      {formatStudentDate(
                        enrollment.admissionDate ?? enrollment.createdAt,
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(enrollment.feeAmount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(enrollment.discountAmount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(formatEnrollmentFinalAmount(enrollment))}
                    </TableCell>
                    <TableCell>
                      <StudentEnrollmentActiveBadge enrollment={enrollment} />
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </Card>
  );
}
