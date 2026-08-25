"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { BranchBatchAssignDetails } from "@/src/features/branches/components/manage/branch-batch-assign-details";
import { BranchEnrollmentCourseDetails } from "@/src/features/branches/components/manage/branch-enrollment-course-details";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import type { Course } from "@/src/features/courses/types/course.types";
import { courseService } from "@/src/features/courses/services/course.service";
import { getCourseDefaultDiscount } from "@/src/features/courses/utils/get-course-default-discount.util";
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
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import { studentService } from "@/src/features/students/services/student.service";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

interface Props {
  mode?: "create" | "edit";
  enrollment?: Enrollment;
  onSuccess?: () => void;
  onCancel?: () => void;
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

function computedPaymentStatus(paid: number, remaining: number): string {
  if (paid <= 0) {
    return "UNPAID";
  }

  if (remaining <= 0) {
    return "PAID";
  }

  return "PARTIAL";
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
  const [branchId, setBranchId] = useState(enrollment?.branch?.id ?? "");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [admissionDate, setAdmissionDate] = useState(
    enrollment?.admissionDate
      ? enrollment.admissionDate.slice(0, 10)
      : todayDateInputValue(),
  );
  const [paymentDate, setPaymentDate] = useState(todayDateInputValue());
  const [batchId, setBatchId] = useState(enrollment?.batch?.id ?? "");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseTitles, setCourseTitles] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState(
    enrollment?.category?.name ?? "—",
  );
  const [feeAmount, setFeeAmount] = useState(
    normalizeMoney(enrollment?.feeAmount),
  );
  const [discountAmount, setDiscountAmount] = useState(
    normalizeMoney(enrollment?.discountAmount),
  );

  const [students, setStudents] = useState<
    Array<{ id: string; label: string; meta?: string }>
  >([]);
  const [studentId, setStudentId] = useState(enrollment?.student?.id ?? "");

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
  const remainingAmount = Math.max(0, finalAmount - paidNowValue);
  const paymentStatus = computedPaymentStatus(paidNowValue, remainingAmount);

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
      setBatchId("");
      setSelectedBatch(null);
      setCourse(null);
      setStudents([]);
      setStudentId("");
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
        const nextBatches = (response.data.items ?? []).filter((batch) => {
          if (batch.branchId && batch.branchId !== branchId) {
            return false;
          }
          if (isEdit && enrollment?.batch?.id === batch.id) {
            return true;
          }
          return isSelectableBatch(batch);
        });
        setBatches(nextBatches);

