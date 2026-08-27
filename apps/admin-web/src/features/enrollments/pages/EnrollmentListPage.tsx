"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { branchService } from "@/src/features/branches/services/branch.service";
import { CreateEnrollmentModal } from "@/src/features/enrollments/components/form/create-enrollment-modal";
import { UpdateEnrollmentModal } from "@/src/features/enrollments/components/form/update-enrollment-modal";
import { EnrollmentSummaryHeader } from "@/src/features/enrollments/components/table/enrollment-summary-header";
import { EnrollmentTable } from "@/src/features/enrollments/components/table/EnrollmentTable";
import { useEnrollment } from "@/src/features/enrollments/hooks/useEnrollment";
import { useEnrollments } from "@/src/features/enrollments/hooks/useEnrollments";
import type { Enrollment } from "@/src/features/enrollments/types";
import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";

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

  const emptyMessage = useMemo(() => {
    if (
      (filters.search ?? "").trim() ||
      filters.status ||
      filters.branchId
    ) {
      return "No enrolments match your filters.";
    }
    return "No data yet";
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
    <div className="-m-6 min-h-full bg-white p-6">
      <EnrollmentSummaryHeader
        total={count}
        isLoading={isLoading && enrollments.length === 0}
        onCreate={() => setIsCreateOpen(true)}
        filters={filters}
        branches={branches}
        onFiltersChange={setFilters}
      />

      <div className="mt-5">
        <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
          {isLoading && enrollments.length === 0 ? (
            <SkeletonTable rows={10} />
          ) : (
            <>
              {error ? (
                <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
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

              <EnrollmentTable
                enrollments={enrollments}
                emptyMessage={emptyMessage}
                onEdit={(item) => {
                  setSelectedEnrollment(item);
                  setIsEditOpen(true);
                }}
                onManage={(item) => {
                  router.push(enrollmentManagePath(item.id));
                }}
              />

              {count > 0 ? (
                <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">
                    <span className="leading-9">
                      Showing {from}–{to} of {count}
                    </span>

                    <label className="flex items-center gap-2 leading-9">
                      <span className="whitespace-nowrap">Rows per page</span>
                      <select
                        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"
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

                  <Pagination
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
              ) : null}
            </>
          )}
        </Card>
      </div>

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
    </div>
  );
}
