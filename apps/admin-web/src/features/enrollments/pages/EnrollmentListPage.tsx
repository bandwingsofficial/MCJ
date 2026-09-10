"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { branchService } from "@/src/features/branches/services/branch.service";
import { CreateEnrollmentModal } from "@/src/features/enrollments/components/form/create-enrollment-modal";
import { UpdateEnrollmentModal } from "@/src/features/enrollments/components/form/update-enrollment-modal";
import {
  UnenrollEnrollmentDialog,
  type UnenrollEnrollmentTarget,
} from "@/src/features/enrollments/components/dialogs/unenroll-enrollment-dialog";
import { EnrollmentSummaryHeader } from "@/src/features/enrollments/components/table/enrollment-summary-header";
import { EnrollmentTable } from "@/src/features/enrollments/components/table/EnrollmentTable";
import { useEnrollment } from "@/src/features/enrollments/hooks/useEnrollment";
import { useEnrollments } from "@/src/features/enrollments/hooks/useEnrollments";
import { useUnenrollEnrollment } from "@/src/features/enrollments/hooks/useUnenrollEnrollment";
import type { Enrollment } from "@/src/features/enrollments/types";
import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

export function EnrollmentListPage() {
  const router = useRouter();
  const {
    enrollments,
    count,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useEnrollments();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [unenrollTarget, setUnenrollTarget] =
    useState<UnenrollEnrollmentTarget | null>(null);
  const { unenrollEnrollment, isLoading: isUnenrolling } =
    useUnenrollEnrollment();
  const [branches, setBranches] = useState<
    Array<{ id: string; branchName: string; branchCode: string }>
  >([]);

  const { enrollment: editEnrollment, isLoading: isEditLoading } =
    useEnrollment(isEditOpen ? selectedEnrollment?.id ?? "" : "");

  const pageSize = filters.take || 10;
  const page = Math.floor(filters.skip / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const from = count === 0 ? 0 : filters.skip + 1;
  const to = Math.min(filters.skip + pageSize, count);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(count / pageSize));
    if (page > maxPage) {
      setFilters({
        ...filters,
        skip: (maxPage - 1) * pageSize,
      });
    }
  }, [count, page, pageSize, filters, setFilters]);

  const emptyTitle = useMemo(() => {
    if (
      (filters.search ?? "").trim() ||
      filters.status ||
      filters.branchId
    ) {
      return "No Enrolments Found";
    }
    return "No Enrolments Yet";
  }, [filters.search, filters.status, filters.branchId]);

  const emptyDescription = useMemo(() => {
    if (
      (filters.search ?? "").trim() ||
      filters.status ||
      filters.branchId
    ) {
      return "Try adjusting your search or filter criteria.";
    }
    return "Create your first enrolment to get started.";
  }, [filters.search, filters.status, filters.branchId]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await branchService.getBranches({
          status: "ACTIVE",
          page: 1,
          pageSize: 100,
          includeDeleted: false,
        });

        setBranches(
          (response.data.items ?? []).map((branch) => ({
            id: branch.id,
            branchName: branch.branchName,
            branchCode: branch.branchCode,
          })),
        );
      } catch {
        setBranches([]);
      }
    };

    void loadBranches();
  }, []);

  if (error && enrollments.length === 0 && !isLoading) {
    return (
      <ErrorState
        title="Failed To Load Enrollments"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <EnrollmentSummaryHeader
        total={count}
        isLoading={isLoading && enrollments.length === 0}
        onCreate={() => setIsCreateOpen(true)}
        filters={filters}
        branches={branches}
        onFiltersChange={setFilters}
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
          {isLoading && enrollments.length === 0 ? (
            <SkeletonTable rows={10} />
          ) : (
            <>
              {error ? (
                <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}{" "}
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={() => {
                      void refetch();
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div aria-busy={isLoading} className="relative">
                {isLoading ? (
                  <span className="sr-only">Updating enrolments</span>
                ) : null}

                <EnrollmentTable
                  enrollments={enrollments}
                  emptyTitle={emptyTitle}
                  emptyDescription={emptyDescription}
                  onEdit={(item) => {
                    setSelectedEnrollment(item);
                    setIsEditOpen(true);
                  }}
                  onManage={(item) => {
                    router.push(enrollmentManagePath(item.id));
                  }}
                  onUnenroll={(item) => {
                    setUnenrollTarget({
                      enrollmentId: item.id,
                      studentName:
                        formatPersonName(
                          item.student?.firstName,
                          item.student?.lastName,
                        ) || item.enrollmentNumber,
                      branchName: item.branch?.branchName ?? undefined,
                      batchName: item.batch?.name ?? undefined,
                      courseTitle: item.course?.title ?? undefined,
                    });
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                  <span>
                    Showing {from}–{to} of {count}
                  </span>

                  <label className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap">Rows per page</span>
                    <select
                      className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                      value={pageSize}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          take: Number(event.target.value),
                          skip: 0,
                        })
                      }
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <CategoryPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) =>
                    setFilters({
                      ...filters,
                      skip: (nextPage - 1) * pageSize,
                    })
                  }
                />
              </div>
            </>
          )}
        </Card>

      <CreateEnrollmentModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />

      <UpdateEnrollmentModal
        open={isEditOpen}
        enrollment={editEnrollment ?? selectedEnrollment}
        isLoading={isEditLoading && !editEnrollment}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEnrollment(null);
        }}
        onSuccess={() => {
          void refetch();
        }}
      />

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
            void refetch();
          } catch {
            // Toast handled in hook.
          }
        }}
      />
    </div>
  );
}
