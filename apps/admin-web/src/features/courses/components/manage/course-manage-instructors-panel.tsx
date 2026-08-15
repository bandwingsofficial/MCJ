"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { appToast } from "@/src/shared/components/ui/toast";

import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";
import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
  disabled?: boolean;
  onRefresh?: () => Promise<void>;
}

export function CourseManageInstructorsPanel({
  courseId,
  disabled = false,
  onRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [instructors, setInstructors] = useState<TrainerDetails[]>([]);
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

  const loadInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await trainerService.getTrainers({
        search,
        page: 1,
        pageSize: 100,
      });
      const details = await Promise.all(
        (response.data.items ?? []).map(async (item) => {
          const detail = await trainerService.getTrainer(item.id);
          return detail.data;
        }),
      );
      const assigned = details.filter((trainer) =>
        trainer.courses.some((course) => course.id === courseId),
      );
      setInstructors(assigned);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, search]);

  useEffect(() => {
    void loadInstructors();
  }, [loadInstructors]);

  const openAssign = async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await trainerService.getTrainers({
        page: 1,
        pageSize: 200,
      });
      const assignedIds = new Set(instructors.map((item) => item.id));
      setAssignCandidates(
        (response.data.items ?? [])
          .filter((item) => !assignedIds.has(item.id))
          .map((item) => ({
            id: item.id,
            label: [item.firstName, item.lastName].filter(Boolean).join(" "),
            meta: item.email ?? item.status,
            imageUrl: item.profileImageUrl,
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
        const detail = await trainerService.getTrainer(id);
        const existing = detail.data.courses.map((course) => course.id);
        const next = Array.from(new Set([...existing, courseId]));
        await trainerService.assignTrainerCourses(id, next);
      }
      appToast.success("Instructors assigned");
      setAssignOpen(false);
      await loadInstructors();
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
      const detail = await trainerService.getTrainer(unassignTarget.id);
      const next = detail.data.courses
        .map((course) => course.id)
        .filter((id) => id !== courseId);
      await trainerService.assignTrainerCourses(unassignTarget.id, next);
      appToast.success("Instructor unassigned");
      setUnassignTarget(null);
      await loadInstructors();
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
              placeholder="Search instructors..."
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
            Assign Instructor
          </Button>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading instructors...
          </p>
        ) : instructors.length === 0 ? (
          <EmptyState
            title="No instructors assigned"
            description="Assign trainers to teach this course."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {instructors.map((trainer) => {
                  const name = [trainer.firstName, trainer.lastName]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr key={trainer.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {trainer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/trainers/${trainer.id}`}
                            className="text-sm font-medium text-[#2447A8] hover:underline"
                          >
                            View
                          </Link>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            onClick={() =>
                              setUnassignTarget({
                                id: trainer.id,
                                label: name,
                              })
                            }
                          >
                            Unassign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Instructors"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search instructors..."
        emptyMessage="No matching instructors"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Remove instructor assignment?"
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
