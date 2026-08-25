"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { BranchBatchAssignDetails } from "@/src/features/branches/components/manage/branch-batch-assign-details";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { courseService } from "@/src/features/courses/services/course.service";
import { getCourseDefaultDiscount } from "@/src/features/courses/utils/get-course-default-discount.util";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";
import { studentService } from "@/src/features/students/services/student.service";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

interface Props {
  open: boolean;
  branchId: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function isSelectableBatch(batch: Batch): boolean {
  return (
    batch.isActive !== false &&
    !batch.deletedAt &&
    batch.isDeleted !== true &&
    batch.status !== "COMPLETED" &&
    batch.status !== "CANCELLED" &&
    batch.status !== "ARCHIVED"
  );
}

export function BranchAssignStudentModal({
  open,
  branchId,
  onClose,
  onSuccess,
}: Props) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [courseTitles, setCourseTitles] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("—");
  const [feeAmount, setFeeAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<Set<string>>(
    new Set(),
  );

  const [students, setStudents] = useState<
    Array<{ id: string; label: string; meta?: string }>
  >([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingBatchDetails, setIsLoadingBatchDetails] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = useCallback(() => {
    setBatchId("");
    setSelectedBatch(null);
    setCourseTitles([]);
    setCategoryName("—");
    setFeeAmount(0);
    setDiscountAmount(0);
    setEnrolledStudentIds(new Set());
    setStudents([]);
    setSelectedStudentIds([]);
    setStudentSearch("");
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    const loadBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const response = await batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 200,
        });
        setBatches((response.data.items ?? []).filter(isSelectableBatch));
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    void loadBatches();
  }, [open, branchId, resetState]);

  useEffect(() => {
    if (!open || !batchId) {
      setSelectedBatch(null);
      setCourseTitles([]);
      setCategoryName("—");
      setStudents([]);
      setSelectedStudentIds([]);
      return;
    }

    const loadBatchContext = async () => {
      setIsLoadingBatchDetails(true);
      setIsLoadingStudents(true);
      try {
        const [batchResponse, assignments, enrollmentResponse, studentResponse] =
          await Promise.all([
            batchService.getBatch(batchId),
            batchService.getBatchCourses(batchId),
            enrollmentService.getEnrollments({
              branchId,
              batchId,
              skip: 0,
              take: 500,
            }),
            studentService.getStudents({
              includeDeleted: false,
              page: 1,
              pageSize: 200,
            }),
          ]);

        const batch = batchResponse.data;
        setSelectedBatch(batch);

        const titles = assignments
          .map((item) => item.course?.title?.trim())
          .filter((title): title is string => Boolean(title));

        if (titles.length === 0 && batch.course?.title) {
          titles.push(batch.course.title);
        }
        setCourseTitles(titles);

        let nextFee = 0;
        let nextDiscount = 0;
        let nextCategory = "—";

        const courseId = batch.courseId ?? assignments[0]?.courseId;
        if (courseId) {
          const courseResponse = await courseService.getCourse(courseId);
          const course = courseResponse.data;
          nextFee = normalizeMoney(course.pricing?.originalPrice);
          nextDiscount = getCourseDefaultDiscount(course);
          nextCategory =
            course.category?.name ?? course.categoryName ?? "—";
        } else if (assignments[0]?.course?.category?.name) {
          nextCategory = assignments[0].course.category.name;
        }

        setFeeAmount(nextFee);
        setDiscountAmount(nextDiscount);
        setCategoryName(nextCategory);

        const enrolledIds = new Set<string>();
        const enrollmentPayload = parseEnrollmentListResponse(enrollmentResponse);
        for (const enrollment of enrollmentPayload.items) {
          if (!enrollment.isDeleted && enrollment.student?.id) {
            enrolledIds.add(enrollment.student.id);
          }
        }
        setEnrolledStudentIds(enrolledIds);

        const studentPayload = parseStudentListResponse(studentResponse.data);
        setStudents(
          studentPayload.items
            .filter(
              (item) =>
                item.isActive &&
                !isArchivedStudent(item) &&
                !enrolledIds.has(item.id),
            )
            .map((item) => ({
              id: item.id,
              label: formatPersonName(item.firstName, item.lastName),
              meta: item.studentCode ?? item.email ?? undefined,
            })),
        );
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setSelectedBatch(null);
        setStudents([]);
      } finally {
        setIsLoadingBatchDetails(false);
        setIsLoadingStudents(false);
      }
    };

    void loadBatchContext();
  }, [open, batchId, branchId]);

  const batchOptions = useMemo(
    () =>
      uniqueSelectOptions(
        batches.map((batch) => ({
          label: batch.code ? `${batch.name} (${batch.code})` : batch.name,
          value: batch.id,
        })),
      ),
    [batches],
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter(
      (student) =>
        student.label.toLowerCase().includes(query) ||
        (student.meta ?? "").toLowerCase().includes(query),
    );
  }, [students, studentSearch]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const handleSubmit = async () => {
    if (!batchId || selectedStudentIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      for (const studentId of selectedStudentIds) {
        await enrollmentService.createEnrollment({
          studentId,
          batchId,
          feeAmount,
          discountAmount,
        });
      }

      appToast.success(
        selectedStudentIds.length === 1
          ? "Student enrolled successfully"
          : `${selectedStudentIds.length} students enrolled successfully`,
      );
      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Assign Student"
      onClose={() => {
        if (isSubmitting) {
          return;
        }
        onClose();
      }}
      contentClassName="flex max-h-[min(90vh,760px)] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Step 1: Select Batch
          </p>
          {isLoadingBatches ? (
            <p className="text-sm text-slate-500">Loading batches...</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-slate-500">
              No active batches available for this branch.
            </p>
          ) : (
            <AppSelect
              value={batchId || undefined}
              placeholder="Select a batch"
              options={batchOptions}
              onValueChange={(value) => {
                setBatchId(value);
                setSelectedStudentIds([]);
                setStudentSearch("");
              }}
            />
          )}
        </div>

        {batchId && selectedBatch ? (
          <BranchBatchAssignDetails
            batch={selectedBatch}
            courseTitles={courseTitles}
            categoryName={categoryName}
            isLoading={isLoadingBatchDetails}
          />
        ) : null}

        {batchId ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Step 2: Select Student(s)
            </p>
            <SearchInput
              value={studentSearch}
              placeholder="Search active students..."
              onChange={setStudentSearch}
            />
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-2">
              {isLoadingStudents ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">
                  Loading students...
                </p>
              ) : filteredStudents.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">
                  {enrolledStudentIds.size > 0 && students.length === 0
                    ? "All active students are already enrolled in this batch."
                    : "No active students available to assign."}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredStudents.map((student) => {
                    const checked = selectedStudentIds.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900">
                            {student.label}
                          </span>
                          {student.meta ? (
                            <span className="block text-xs text-slate-500">
                              {student.meta}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-500">
          {selectedStudentIds.length} student
          {selectedStudentIds.length === 1 ? "" : "s"} selected
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              !batchId ||
              selectedStudentIds.length === 0 ||
              isLoadingBatchDetails
            }
            onClick={() => {
              void handleSubmit();
            }}
          >
            Enroll Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
}
