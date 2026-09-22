"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { appToast } from "@/src/shared/components/ui/toast";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  Batch,
  BatchFilterStatus,
} from "@/src/features/batches/types/batch.types";
import {
  applyBatchStatusFilter,
  getBatchStatusFilterValue,
  parseBatchListResponse,
  type BatchStatusFilterValue,
} from "@/src/features/batches/utils/batch-list.utils";
import {
  BATCH_SELECT_ALL,
  getBatchDisplayStatus,
  uniqueSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";
import { batchManagePath } from "@/src/features/batches/utils/batch-manage.routes";
import { branchService } from "@/src/features/branches/services/branch.service";
import type { BranchListItem } from "@/src/features/branches/types/branch.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import {
  expandCourseManageBatchRows,
  formatBranchBatchEnrollmentLabel,
  formatCourseManageBatchSchedule,
  buildLiveBranchMap,
} from "@/src/features/courses/utils/course-manage-batches.utils";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  courseId: string;
}

async function loadCourseEnrollments(courseId: string): Promise<Enrollment[]> {
  const pageSize = 100;
  const items: Enrollment[] = [];
  let skip = 0;

  for (;;) {
    const response = await enrollmentService.getEnrollments({
      courseId,
      includeDeleted: false,
      skip,
      take: pageSize,
    });
    const parsed = parseEnrollmentListResponse(response);
    items.push(...parsed.items);

    if (items.length >= parsed.total || parsed.items.length < pageSize) {
      break;
    }

    skip += pageSize;
  }

  return items;
}

export function CourseManageBatchesPanel({ courseId }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BatchFilterStatus | undefined>(
    undefined,
  );
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const statusFilterValue = getBatchStatusFilterValue({ status });

  const statusOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Status", value: BATCH_SELECT_ALL },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Archived", value: "ARCHIVED" },
      ]),
    [],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [batchResponse, branchResponse, courseEnrollments] =
        await Promise.all([
          batchService.getBatches({
            courseId,
            search: search.trim() || undefined,
            ...applyBatchStatusFilter({}, statusFilterValue),
            includeDeleted: status === "ARCHIVED" ? true : false,
            page: 1,
            pageSize: 100,
          }),
          branchService.getBranches({
            page: 1,
            pageSize: 500,
            includeDeleted: false,
          }),
          loadCourseEnrollments(courseId),
        ]);

      const payload = parseBatchListResponse(batchResponse.data);
      setBatches(payload.items);
      setBranches(branchResponse.data.items ?? []);
      setEnrollments(courseEnrollments);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setBatches([]);
      setBranches([]);
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, search, status, statusFilterValue]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const liveBranchById = useMemo(
    () => buildLiveBranchMap(branches),
    [branches],
  );

  const liveRows = useMemo(
    () => expandCourseManageBatchRows(batches, liveBranchById),
    [batches, liveBranchById],
  );

  const hasCourseBatches = batches.length > 0;
  const hasLiveBranchRows = liveRows.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#102A56]">Batches</h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Live parent batches assigned to active branches for this course.
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
            <div className="w-full sm:min-w-[200px] sm:flex-1 sm:max-w-xs">
              <SearchInput
                value={search}
                placeholder="Search batches..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={setSearch}
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <AppSelect
                value={statusFilterValue}
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                onValueChange={(value) => {
                  const next = applyBatchStatusFilter(
                    {},
                    value as BatchStatusFilterValue | typeof BATCH_SELECT_ALL,
                  );
                  setStatus(next.status);
                }}
                options={statusOptions}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-[#647A9B]">
            Loading batches...
          </p>
        ) : !hasLiveBranchRows ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
            <h3 className="text-base font-semibold text-[#102A56]">
              {hasCourseBatches
                ? "No live branch batch for this course"
                : "No batches for this course"}
            </h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              {hasCourseBatches
                ? "Parent batches exist for this course but none are assigned to an active branch yet. Assign a batch to a branch to make it available."
                : "No parent batches are linked to this course yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E1EBF5]">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                <tr>
                  <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Batch Name
                  </th>
                  <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Branch Name
                  </th>
                  <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Schedule
                  </th>
                  <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Status
                  </th>
                  <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Enrollment
                  </th>
                  <th className="w-[5rem] !px-4 !py-3 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveRows.map(({ batch, branchId, branchName, rowKey }) => {
                  const displayStatus = getBatchDisplayStatus(batch);
                  const isLifecycleBlocked =
                    displayStatus.key === "COMPLETED" ||
                    displayStatus.key === "EXPIRED" ||
                    displayStatus.key === "CANCELLED" ||
                    displayStatus.key === "ARCHIVED";
                  const schedule = formatCourseManageBatchSchedule(batch);

                  return (
                    <tr
                      key={rowKey}
                      className={cn(
                        isLifecycleBlocked
                          ? "bg-slate-100/80 text-slate-500"
                          : "hover:bg-slate-50",
                      )}
                    >
                      <td className="!px-4 !py-3 align-middle">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            isLifecycleBlocked
                              ? "text-slate-500"
                              : "text-[#102A56]",
                          )}
                        >
                          {batch.name}
                        </p>
                        {batch.code ? (
                          <p className="truncate font-mono text-xs text-slate-500">
                            {batch.code}
                          </p>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          "truncate !px-4 !py-3 align-middle text-sm",
                          isLifecycleBlocked
                            ? "text-slate-400"
                            : "text-slate-700",
                        )}
                      >
                        {branchName}
                      </td>
                      <td className="!px-4 !py-3 align-middle">
                        <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                          <span
                            className={cn(
                              "truncate whitespace-nowrap text-sm",
                              isLifecycleBlocked
                                ? "text-slate-500"
                                : "text-[#102A56]",
                            )}
                          >
                            {schedule.primary}
                          </span>
                          <span
                            className={cn(
                              "truncate whitespace-nowrap text-sm",
                              isLifecycleBlocked
                                ? "text-slate-400"
                                : "text-slate-600",
                            )}
                          >
                            {schedule.secondary}
                          </span>
                        </div>
                      </td>
                      <td className="!px-4 !py-3 align-middle">
                        <BatchStatusBadge
                          displayStatus={displayStatus}
                          status={batch.status}
                          isActive={batch.isActive}
                          isDeleted={Boolean(
                            batch.isDeleted || batch.deletedAt,
                          )}
                          startDate={batch.startDate}
                          endDate={batch.endDate}
                        />
                      </td>
                      <td
                        className={cn(
                          "!px-4 !py-3 align-middle text-sm tabular-nums",
                          isLifecycleBlocked
                            ? "text-slate-400"
                            : "text-slate-700",
                        )}
                      >
                        {formatBranchBatchEnrollmentLabel(
                          batch,
                          branchId,
                          enrollments,
                        )}
                      </td>
                      <td className="!px-4 !py-3 text-right align-middle">
                        <Tooltip content="Manage batch">
                          <Link
                            href={batchManagePath(batch.id)}
                            aria-label="Manage batch"
                            className={`${iconButtonClass} text-blue-900`}
                          >
                            <Settings2 className={iconClass} />
                          </Link>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