        if (!nextBatches.some((batch) => batch.id === batchId)) {
          setBatchId("");
          setSelectedBatch(null);
          setCourse(null);
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
  }, [branchId, enrollment?.batch?.id, isEdit]);

  useEffect(() => {
    if (!branchId || !batchId) {
      setSelectedBatch(null);
      setCourse(null);
      setCourseTitles([]);
      if (!isEdit) {
        setStudents([]);
        setStudentId("");
      }
      return;
    }

    const loadBatchContext = async () => {
      setIsLoadingContext(true);
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
              onlyActive: true,
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

        let nextFee = feeAmount;
        let nextDiscount = discountAmount;
        let nextCategory = categoryName;
        let nextCourse: Course | null = null;

        const courseId = batch.courseId ?? assignments[0]?.courseId;
        if (courseId) {
          const courseResponse = await courseService.getCourse(courseId);
          nextCourse = courseResponse.data;
          if (!isEdit || enrollment?.batch?.id !== batchId) {
            nextFee = normalizeMoney(nextCourse.pricing?.originalPrice);
            nextDiscount = getCourseDefaultDiscount(nextCourse);
          }
          nextCategory = nextCourse.category?.name ?? "—";
        } else if (assignments[0]?.course?.category?.name) {
          nextCategory = assignments[0].course.category.name;
        }

        setCourse(nextCourse);
        setFeeAmount(nextFee);
        setDiscountAmount(nextDiscount);
        setCategoryName(nextCategory);

        const enrolledIds = new Set<string>();
        const enrollmentPayload = parseEnrollmentListResponse(enrollmentResponse);
        for (const item of enrollmentPayload.items) {
          if (
            !item.isDeleted &&
            item.student?.id &&
            item.id !== enrollment?.id
          ) {
            enrolledIds.add(item.student.id);
          }
        }

        const studentPayload = parseStudentListResponse(studentResponse.data);
        const mappedStudents = studentPayload.items
          .filter((item) => {
            const isCurrent = item.id === enrollment?.student?.id;
            if (isCurrent) {
              return !isArchivedStudent(item);
            }

            return (
              item.isActive &&
              !isArchivedStudent(item) &&
              !enrolledIds.has(item.id)
            );
          })
          .map((item) => ({
            id: item.id,
            label: formatPersonName(item.firstName, item.lastName),
            meta: [item.studentCode, item.phone, item.email]
              .filter(Boolean)
              .join(" · "),
          }));

        if (
          enrollment?.student &&
          !mappedStudents.some((item) => item.id === enrollment.student.id)
        ) {
          mappedStudents.unshift({
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
          });
        }

        setStudents(mappedStudents);
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setSelectedBatch(null);
        setCourse(null);
        setStudents([]);
      } finally {
        setIsLoadingContext(false);
      }
    };

    void loadBatchContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, batchId, enrollment?.id, enrollment?.student?.id, isEdit]);

  const branchOptions = useMemo(
    () => uniqueSelectOptions(branches.map((b) => ({ label: b.label, value: b.id }))),
    [branches],
  );

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

  const studentOptions = useMemo(
    () =>
      uniqueSelectOptions(
        students.map((student) => ({
          label: student.meta
            ? `${student.label} — ${student.meta}`
            : student.label,
          value: student.id,
        })),
      ),
    [students],
  );

  const existingPaidAmount = isEdit
    ? normalizeMoney(enrollment?.paidAmount)
    : paidNowValue;
  const existingRemainingAmount = Math.max(0, finalAmount - existingPaidAmount);
  const existingPaymentStatus = computedPaymentStatus(
    existingPaidAmount,
    existingRemainingAmount,
  );

  const handleSubmit = async () => {
    if (!branchId || !batchId || !studentId) {
      appToast.error("Select branch, batch, and student.");
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
          admissionDate: apiAdmissionDate,
          feeAmount,
          discountAmount,
        });
        appToast.success("Enrollment updated successfully");
      } else {
        await enrollmentService.createEnrollment({
          studentId,
          batchId,
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

      onSuccess?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
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
            <p className="text-sm text-slate-500">Loading branches...</p>
          ) : (
            <AppSelect
              value={branchId || undefined}
              placeholder="Select branch"
              options={branchOptions}
              onValueChange={(value) => {
                setBranchId(value);
                setBatchId("");
                setStudentId(isEdit ? studentId : "");
              }}
            />
          )}
        </div>
      </div>

      {branchId ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Select Batch</p>
          {isLoadingBatches ? (
            <p className="text-sm text-slate-500">Loading batches...</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet</p>
          ) : (
            <AppSelect
              value={batchId || undefined}
              placeholder="Select a batch"
              options={batchOptions}
              onValueChange={(value) => {
                setBatchId(value);
                if (!isEdit) {
                  setStudentId("");
                }
              }}
            />
          )}
        </div>
      ) : null}

      {batchId && selectedBatch ? (
        <BranchBatchAssignDetails
          batch={selectedBatch}
          courseTitles={courseTitles}
          categoryName={categoryName}
          isLoading={isLoadingContext}
        />
      ) : null}

      {batchId ? (
        <BranchEnrollmentCourseDetails
          course={course}
          categoryName={categoryName}
          isLoading={isLoadingContext}
        />
      ) : null}

      {batchId ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Select Student</p>
          {isLoadingContext ? (
            <p className="text-sm text-slate-500">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet</p>
          ) : (
            <AppSelect
              value={studentId || undefined}
              placeholder="Select active student"
              options={studentOptions}
              onValueChange={setStudentId}
            />
          )}
        </div>
      ) : null}

      {!isEdit && batchId && studentId ? (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Payment</h3>

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

      {isEdit && batchId && studentId ? (
        <div className="space-y-4 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Payment</h3>
          <p className="text-xs text-slate-500">
            Existing payments are historical records and are not changed when
            you update branch, batch, or student.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-slate-500">Total Fee</p>
              <Input readOnly value={formatCurrency(finalAmount)} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Amount Paid</p>
              <Input readOnly value={formatCurrency(existingPaidAmount)} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Remaining Amount</p>
              <Input
                readOnly
                value={formatCurrency(existingRemainingAmount)}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Payment Status</p>
              <Input
                readOnly
                value={enrollment?.paymentStatus ?? existingPaymentStatus}
              />
            </div>
          </div>
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
            isLoadingContext
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
