"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";
import { courseService } from "@/src/features/courses/services/course.service";
import type {
  CourseBranch,
  CourseDetails,
} from "@/src/features/courses/types/course.types";
import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  course: CourseDetails;
  disabled?: boolean;
  onCourseUpdated: (course: CourseDetails) => void;
  onRefresh?: () => Promise<void>;
}

export function CourseManageBranchesPanel({
  course,
  disabled = false,
  onCourseUpdated,
  onRefresh,
}: Props) {
  const courseId = course.id;
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<CourseBranch[]>(
    course.branches ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getCourse(courseId);
      setBranches(response.data.branches ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  const filteredBranches = branches.filter((branch) => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return (
      branch.branchName.toLowerCase().includes(q) ||
      branch.branchCode.toLowerCase().includes(q)
    );
  });

  const openAssign = async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await branchService.getBranches({
        search: "",
        page: 1,
        pageSize: 200,
      });
      const assignedIds = new Set(branches.map((item) => item.id));
      setAssignCandidates(
        (response.data.items ?? [])
          .filter(
            (item) =>
              item.status === "ACTIVE" && !assignedIds.has(item.id),
          )
          .map((item) => ({
            id: item.id,
            label: item.branchName,
            meta: item.branchCode,
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
      const existing = branches.map((branch) => branch.id);
      const next = Array.from(new Set([...existing, ...ids]));
      const response = await courseService.updateCourse(courseId, {
        branchIds: next,
      });
      onCourseUpdated(response.data);
      setBranches(response.data.branches ?? []);
      appToast.success("Branches assigned");
      setAssignOpen(false);
      await onRefresh?.();
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
      const next = branches
        .map((branch) => branch.id)
        .filter((id) => id !== unassignTarget.id);
      const response = await courseService.updateCourse(courseId, {
        branchIds: next,
      });
      onCourseUpdated(response.data);
      setBranches(response.data.branches ?? []);
      appToast.success("Branch unassigned");
      setUnassignTarget(null);
      await onRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 sm:max-w-sm">
            <SearchInput
              value={search}
              placeholder="Search branches..."
              onChange={setSearch}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => {
              void openAssign();
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Assign Branch
          </Button>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading branches...
          </p>
        ) : filteredBranches.length === 0 ? (
          <EmptyState
            title="No branches assigned"
            description="Assign branches where this course is offered."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {branch.branchName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {branch.branchCode}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() =>
                          setUnassignTarget({
                            id: branch.id,
                            label: branch.branchName,
                          })
                        }
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Branches"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search branches..."
        emptyMessage="No matching branches"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Remove branch assignment?"
        description={
          unassignTarget
            ? `This will unassign “${unassignTarget.label}” from this course.`
            : ""
        }
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
