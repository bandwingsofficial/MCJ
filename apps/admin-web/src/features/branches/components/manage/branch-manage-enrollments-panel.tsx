"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, UserCheck, UserMinus } from "lucide-react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchManagePaginationFooter } from "@/src/features/branches/components/manage/branch-manage-pagination-footer";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TAB_HEADER_CLASS,
  BRANCH_TAB_HEADER_ROW_CLASS,
  BRANCH_TAB_TITLE_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
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
import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";

const PAGE_SIZE = 10;

interface Props {
  branchId: string;
  disabled?: boolean;
}

function formatStudentName(enrollment: Enrollment): string {
  return formatPersonName(
    enrollment.student?.firstName,
    enrollment.student?.lastName,
  );
}

export function BranchManageEnrollmentsPanel({
  branchId,
  disabled = false,
}: Props) {
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
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <div className="space-y-3">
        <header className={BRANCH_TAB_HEADER_CLASS}>
          <div className={BRANCH_TAB_HEADER_ROW_CLASS}>
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 className={BRANCH_TAB_TITLE_CLASS}>Enrolled Students</h2>
              <span className={BRANCH_TAB_COUNT_CLASS}>
                Total Enrolled:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : total}
                </span>
              </span>
            </div>

            <BranchSectionToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search enrolled students..."
            />
          </div>
        </header>

        <div className={BRANCH_TABLE_CARD_CLASS}>
          <BranchManageTableShell
            embedded
            columns={[
              { key: "code", label: "Student Code", className: "w-[10rem]" },
              { key: "name", label: "Student Name" },
              { key: "batch", label: "Batch" },
              { key: "status", label: "Status", className: "w-[9rem]" },
              {
                key: "actions",
                label: "Actions",
                className: "w-[6.75rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && enrollments.length === 0}
            emptyTitle="No Students Enrolled Yet"
            emptyDescription="Students enrolled in this branch through the Enrollment module will appear here."
            emptyIcon={UserCheck}
          >
            {enrollments.map((enrollment) => (
              <tr
                key={enrollment.id}
                className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
              >
                <td className={`${TABLE_CELL_CLASS} font-mono text-slate-700`}>
                  {enrollment.student?.studentCode ?? ""}
                </td>
                <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                  <span className="block truncate">
                    {formatStudentName(enrollment)}
                  </span>
                </td>
                <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                  <span className="block truncate">
                    {enrollment.batch?.name
                      ? formatBatchLabel(
                          enrollment.batch.name,
                          enrollment.batch.code,
                        )
                      : ""}
                  </span>
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <EnrollmentStatusBadge status={enrollment.status} />
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-2">
                    {canUnenrollEnrollment(enrollment) ? (
                      <BranchIconAction
                        icon={UserMinus}
                        label="Unenroll student"
                        destructive
                        disabled={disabled || isUnenrolling}
                        onClick={() =>
                          setUnenrollTarget({
                            enrollmentId: enrollment.id,
                            studentName: formatStudentName(enrollment),
                            branchName:
                              enrollment.branch?.branchName ?? undefined,
                            batchName: enrollment.batch?.name ?? undefined,
                            courseTitle: enrollment.course?.title ?? undefined,
                          })
                        }
                      />
                    ) : null}
                    {enrollment.id ? (
                      <BranchIconAction
                        icon={Eye}
                        label="View enrollment"
                        primary
                        onClick={() =>
                          router.push(enrollmentManagePath(enrollment.id))
                        }
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </BranchManageTableShell>

          {!isLoading ? (
            <BranchManagePaginationFooter
              from={from}
              to={to}
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={totalPages}
              disabled={disabled || isUnenrolling}
              showPageSizeSelector={false}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
            />
          ) : null}
        </div>
      </div>

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
    </>
  );
}
