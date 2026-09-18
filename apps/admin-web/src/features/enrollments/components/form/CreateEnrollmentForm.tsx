"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  Batch,
  BatchMode,
} from "@/src/features/batches/types/batch.types";
import { CreateEnrollmentModeSelection } from "@/src/features/enrollments/components/form/create-enrollment-mode-selection";
import { CreateEnrollmentSummaryPanel } from "@/src/features/enrollments/components/form/create-enrollment-summary-panel";
import { CreateEnrollmentTimingSelection } from "@/src/features/enrollments/components/form/create-enrollment-timing-selection";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import type { Course } from "@/src/features/courses/types/course.types";
import { courseService } from "@/src/features/courses/services/course.service";
import {
  findBatchTimingById,
  getCreateEnrollmentTimingPricing,
} from "@/src/features/enrollments/utils/create-enrollment-selection.utils";
import {
  ENROLLMENT_PAYMENT_METHODS,
  paymentReferenceLabel,
  requiresPaymentReference,
  todayDateInputValue,
  toApiDateTime,
  type EnrollmentPaymentMethod,
} from "@/src/features/enrollments/constants/enrollment-create.constants";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import {
  currentEnrollmentByStudentId,
  formatEnrollmentLocation,
} from "@/src/features/enrollments/utils/current-enrollment";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import { studentService } from "@/src/features/students/services/student.service";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  findBatchById,
  isBatchBlockedForSelection,
  toBatchSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";

interface Props {
  mode?: "create" | "edit";
  enrollment?: Enrollment;
  onSuccess?: (enrollmentId?: string) => void;
  onCancel?: () => void;
}

function computedPaymentStatus(paid: number, remaining: number): string {
  if (paid <= 0) {
    return "UNPAID";
  }

  if (remaining <= 0) {
    return "PAID";
  }

  return "PARTIAL";
}

function buildEnrollmentStudentOption(enrollment: Enrollment | undefined) {
  if (!enrollment?.student) {
    return null;
  }

  return {
    id: enrollment.student.id,
    label: formatPersonName(
      enrollment.student.firstName,
      enrollment.student.lastName,
    ),
    meta: [
      enrollment.student.studentCode,
      enrollment.student.phone,
      enrollment.student.email,
    ]
      .filter(Boolean)
      .join(" · "),
    enrolledElsewhere: false as const,
  };
}

function enrollmentModeToBatchMode(
  mode: string | null | undefined,
): BatchMode | "" {
  if (mode === "SELF_PACED" || mode === "RECORDED") {
    return "RECORDED";
  }
  if (mode === "ONLINE" || mode === "OFFLINE") {
    return mode;
  }
  return "";
}

function formatApplicationTypeLabel(
  applicationType: string | null | undefined,
): string {
  if (applicationType === "ONLINE") {
    return "Online";
  }
  if (applicationType === "OFFLINE") {
    return "Offline";
  }
  return applicationType ?? "—";
}

function formatEnrollmentModeLabel(
  mode: string | null | undefined,
): string {
  if (mode === "SELF_PACED") {
    return "Self-Paced";
  }
  if (mode === "ONLINE") {
    return "Online";
  }
  if (mode === "OFFLINE") {
    return "Offline";
  }
  return mode ?? "—";
}

function resolveEnrollmentBranchId(
  enrollment: Enrollment | undefined,
): string {
  return enrollment?.branchId ?? enrollment?.branch?.id ?? "";
}

function resolveEnrollmentBatchId(
  enrollment: Enrollment | undefined,
): string {
  return enrollment?.batchId ?? enrollment?.batch?.id ?? "";
}

function resolveEnrollmentStudentId(
  enrollment: Enrollment | undefined,
): string {
  return enrollment?.studentId ?? enrollment?.student?.id ?? "";
}

function resolveEnrollmentTimingId(
  enrollment: Enrollment | undefined,
): string {
  return enrollment?.batchTimingId ?? enrollment?.batchTiming?.id ?? "";
}

