"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
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
  formatTrainerNames,
} from "@/src/features/branches/utils/branch-display.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { courseService } from "@/src/features/courses/services/course.service";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  branchId: string;
}

export function BranchManageBatchesPanel({ branchId }: Props) {
  const [search, setSearch] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [categoryByCourseId, setCategoryByCourseId] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [batchResponse, courseResponse] = await Promise.all([
        batchService.getBatches({
          search,
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        }),
        courseService.getCourses({
          branchId,
          page: 1,
          pageSize: 200,
        }),
      ]);

      setBatches(batchResponse.data.items ?? []);

      const categoryMap: Record<string, string> = {};
      for (const course of courseResponse.data.items ?? []) {
        categoryMap[course.id] =
          course.category?.name ?? course.categoryName ?? "No Category";
      }
      setCategoryByCourseId(categoryMap);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setBatches([]);
      setCategoryByCourseId({});
    } finally {
      setIsLoading(false);
    }
  }, [branchId, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <BranchSectionToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search batches..."
        createHref={`/batches/create?branchId=${branchId}`}
        createLabel="Create Batch"
      />

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading batches...
        </p>
      ) : batches.length === 0 ? (
        <EmptyState
          title="No batches found"
          description="No batches belong to this branch yet."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Code</TableHead>
                <TableHead>Batch Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Trainer(s)</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono text-sm text-slate-700">
                    {batch.code || "—"}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {batch.name}
                  </TableCell>
                  <TableCell>
                    {batch.course?.title ?? "—"}
                  </TableCell>
                  <TableCell>
                    {batch.courseId
                      ? (categoryByCourseId[batch.courseId] ?? "No Category")
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {formatTrainerNames(batch.trainers ?? [])}
                  </TableCell>
                  <TableCell>{formatStudentDate(batch.startDate)}</TableCell>
                  <TableCell>{formatStudentDate(batch.endDate)}</TableCell>
                  <TableCell>
                    <BatchStatusBadge status={batch.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <BranchIconAction
                      icon={Eye}
                      label="View"
                      href={`/batches/${batch.id}/manage`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
