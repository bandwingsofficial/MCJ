"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourseTrainers } from "@/src/features/courses/hooks/use-course-trainers";
import { useAssignCourseTrainers } from "@/src/features/courses/hooks/use-assign-course-trainers";
import { useRemoveCourseTrainer } from "@/src/features/courses/hooks/use-remove-course-trainer";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseTrainerAssignment } from "@/src/features/courses/types/course.types";
import { AssignCourseTrainersModal } from "@/src/features/courses/components/manage/assign-course-trainers-modal";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
  disabled?: boolean;
  onRefresh?: () => Promise<void>;
}

function formatTrainerName(trainer: CourseTrainerAssignment) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
}

function CourseTrainerStatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return (
      <Badge variant="success" className="px-2.5 py-0.5 text-sm">
        Active
      </Badge>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Archived
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="px-2.5 py-0.5 text-sm">
      Inactive
    </Badge>
  );
}

export function CourseManageTrainersPanel({
  courseId,
  disabled = false,
  onRefresh,
}: Props) {
  const { trainers, isLoading, refetch } = useCourseTrainers(courseId);
  const { assignCourseTrainers, isLoading: isAssigning } =
    useAssignCourseTrainers();
  const { removeCourseTrainer, isLoading: isRemoving } =
    useRemoveCourseTrainer();

  const [assignOpen, setAssignOpen] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState<
    CourseTrainerAssignment[]
  >([]);
  const [availableLoading, setAvailableLoading] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const openAssign = async () => {
    setAssignOpen(true);
    setAvailableLoading(true);

    try {
      const response =
        await courseService.getAvailableCourseTrainers(courseId);
      setAvailableTrainers(response.data.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAvailableLoading(false);
    }
  };

  const handleAssign = async (trainerIds: string[]) => {
    try {
      const result = await assignCourseTrainers(courseId, trainerIds);
      const count = result.assignedCount;

      if (count > 1) {
        appToast.success(`${count} trainers assigned successfully`);
      } else if (count === 1) {
        appToast.success("1 trainer assigned successfully");
      } else {
        appToast.success("Trainers assigned successfully");
      }

      setAssignOpen(false);
      await refetch();
      await onRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) {
      return;
    }

    try {
      await removeCourseTrainer(courseId, removeTarget.id);
      appToast.success("Trainer removed from course successfully");
      setRemoveTarget(null);
      await refetch();
      await onRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Trainers</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage trainers assigned to this course.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          className="shrink-0"
          disabled={disabled}
          onClick={() => {
            void openAssign();
          }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Assign Trainer
        </Button>
      </div>

      <Card className="rounded-xl border border-slate-200 p-0 shadow-sm">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={4} />
          </div>
        ) : trainers.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-medium text-slate-900">
              No trainers assigned yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Assign trainers to this course to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Specialization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trainers.map((trainer) => {
                  const name = formatTrainerName(trainer);

                  return (
                    <tr key={trainer.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.employeeCode ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.specialization ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <CourseTrainerStatusBadge status={trainer.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={disabled || isRemoving}
                          aria-label={`Remove ${name}`}
                          onClick={() =>
                            setRemoveTarget({
                              id: trainer.id,
                              label: name,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AssignCourseTrainersModal
        open={assignOpen}
        trainers={availableTrainers}
        isLoading={availableLoading}
        isSubmitting={isAssigning}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove Trainer?"
        description={
          removeTarget
            ? `Are you sure you want to remove "${removeTarget.label}" from this course?`
            : ""
        }
        confirmLabel="Remove"
        loading={isRemoving}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          void handleRemove();
        }}
      />
    </>
  );
}
