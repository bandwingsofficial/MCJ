"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { cn } from "@/src/shared/lib/cn";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import { getBatchModeLabel } from "@/src/features/batches/utils/batch-mode.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import type { AssignBranchTrainersPayload } from "@/src/features/branches/types/branch.types";
import {
  formatTimingOptionLabel,
  formatTrainerDisplayName,
  getUpcomingConfiguredModes,
  getUpcomingTimingsForMode,
  loadBatchForTrainerAssignment,
  loadBranchCoursesForTrainerAssign,
  loadUpcomingBranchCourseBatches,
} from "@/src/features/branches/utils/branch-trainer-relation.utils";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import type { CourseListItem } from "@/src/features/courses/types/course.types";

const ALREADY_ASSIGNED_LABEL = "ALREADY ASSIGNED";

type AssignmentKind = "COURSE_BATCH" | "BRANCH_ONLY";

interface Props {
  open: boolean;
  branchId: string;
  branchOnlyAssignedTrainerIds: string[];
  isSubmitting?: boolean;
  onClose: () => void;
  onAssign: (payload: AssignBranchTrainersPayload) => Promise<void>;
}

export function AssignBranchTrainerModal({
  open,
  branchId,
  branchOnlyAssignedTrainerIds,
  isSubmitting = false,
  onClose,
  onAssign,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [assignmentKind, setAssignmentKind] =
    useState<AssignmentKind>("COURSE_BATCH");
  const [isLoading, setIsLoading] = useState(false);

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [courseId, setCourseId] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [batchDetail, setBatchDetail] = useState<Batch | null>(null);
  const [mode, setMode] = useState<BatchMode | "">("");
  const [batchTimingId, setBatchTimingId] = useState("");

  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [contextAssignedIds, setContextAssignedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const assignedIds = useMemo(() => {
    if (assignmentKind === "BRANCH_ONLY") {
      return new Set(branchOnlyAssignedTrainerIds);
    }

    return new Set(contextAssignedIds);
  }, [assignmentKind, branchOnlyAssignedTrainerIds, contextAssignedIds]);

  const trainerById = useMemo(
    () => new Map(trainers.map((trainer) => [trainer.id, trainer])),
    [trainers],
  );

  const modes = useMemo(
    () => getUpcomingConfiguredModes(batchDetail),
    [batchDetail],
  );

  const timings = useMemo(
    () => (mode ? getUpcomingTimingsForMode(batchDetail, mode) : []),
    [batchDetail, mode],
  );

  const courseBatchReady =
    Boolean(courseId) &&
    Boolean(batchId) &&
    Boolean(mode) &&
    Boolean(batchTimingId);

  const canPickTrainers =
    assignmentKind === "BRANCH_ONLY" || courseBatchReady;

  const filteredTrainers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return trainers;
    }

    return trainers.filter((trainer) => {
      const haystack = [
        formatTrainerDisplayName(trainer),
        trainer.qualification ?? "",
        trainer.specialization ?? "",
        trainer.employeeCode ?? "",
        trainer.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, trainers]);

  const selectedTrainers = useMemo(
    () =>
      selectedIds
        .filter((id) => !assignedIds.has(id))
        .map((id) => trainerById.get(id))
        .filter((trainer): trainer is TrainerListItem => Boolean(trainer)),
    [assignedIds, selectedIds, trainerById],
  );

  const assignableSelectedCount = useMemo(
    () => selectedIds.filter((id) => !assignedIds.has(id)).length,
    [assignedIds, selectedIds],
  );

  const resetWizard = useCallback(() => {
    setAssignmentKind("COURSE_BATCH");
    setCourseId("");
    setBatchId("");
    setBatchDetail(null);
    setMode("");
    setBatchTimingId("");
    setContextAssignedIds([]);
    setSearch("");
    setSelectedIds([]);
    setValidationError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetWizard();
    setIsLoading(true);

    void (async () => {
      try {
        const [branchCourses, activeTrainers] = await Promise.all([
          loadBranchCoursesForTrainerAssign(branchId),
          trainerService.getActiveTrainersForAssignment(),
        ]);
        setCourses(branchCourses);
        setTrainers(activeTrainers);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [open, branchId, resetWizard]);

  useEffect(() => {
    if (!open || !courseId) {
      setBatches([]);
      setBatchesLoading(false);
      setBatchId("");
      setBatchDetail(null);
      setMode("");
      setBatchTimingId("");
      return;
    }

    setBatchesLoading(true);
    setBatchId("");
    setBatchDetail(null);
    setMode("");
    setBatchTimingId("");

    void loadUpcomingBranchCourseBatches(branchId, courseId)
      .then(setBatches)
      .finally(() => {
        setBatchesLoading(false);
      });
  }, [open, branchId, courseId]);

  const noUpcomingBatchesForCourse =
    Boolean(courseId) && !batchesLoading && batches.length === 0;

  useEffect(() => {
    if (!open || !batchId) {
      setBatchDetail(null);
      setMode("");
      setBatchTimingId("");
      return;
    }

    void loadBatchForTrainerAssignment(batchId).then((batch) => {
      setBatchDetail(batch);
      setMode("");
      setBatchTimingId("");
    });
  }, [open, batchId]);

  useEffect(() => {
    setBatchTimingId("");
  }, [mode]);

  useEffect(() => {
    setSelectedIds([]);
    setContextAssignedIds([]);

    if (
      assignmentKind !== "COURSE_BATCH" ||
      !courseId ||
      !batchId ||
      !mode ||
      !batchTimingId
    ) {
      return;
    }

    void branchService
      .getContextAssignedTrainerIds(branchId, {
        courseId,
        batchId,
        mode,
        batchTimingId,
      })
      .then((response) => {
        setContextAssignedIds(response.data?.trainerIds ?? []);
      });
  }, [
    assignmentKind,
    branchId,
    courseId,
    batchId,
    mode,
    batchTimingId,
  ]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => !assignedIds.has(id)));
  }, [assignedIds]);

  const toggleTrainer = (trainerId: string) => {
    if (!canPickTrainers || assignedIds.has(trainerId)) {
      return;
    }

    setSelectedIds((current) => {
      if (current.includes(trainerId)) {
        return current.filter((id) => id !== trainerId);
      }

      return Array.from(new Set([...current, trainerId]));
    });
    setValidationError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleAssign = async () => {
    const assignableIds = selectedIds.filter((id) => !assignedIds.has(id));

    if (assignableIds.length === 0) {
      setValidationError("Select at least one trainer to assign.");
      return;
    }

    if (assignmentKind === "COURSE_BATCH") {
      if (!courseBatchReady) {
        setValidationError(
          "Complete course, batch, learning mode, and batch timing selection.",
        );
        return;
      }

      setValidationError(null);
      await onAssign({
        assignmentType: "COURSE_BATCH",
        trainerIds: assignableIds,
        courseId,
        batchId,
        mode,
        batchTimingId,
      });
      return;
    }

    setValidationError(null);
    await onAssign({
      assignmentType: "BRANCH_ONLY",
      trainerIds: assignableIds,
    });
  };

  const renderTrainerPicker = () => (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#102A56]">Select Trainer</p>
        <SearchInput
          value={search}
          placeholder="Search trainers..."
          className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
          onChange={setSearch}
        />
      </div>

      <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {!canPickTrainers ? (
          <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
            {assignmentKind === "COURSE_BATCH"
              ? "Select course, batch, learning mode, and batch timing first."
              : "Loading trainers..."}
          </p>
        ) : isLoading ? (
          <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
            Loading trainers...
          </p>
        ) : filteredTrainers.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
            No active trainers match your search.
          </p>
        ) : (
          filteredTrainers.map((trainer) => {
            const isAssigned = assignedIds.has(trainer.id);
            const isSelected =
              !isAssigned && selectedIds.includes(trainer.id);
            const displayName =
              formatTrainerDisplayName(trainer) || "Unnamed trainer";

            const rowClassName = cn(
              "flex items-start gap-3 rounded-lg px-2 py-2",
              isAssigned
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "cursor-pointer hover:bg-slate-50",
            );

            const rowContent = (
              <>
                <Checkbox
                  checked={isSelected}
                  disabled={isAssigned || isSubmitting || !canPickTrainers}
                  onCheckedChange={() => toggleTrainer(trainer.id)}
                />
                {trainer.profileImageUrl ? (
                  <Image
                    src={trainer.profileImageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover",
                      isAssigned && "opacity-60",
                    )}
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {displayName.charAt(0) || "?"}
                  </div>
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      isAssigned ? "text-slate-500" : "text-[#102A56]",
                    )}
                  >
                    {displayName}
                  </span>
                  {isAssigned ? (
                    <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {ALREADY_ASSIGNED_LABEL}
                    </span>
                  ) : null}
                </span>
              </>
            );

            return isAssigned ? (
              <div key={trainer.id} aria-disabled="true" className={rowClassName}>
                {rowContent}
              </div>
            ) : (
              <label key={trainer.id} className={rowClassName}>
                {rowContent}
              </label>
            );
          })
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[#102A56]">Selected Trainers</p>
        {selectedTrainers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm text-[#647A9B]">
            No trainers selected yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTrainers.map((trainer) => {
              const displayName =
                formatTrainerDisplayName(trainer) || "Unnamed trainer";
              return (
                <span
                  key={trainer.id}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#DCE8F5] bg-[#F8FBFF] px-3 py-1 text-sm text-[#102A56]"
                >
                  <span className="truncate">{displayName}</span>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    aria-label={`Remove ${displayName}`}
                    className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                    onClick={() =>
                      setSelectedIds((current) =>
                        current.filter((id) => id !== trainer.id),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <Modal
      open={open}
      title="Assign Trainer"
      onClose={handleClose}
      contentClassName="min-w-0 max-w-2xl"
      bodyRef={bodyRef}
    >
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={assignmentKind === "COURSE_BATCH" ? "primary" : "outline"}
            disabled={isSubmitting}
            onClick={() => {
              setAssignmentKind("COURSE_BATCH");
              setSelectedIds([]);
              setValidationError(null);
            }}
          >
            Course / Batch Trainer
          </Button>
          <Button
            type="button"
            size="sm"
            variant={assignmentKind === "BRANCH_ONLY" ? "primary" : "outline"}
            disabled={isSubmitting}
            onClick={() => {
              setAssignmentKind("BRANCH_ONLY");
              setSelectedIds([]);
              setValidationError(null);
            }}
          >
            Branch-only Trainer
          </Button>
        </div>

        {assignmentKind === "COURSE_BATCH" ? (
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-medium text-[#102A56]">Course</p>
                <AppSelect
                  value={courseId || undefined}
                  placeholder="Select course"
                  disabled={isLoading || isSubmitting}
                  options={courses.map((course) => ({
                    value: course.id,
                    label: course.title,
                  }))}
                  onValueChange={setCourseId}
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-medium text-[#102A56]">Batch</p>
                {noUpcomingBatchesForCourse ? (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-[#647A9B]">
                    No upcoming batches available for this course.
                  </p>
                ) : (
                  <AppSelect
                    value={batchId || undefined}
                    placeholder={
                      !courseId
                        ? "Select a course first"
                        : batchesLoading
                          ? "Loading batches..."
                          : "Select upcoming batch"
                    }
                    disabled={
                      !courseId ||
                      isSubmitting ||
                      batchesLoading ||
                      noUpcomingBatchesForCourse
                    }
                    options={batches.map((batch) => ({
                      value: batch.id,
                      label: batch.name,
                    }))}
                    onValueChange={setBatchId}
                  />
                )}
              </div>

              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-medium text-[#102A56]">
                  Learning Mode
                </p>
                <AppSelect
                  value={mode || undefined}
                  placeholder={
                    batchId ? "Select learning mode" : "Select a batch first"
                  }
                  disabled={!batchId || isSubmitting || noUpcomingBatchesForCourse}
                  options={modes.map((item) => ({
                    value: item,
                    label: getBatchModeLabel(item),
                  }))}
                  onValueChange={(value) => setMode(value as BatchMode)}
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-medium text-[#102A56]">Batch Timing</p>
                <AppSelect
                  value={batchTimingId || undefined}
                  placeholder={
                    mode ? "Select batch timing" : "Select a learning mode first"
                  }
                  disabled={!mode || isSubmitting || noUpcomingBatchesForCourse}
                  options={timings.map((timing) => ({
                    value: timing.id,
                    label: formatTimingOptionLabel(timing),
                  }))}
                  onValueChange={setBatchTimingId}
                />
              </div>
            </div>
          </div>
        ) : null}

        {renderTrainerPicker()}

        {validationError ? (
          <p role="alert" className="text-sm text-red-500">
            {validationError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#647A9B]">
            {assignableSelectedCount} selected
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting || assignableSelectedCount === 0}
              onClick={() => {
                void handleAssign();
              }}
            >
              Assign Trainer{assignableSelectedCount === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