export function CreateEnrollmentForm({
  mode = "create",
  enrollment,
  onSuccess,
  onCancel,
}: Props) {
  const isEdit = mode === "edit";

  const [branches, setBranches] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [branchId, setBranchId] = useState(
    () => resolveEnrollmentBranchId(enrollment),
  );
  const [batches, setBatches] = useState<Batch[]>([]);
  const [admissionDate, setAdmissionDate] = useState(
    enrollment?.admissionDate
      ? enrollment.admissionDate.slice(0, 10)
      : todayDateInputValue(),
  );
  const [paymentDate, setPaymentDate] = useState(todayDateInputValue());
  const [batchId, setBatchId] = useState(
    () => resolveEnrollmentBatchId(enrollment),
  );
  const [selectedMode, setSelectedMode] = useState<BatchMode | "">(
    () =>
      enrollmentModeToBatchMode(enrollment?.mode) ||
      enrollmentModeToBatchMode(enrollment?.batchTiming?.mode) ||
      "",
  );
  const [batchTimingId, setBatchTimingId] = useState(
    () => resolveEnrollmentTimingId(enrollment),
  );
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [categoryName, setCategoryName] = useState(
    enrollment?.category?.name ?? "—",
  );
  const [feeAmount, setFeeAmount] = useState(
    () => normalizeMoney(enrollment?.feeAmount),
  );
  const [discountAmount, setDiscountAmount] = useState(
    () => normalizeMoney(enrollment?.discountAmount),
  );

  const [students, setStudents] = useState<
    Array<{
      id: string;
      label: string;
      meta?: string;
      enrolledElsewhere?: boolean;
    }>
  >(() => {
    const enrolledStudent = buildEnrollmentStudentOption(enrollment);
    return enrolledStudent ? [enrolledStudent] : [];
  });
  const [studentId, setStudentId] = useState(
    () => resolveEnrollmentStudentId(enrollment),
  );

  const [amountPaidNow, setAmountPaidNow] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<EnrollmentPaymentMethod>("CASH");
  const [transactionId, setTransactionId] = useState("");

  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = Math.max(0, feeAmount - discountAmount);
  const paidNowValue = normalizeMoney(amountPaidNow);
  const existingPaidAmount = isEdit
    ? normalizeMoney(enrollment?.paidAmount)
    : 0;
  const totalPaidAmount = existingPaidAmount + paidNowValue;
  const remainingAmount = Math.max(0, finalAmount - totalPaidAmount);
  const paymentStatus =
    isEdit && paidNowValue === 0 && enrollment?.paymentStatus
      ? enrollment.paymentStatus
      : computedPaymentStatus(totalPaidAmount, remainingAmount);

  const selectedTiming = useMemo(
    () => findBatchTimingById(selectedBatch, batchTimingId),
    [batchTimingId, selectedBatch],
  );

  const courseTitle = course?.title ?? enrollment?.course?.title ?? "—";
  const selectionComplete = Boolean(
    batchId && selectedMode && batchTimingId && selectedTiming,
  );

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const response = await branchService.getBranches({
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        });
        setBranches(
          (response.data.items ?? []).map((branch) => ({
            id: branch.id,
            label: branch.branchCode
              ? `${branch.branchName} (${branch.branchCode})`
              : branch.branchName,
          })),
        );
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setBranches([]);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    void loadBranches();
  }, []);

  useEffect(() => {
    if (!branchId) {
      setBatches([]);
      if (!isEdit) {
        setBatchId("");
        setSelectedMode("");
        setBatchTimingId("");
        setSelectedBatch(null);
        setCourse(null);
        setStudents([]);
        setStudentId("");
      }
      return;
    }

    const loadBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const response = await batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        });
        const nextBatches = (response.data.items ?? []).filter((batch) => {
          if (batch.branchId && batch.branchId !== branchId) {
            return false;
          }
          return true;
        });
        setBatches(nextBatches);

        const savedBatchId = resolveEnrollmentBatchId(enrollment);
        // Edit mode: never wipe the saved batch/timing just because the batch
        // is missing from the selectable list or marked blocked for new enrollments.
        if (isEdit && savedBatchId && savedBatchId === batchId) {
          return;
        }

        if (
          batchId &&
          (() => {
            const current = findBatchById(nextBatches, batchId);
            return current ? isBatchBlockedForSelection(current) : true;
          })()
        ) {
          setBatchId("");
          setSelectedBatch(null);
          setCourse(null);
          setSelectedMode("");
          setBatchTimingId("");
          if (!isEdit) {
            setStudents([]);
            setStudentId("");
          }
        } else if (!nextBatches.some((batch) => batch.id === batchId)) {
          setBatchId("");
          setSelectedBatch(null);
          setCourse(null);
          setSelectedMode("");
          setBatchTimingId("");
          if (!isEdit) {
            setStudents([]);
            setStudentId("");
          }
        }
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    void loadBatches();
    // batchId is read to keep the current selection when possible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, enrollment?.batch?.id, enrollment?.batchId, isEdit]);

  useEffect(() => {
    if (!branchId || !batchId) {
      setSelectedBatch(null);
      if (!isEdit) {
        setSelectedMode("");
        setBatchTimingId("");
        setCourse(null);
        setStudents([]);
        setStudentId("");
      }
      return;
    }

    const loadBatchContext = async () => {
      setIsLoadingContext(true);
      try {
        const batchResponse = await batchService.getBatch(batchId);
        const batch = batchResponse.data;
        setSelectedBatch(batch);

        let nextFee = normalizeMoney(enrollment?.feeAmount);
        let nextDiscount = normalizeMoney(enrollment?.discountAmount);
        let nextCategory = categoryName;
        let nextCourse: Course | null = null;

        const savedBatchId = resolveEnrollmentBatchId(enrollment);
        const savedTimingId = resolveEnrollmentTimingId(enrollment);
        const savedMode =
          enrollmentModeToBatchMode(enrollment?.mode) ||
          enrollmentModeToBatchMode(enrollment?.batchTiming?.mode) ||
          "";

        let nextMode: BatchMode | "" = selectedMode;
        let nextTimingId = batchTimingId;

        if (isEdit && enrollment && savedBatchId === batchId) {
          // Enrollment payload is the source of truth for edit prefill.
          nextTimingId = savedTimingId || nextTimingId;
          const savedTiming = nextTimingId
            ? findBatchTimingById(batch, nextTimingId)
            : undefined;

          if (savedTiming) {
            nextMode = savedTiming.mode;
            nextTimingId = savedTiming.id;
          } else {
            nextMode = savedMode || nextMode;
          }
        } else if (isEdit && enrollment?.mode) {
          nextMode =
            enrollmentModeToBatchMode(enrollment.mode) || nextMode;
        }

        if (nextTimingId) {
          const timingPricing = getCreateEnrollmentTimingPricing(
            batch,
            nextTimingId,
          );
          if (timingPricing) {
            nextFee = timingPricing.originalPrice;
            nextDiscount = timingPricing.discountAmount;
          }
        } else if (isEdit && enrollment) {
          nextFee = normalizeMoney(enrollment.feeAmount);
          nextDiscount = normalizeMoney(enrollment.discountAmount);
        }

        const courseId =
          batch.courseId ??
          enrollment?.courseId ??
          enrollment?.course?.id;
        if (courseId) {
          const courseResponse = await courseService.getCourse(courseId);
          nextCourse = courseResponse.data;
          nextCategory = nextCourse.category?.name ?? "—";
        } else if (enrollment?.category?.name) {
          nextCategory = enrollment.category.name;
        }

        setSelectedMode(nextMode);
        setBatchTimingId(nextTimingId);
        setCourse(nextCourse);
        setFeeAmount(nextFee);
        setDiscountAmount(nextDiscount);
        setCategoryName(nextCategory);
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setSelectedBatch(null);
        setCourse(null);
      } finally {
        setIsLoadingContext(false);
      }
    };

    void loadBatchContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, batchId, enrollment?.batch?.id, enrollment?.batchId, enrollment?.batchTimingId, enrollment?.id, isEdit]);

  useEffect(() => {
    if (!selectedBatch || !batchTimingId) {
      return;
    }

    const pricing = getCreateEnrollmentTimingPricing(
      selectedBatch,
      batchTimingId,
    );
    if (!pricing) {
      return;
    }

    setFeeAmount(pricing.originalPrice);
    setDiscountAmount(pricing.discountAmount);
  }, [batchTimingId, selectedBatch]);

  useEffect(() => {
    if (!branchId || !batchId || !batchTimingId) {
      if (!isEdit) {
        setStudents([]);
        setStudentId("");
      }
      return;
    }

    const loadStudents = async () => {
      setIsLoadingContext(true);
      try {
        const [currentEnrollmentResponse, studentResponse] = await Promise.all([
          enrollmentService.getEnrollments({
            currentOnly: true,
            skip: 0,
            take: 100,
          }),
          studentService.getStudents({
            includeDeleted: false,
            onlyActive: true,
            page: 1,
            pageSize: 100,
          }),
        ]);

        const currentByStudent = currentEnrollmentByStudentId(
          parseEnrollmentListResponse(currentEnrollmentResponse).items,
        );

        const studentPayload = parseStudentListResponse(studentResponse.data);
        const mappedStudents = studentPayload.items
          .filter((item) => {
            const isCurrent = item.id === resolveEnrollmentStudentId(enrollment);
            if (isCurrent) {
              return !isArchivedStudent(item);
            }

            return item.isActive && !isArchivedStudent(item);
          })
          .map((item) => {
            const current = currentByStudent.get(item.id);
            const enrolledElsewhere =
              Boolean(current) &&
              current?.id !== enrollment?.id &&
              current?.batch?.id !== batchId;
            const enrolledHere =
              Boolean(current) &&
              current?.id !== enrollment?.id &&
              current?.batch?.id === batchId;
            const location = current
              ? formatEnrollmentLocation(current)
              : "";

            return {
              id: item.id,
              label: formatPersonName(item.firstName, item.lastName),
              meta: enrolledElsewhere
                ? `Already enrolled · ${location}`
                : enrolledHere
                  ? `Already enrolled in this batch · ${location}`
                  : [item.studentCode, item.phone, item.email]
                      .filter(Boolean)
                      .join(" · "),
              enrolledElsewhere: enrolledElsewhere || enrolledHere,
            };
          });

        if (
          enrollment?.student &&
          !mappedStudents.some((item) => item.id === enrollment.student.id)
        ) {
          const enrolledStudent = buildEnrollmentStudentOption(enrollment);
          if (enrolledStudent) {
            mappedStudents.unshift(enrolledStudent);
          }
        }

        setStudents(mappedStudents);

        if (isEdit && enrollment?.student?.id) {
          setStudentId(enrollment.student.id);
        }
      } catch (error) {
        appToast.error(getErrorMessage(error));
        const enrolledStudent = buildEnrollmentStudentOption(enrollment);
        setStudents(enrolledStudent ? [enrolledStudent] : []);
        if (isEdit && enrollment?.student?.id) {
          setStudentId(enrollment.student.id);
        }
      } finally {
        setIsLoadingContext(false);
      }
    };

    void loadStudents();
  }, [
    batchId,
    batchTimingId,
    branchId,
    enrollment?.id,
    enrollment?.student,
    isEdit,
  ]);

  const branchOptions = useMemo(
    () => uniqueSelectOptions(branches.map((b) => ({ label: b.label, value: b.id }))),
    [branches],
  );

  const batchOptions = useMemo(() => {
    const options = toBatchSelectOptions(batches);
    if (
      isEdit &&
      enrollment?.batch?.id &&
      !options.some((option) => option.value === enrollment.batch.id)
    ) {
      options.unshift({
        label: enrollment.batch.name,
        value: enrollment.batch.id,
      });
    }
    return options;
  }, [batches, enrollment?.batch?.id, enrollment?.batch?.name, isEdit]);

  const studentOptions = useMemo(
    () =>
      uniqueSelectOptions(
        students.map((student) => ({
          label: student.meta
            ? `${student.label} — ${student.meta}`
            : student.label,
          value: student.id,
          disabled: student.enrolledElsewhere,
        })),
      ),
    [students],
  );

  const selectedStudentEnrollment = students.find(
    (student) => student.id === studentId,
  );

  const handleSubmit = async () => {
    if (!branchId || !batchId || !studentId) {
      appToast.error("Select branch, batch, and student.");
      return;
    }

    if (!selectedMode || !batchTimingId) {
      appToast.error("Select batch mode and batch timing.");
      return;
    }

    const selectedBatchRecord = findBatchById(batches, batchId) ?? selectedBatch;
    if (
      !selectedBatchRecord ||
      (!isEdit && isBatchBlockedForSelection(selectedBatchRecord))
    ) {
      appToast.error(BLOCKED_BATCH_SELECTION_MESSAGE);
      return;
    }

    if (!isEdit && selectedStudentEnrollment?.enrolledElsewhere) {
      appToast.error(
        selectedStudentEnrollment.meta
          ? `Student is already actively enrolled. ${selectedStudentEnrollment.meta}`
          : "Student is already actively enrolled. A student can have only one active enrollment at a time.",
      );
      return;
    }

    if (!isEdit && paidNowValue > finalAmount) {
      appToast.error("Amount paying now cannot exceed total course fee.");
      return;
    }

    if (isEdit && existingPaidAmount > finalAmount) {
      appToast.error(
        "The selected batch fee is lower than the amount already paid. Choose a batch whose fee covers existing payments.",
      );
      return;
    }

    if (
      !isEdit &&
      paidNowValue > 0 &&
      requiresPaymentReference(paymentMethod) &&
      !transactionId.trim()
    ) {
      appToast.error("Payment reference is required for the selected method.");
      return;
    }

    if (isEdit && paidNowValue > 0 && totalPaidAmount > finalAmount) {
      appToast.error("Amount paying now cannot exceed the remaining course fee.");
      return;
    }

    const apiAdmissionDate = toApiDateTime(admissionDate);

    if (!apiAdmissionDate) {
      appToast.error("Enter a valid enrollment date.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && enrollment) {
        await enrollmentService.updateEnrollment(enrollment.id, {
          studentId,
          batchId,
          batchTimingId,
          admissionDate: apiAdmissionDate,
          feeAmount,
          discountAmount,
        });
        appToast.success("Enrollment updated successfully");
      } else {
        await enrollmentService.createEnrollment({
          studentId,
          batchId,
          batchTimingId,
          branchId,
          feeAmount,
          discountAmount,
          admissionDate: apiAdmissionDate,
          ...(paidNowValue > 0
            ? {
                initialPaymentAmount: paidNowValue,
                paymentMethod,
                transactionId: transactionId.trim() || undefined,
                initialPaymentPaidAt: toApiDateTime(paymentDate),
              }
            : {}),
        });
        appToast.success("Enrollment created successfully");
      }

      onSuccess?.(isEdit && enrollment ? enrollment.id : undefined);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {isEdit ? (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Application Type
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatApplicationTypeLabel(enrollment?.applicationType)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Origin is historical and cannot be changed here.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Mode
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatEnrollmentModeLabel(enrollment?.mode) ||
                formatEnrollmentModeLabel(selectedMode)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {enrollment?.status?.replaceAll("_", " ") ?? "—"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Enrollment Date
          </label>
          <Input
            type="date"
            value={admissionDate}
            onChange={(event) => setAdmissionDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Select Branch
          </label>
          {isLoadingBranches ? (
            <p className="text-sm text-[#647A9B]">Loading branches...</p>
          ) : (
            <AppSelect
              value={branchId || undefined}
              placeholder="Select branch"
              options={branchOptions}
              onValueChange={(value) => {
                setBranchId(value);
                setBatchId("");
                setSelectedMode("");
                setBatchTimingId("");
                setStudentId("");
              }}
            />
          )}
        </div>
      </div>

      {branchId ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Select Batch</p>
          {isLoadingBatches ? (
            <p className="text-sm text-[#647A9B]">Loading batches...</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-[#647A9B]">No data yet</p>
          ) : (
            <AppSelect
              value={batchId || undefined}
              placeholder="Select a batch"
              options={batchOptions}
              onValueChange={(value) => {
                setBatchId(value);
                setSelectedMode("");
                setBatchTimingId("");
                setStudentId("");
              }}
            />
          )}
        </div>
      ) : null}

      {batchId && selectedBatch && !isLoadingContext ? (
        <CreateEnrollmentModeSelection
          batch={selectedBatch}
          selectedMode={selectedMode}
          onSelectMode={(mode) => {
            setSelectedMode(mode);
            const savedTimingId = resolveEnrollmentTimingId(enrollment);
            const savedTiming =
              isEdit && selectedBatch && savedTimingId
                ? findBatchTimingById(selectedBatch, savedTimingId)
                : undefined;
            if (savedTiming && savedTiming.mode === mode) {
              setBatchTimingId(savedTiming.id);
            } else {
              setBatchTimingId("");
            }
            if (!isEdit) {
              setStudentId("");
            }
          }}
        />
      ) : null}

      {batchId && selectedBatch && selectedMode && !isLoadingContext ? (
        <CreateEnrollmentTimingSelection
          batch={selectedBatch}
          mode={selectedMode}
          selectedTimingId={batchTimingId}
          reservedTimingId={
            isEdit ? resolveEnrollmentTimingId(enrollment) || undefined : undefined
          }
          onSelectTiming={(timingId) => {
            setBatchTimingId(timingId);
            if (!isEdit) {
              setStudentId("");
            }
          }}
        />
      ) : null}

      {selectionComplete && selectedBatch && selectedMode && selectedTiming ? (
        <CreateEnrollmentSummaryPanel
          batch={selectedBatch}
          mode={selectedMode}
          timing={selectedTiming}
          courseTitle={courseTitle}
          feeAmount={feeAmount}
          discountAmount={discountAmount}
          finalAmount={finalAmount}
        />
      ) : null}

      {selectionComplete || (isEdit && Boolean(studentId)) ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Select Student</p>
          {isLoadingContext &&
          !(isEdit && studentId && students.some((s) => s.id === studentId)) ? (
            <p className="text-sm text-[#647A9B]">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-[#647A9B]">No data yet</p>
          ) : (
            <AppSelect
              value={studentId || undefined}
              placeholder="Select active student"
              options={studentOptions}
              onValueChange={setStudentId}
            />
          )}
          {!isEdit && selectedStudentEnrollment?.enrolledElsewhere ? (
            <p className="text-sm text-amber-700">
              Student is already actively enrolled in{" "}
              {selectedStudentEnrollment.meta}. A student can have only one
              active enrollment at a time. Unenroll/cancel the current
              enrollment before creating another.
            </p>
          ) : null}
        </div>
      ) : null}

      {(selectionComplete &&
        studentId &&
        !selectedStudentEnrollment?.enrolledElsewhere) ||
      (isEdit && Boolean(studentId)) ? (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-[#102A56]">Payment</h3>

          {isEdit ? (
            <div className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Payment Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {enrollment?.paymentStatus ?? paymentStatus}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Amount Paid</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatCurrency(existingPaidAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Method</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {enrollment?.payments?.[0]?.paymentMethod ??
                    enrollment?.payments?.[0]?.gateway ??
                    "—"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-slate-500">Total Course Fee</p>
              <Input readOnly value={formatCurrency(finalAmount)} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Amount Paying Now</p>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={amountPaidNow}
                placeholder="0.00"
                onChange={(event) => setAmountPaidNow(event.target.value)}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Remaining Amount</p>
              <Input readOnly value={formatCurrency(remainingAmount)} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Payment Status</p>
              <Input readOnly value={paymentStatus} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Payment Method</p>
              <AppSelect
                value={paymentMethod}
                options={ENROLLMENT_PAYMENT_METHODS.map((item) => ({
                  label: item.label,
                  value: item.value,
                }))}
                onValueChange={(value) =>
                  setPaymentMethod(value as EnrollmentPaymentMethod)
                }
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Payment Date</p>
              <Input
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
              />
            </div>
          </div>

          {paidNowValue > 0 && requiresPaymentReference(paymentMethod) ? (
            <div>
              <p className="mb-1 text-xs text-slate-500">
                {paymentReferenceLabel(paymentMethod)}
              </p>
              <Input
                value={transactionId}
                placeholder="Enter reference"
                onChange={(event) => setTransactionId(event.target.value)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          loading={isSubmitting}
          disabled={
            isSubmitting ||
            !branchId ||
            !batchId ||
            !studentId ||
            !batchTimingId ||
            !selectedMode ||
            isLoadingContext ||
            Boolean(!isEdit && selectedStudentEnrollment?.enrolledElsewhere)
          }
          onClick={() => {
            void handleSubmit();
          }}
        >
          {isEdit ? "Save Changes" : "Create Enrollment"}
        </Button>
      </div>
    </div>
  );
}
