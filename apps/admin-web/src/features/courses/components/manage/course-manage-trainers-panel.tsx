"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";
import { useCourseTrainers } from "@/src/features/courses/hooks/use-course-trainers";

import { AssignCourseTrainersModal } from "./assign-course-trainers-modal";

interface Props {
  courseId: string;
  disabled?: boolean;
}

function formatTrainerName(
  trainer: Pick<TrainerDetails, "firstName" | "lastName">,
) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
}

export function CourseManageTrainersPanel({
  courseId,
  disabled = false,
}: Props) {
  const { trainers, isLoading, error, refetch } = useCourseTrainers(courseId);

  const [tableSearch, setTableSearch] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState<TrainerDetails[]>(
    [],
  );
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [unassignTarget, setUnassignTarget] =
    useState<TrainerDetails | null>(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  const assignedIds = useMemo(
    () => trainers.map((trainer) => trainer.id),
    [trainers],
  );

  const filteredTrainers = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();

    if (!query) {
      return trainers;
    }

    return trainers.filter((trainer) => {
      const haystack = [
        formatTrainerName(trainer),
        trainer.qualification ?? "",
        trainer.specialization ?? "",
        trainer.employeeCode ?? "",
        trainer.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [tableSearch, trainers]);

  const openAssignModal = async () => {
    setAssignOpen(true);
    setIsLoadingAvailable(true);

    try {
      const activeTrainers =
        await trainerService.getActiveTrainersForAssignment();
      setAvailableTrainers(activeTrainers);
    } catch (err) {
      appToast.error(getErrorMessage(err));
      setAssignOpen(false);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleAssign = async (selectedIds: string[]) => {
    try {
      setIsAssigning(true);
      await trainerService.assignTrainersToCourse(courseId, selectedIds);
      appToast.success("Trainer(s) assigned successfully");
      setAssignOpen(false);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    try {
      setIsUnassigning(true);
      await trainerService.unassignTrainerFromCourse(
        courseId,
        unassignTarget.id,
      );
      appToast.success("Trainer unassigned successfully");
      setUnassignTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsUnassigning(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <SearchInput
                value={tableSearch}
                placeholder="Search assigned trainers..."
                className="!h-10 max-w-xl rounded-lg !py-2 pl-9 text-[15px]"
                onChange={setTableSearch}
              />
            </div>

            <Button
              type="button"
              size="sm"
              disabled={disabled}
              className="h-10 shrink-0 self-start lg:self-auto"
              onClick={() => {
                void openAssignModal();
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Assign Trainer
            </Button>
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorState
              title="Failed to load trainers"
              description={error}
              onRetry={() => {
                void refetch();
              }}
            />
          </div>
        ) : isLoading ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]">
                <tr>
                  {[
                    "Profile",
                    "Trainer Name",
                    "Qualification",
                    "Specialization",
                    "Status",
                    "Actions",
                  ].map((label) => (
                    <th
                      key={label}
                      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                        label === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrainers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-[#647A9B]"
                    >
                      {trainers.length === 0
                        ? "No trainers assigned to this course."
                        : "No assigned trainers match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredTrainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-3 py-3 align-middle">
                        {trainer.profileImageUrl ? (
                          <Image
                            src={trainer.profileImageUrl}
                            alt=""
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-lg border border-slate-200 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                            {formatTrainerName(trainer).charAt(0) || "?"}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <p className="font-medium text-[#102A56]">
                          {formatTrainerName(trainer) || "—"}
                        </p>
                        {trainer.employeeCode ? (
                          <p className="text-xs text-slate-500">
                            {trainer.employeeCode}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 align-middle text-sm text-slate-700">
                        {trainer.qualification?.trim() || "—"}
                      </td>
                      <td className="px-3 py-3 align-middle text-sm text-slate-700">
                        {trainer.specialization?.trim() || "—"}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <TrainerStatusBadge status={trainer.status} />
                      </td>
                      <td className="px-2 py-3 align-middle">
                        <div className="flex items-center justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled || isUnassigning}
                            aria-label="Unassign trainer"
                            className="h-9 w-9 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setUnassignTarget(trainer)}
                          >
                            <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AssignCourseTrainersModal
        open={assignOpen}
        assignedIds={assignedIds}
        trainers={availableTrainers}
        isLoading={isLoadingAvailable}
        isSubmitting={isAssigning}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={unassignTarget !== null}
        title="Unassign trainer?"
        description={`Remove ${formatTrainerName(unassignTarget ?? { firstName: "this trainer", lastName: null })} from this course? The trainer profile will not be deleted.`}
        confirmLabel="Unassign"
        confirmVariant="danger"
        loading={isUnassigning}
        onCancel={() => {
          if (!isUnassigning) {
            setUnassignTarget(null);
          }
        }}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
