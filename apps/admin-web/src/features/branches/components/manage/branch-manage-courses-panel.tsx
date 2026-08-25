"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Link2Off, Settings2 } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
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

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { batchService } from "@/src/features/batches/services/batch.service";
import {
  formatCourseDuration,
  formatCourseLevel,
  formatCoursePrice,
} from "@/src/features/branches/utils/branch-display.utils";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageCoursesPanel({
  branchId,
  assignmentsDisabled = false,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [batchCountByCourse, setBatchCountByCourse] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [courseResponse, batchResponse] = await Promise.all([
        courseService.getCourses({
          search,
          branchId,
          page: 1,
          pageSize: 100,
        }),
        batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 200,
        }),
      ]);

      setCourses(courseResponse.data.items ?? []);

      const counts: Record<string, number> = {};
      for (const batch of batchResponse.data.items ?? []) {
        if (!batch.courseId) {
          continue;
        }

        counts[batch.courseId] = (counts[batch.courseId] ?? 0) + 1;
      }
      setBatchCountByCourse(counts);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCourses([]);
      setBatchCountByCourse({});
    } finally {
      setIsLoading(false);
    }
  }, [branchId, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openAssign = async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await courseService.getCourses({
        search: "",
        page: 1,
        pageSize: 200,
      });
      const assigned = new Set(courses.map((course) => course.id));
      setAssignCandidates(
        (response.data.items ?? [])
          .filter((item) => !assigned.has(item.id))
          .map((item) => ({
            id: item.id,
            label: item.title,
            meta: item.code,
          })),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      for (const id of ids) {
        const detail = await courseService.getCourse(id);
        const existing =
          detail.data.branches?.map((branch) => branch.id) ?? [];
        const next = Array.from(new Set([...existing, branchId]));
        await courseService.updateCourse(id, { branchIds: next });
      }
      appToast.success("Courses assigned");
      setAssignOpen(false);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    setUnassignLoading(true);
    try {
      const detail = await courseService.getCourse(unassignTarget.id);
      const existing = detail.data.branches?.map((branch) => branch.id) ?? [];
      await courseService.updateCourse(unassignTarget.id, {
        branchIds: existing.filter((id) => id !== branchId),
      });
      appToast.success("Course unassigned");
      setUnassignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search courses..."
          assignLabel="Assign Course"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading courses...
          </p>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses assigned"
            description="Assign a course to this branch to see it here."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type / Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Batches Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono text-sm text-slate-700">
                      {course.code || "—"}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {course.title}
                    </TableCell>
                    <TableCell>
                      {course.category?.name ??
                        course.categoryName ??
                        "No Category"}
                    </TableCell>
                    <TableCell>{formatCourseLevel(course.level)}</TableCell>
                    <TableCell>
                      {formatCourseDuration(
                        course.duration,
                        course.durationType,
                      )}
                    </TableCell>
                    <TableCell>{formatCoursePrice(course)}</TableCell>
                    <TableCell>{batchCountByCourse[course.id] ?? 0}</TableCell>
                    <TableCell>
                      <CourseStatusBadge status={course.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <BranchIconAction
                          icon={Settings2}
                          label="Manage"
                          href={`/courses/${course.id}/manage`}
                        />
                        <BranchIconAction
                          icon={Eye}
                          label="Preview"
                          href={`/courses/${course.id}/preview`}
                        />
                        <BranchIconAction
                          icon={Link2Off}
                          label="Unassign Course"
                          destructive
                          disabled={assignmentsDisabled}
                          onClick={() =>
                            setUnassignTarget({
                              id: course.id,
                              label: course.title,
                            })
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Courses"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search courses..."
        emptyMessage="No courses available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign Course"
        description={`Remove "${unassignTarget?.label ?? "this course"}" from this branch? The course itself will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
      />
    </>
  );
}
