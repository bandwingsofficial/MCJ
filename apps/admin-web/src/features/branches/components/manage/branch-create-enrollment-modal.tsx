"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { BranchBatchAssignDetails } from "@/src/features/branches/components/manage/branch-batch-assign-details";
import { BranchEnrollmentCourseDetails } from "@/src/features/branches/components/manage/branch-enrollment-course-details";
import {
  BRANCH_ENROLLMENT_PAYMENT_METHODS,
  BRANCH_INSTALLMENT_STATUS_OPTIONS,
  paymentReferenceLabel,
  requiresPaymentReference,
  todayEnrollmentDateValue,
  type BranchEnrollmentPaymentMethod,
} from "@/src/features/branches/constants/branch-enrollment.constants";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import type { Course } from "@/src/features/courses/types/course.types";
import { courseService } from "@/src/features/courses/services/course.service";
import { getCourseDefaultDiscount } from "@/src/features/courses/utils/get-course-default-discount.util";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import { studentService } from "@/src/features/students/services/student.service";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

interface InstallmentRow {
  id: string;
  amount: string;
  dueDate: string;
  paymentMethod: BranchEnrollmentPaymentMethod;
  paymentStatus: "PENDING" | "SUCCESS";
  transactionId: string;
}

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

function createInstallmentRow(): InstallmentRow {
  return {
    id: crypto.randomUUID(),
    amount: "",
    dueDate: "",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    transactionId: "",
  };
}

export function BranchCreateEnrollmentModal({
  open,
  branchId,
  onClose,
  onSuccess,
}: Props) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [admissionDate, setAdmissionDate] = useState(todayEnrollmentDateValue());
  const [batchId, setBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseTitles, setCourseTitles] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("—");
  const [feeAmount, setFeeAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [students, setStudents] = useState<
    Array<{ id: string; label: string; meta?: string }>
  >([]);
  const [studentId, setStudentId] = useState("");

  const [amountPaidNow, setAmountPaidNow] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<BranchEnrollmentPaymentMethod>("CASH");
  const [transactionId, setTransactionId] = useState("");
  const [useInstallments, setUseInstallments] = useState(false);
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);

  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = Math.max(0, feeAmount - discountAmount);
  const paidNowValue = normalizeMoney(amountPaidNow);
  const remainingAmount = Math.max(0, finalAmount - paidNowValue);

  const resetState = useCallback(() => {
    setAdmissionDate(todayEnrollmentDateValue());
    setBatchId("");
    setSelectedBatch(null);
    setCourse(null);
    setCourseTitles([]);
    setCategoryName("—");
    setFeeAmount(0);
    setDiscountAmount(0);
    setStudents([]);
    setStudentId("");
    setAmountPaidNow("");
    setPaymentMethod("CASH");
    setTransactionId("");
    setUseInstallments(false);
    setInstallments([]);
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
      setCourse(null);
      setCourseTitles([]);
      setStudents([]);
      setStudentId("");
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
        let nextCourse: Course | null = null;

        const courseId = batch.courseId ?? assignments[0]?.courseId;
        if (courseId) {
          const courseResponse = await courseService.getCourse(courseId);
          nextCourse = courseResponse.data;
          nextFee = normalizeMoney(nextCourse.pricing?.originalPrice);
          nextDiscount = getCourseDefaultDiscount(nextCourse);
          nextCategory =
            nextCourse.category?.name ?? "—";
        } else if (assignments[0]?.course?.category?.name) {
          nextCategory = assignments[0].course.category.name;
        }

        setCourse(nextCourse);
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
              meta: [item.studentCode, item.phone, item.email]
                .filter(Boolean)
                .join(" · "),
            })),
        );
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

  const handleSubmit = async () => {
    if (!batchId || !studentId) {
      appToast.error("Select a batch and student.");
      return;
    }

    if (paidNowValue > finalAmount) {
      appToast.error("Amount paid cannot exceed total course fee.");
      return;
    }

    if (paidNowValue > 0 && requiresPaymentReference(paymentMethod) && !transactionId.trim()) {
      appToast.error("Payment reference is required for the selected method.");
      return;
    }

    const installmentPayload = useInstallments
      ? installments
          .filter((row) => normalizeMoney(row.amount) > 0)
          .map((row) => ({
            amount: normalizeMoney(row.amount),
            dueDate: row.dueDate || undefined,
            paymentMethod: row.paymentMethod,
            paymentStatus: row.paymentStatus,
            transactionId: row.transactionId.trim() || undefined,
          }))
      : [];

    let installmentSuccessTotal = 0;
    for (const row of installmentPayload) {
      if (row.paymentStatus === "SUCCESS") {
        installmentSuccessTotal += row.amount;
      }
    }

    if (paidNowValue + installmentSuccessTotal > finalAmount) {
      appToast.error("Total recorded payments cannot exceed course fee.");
      return;
    }

    setIsSubmitting(true);
    try {
      await enrollmentService.createEnrollment({
        studentId,
        batchId,
        feeAmount,
        discountAmount,
        admissionDate,
        initialPaymentAmount: paidNowValue > 0 ? paidNowValue : undefined,
        paymentMethod: paidNowValue > 0 ? paymentMethod : undefined,
        transactionId: transactionId.trim() || undefined,
        installments: installmentPayload.length ? installmentPayload : undefined,
      });

      appToast.success("Enrollment created successfully");
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
      title="Create Enrollment"
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      contentClassName="flex max-h-[min(92vh,820px)] w-[calc(100vw-2rem)] max-w-3xl flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
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
          <p className="text-sm font-medium text-slate-700">Select Batch</p>
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
                setStudentId("");
              }}
            />
          )}
        </div>

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
              <p className="text-sm text-slate-500">
                No active students available for this batch.
              </p>
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

        {batchId && studentId ? (
          <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Payment</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-slate-500">Total Course Fee</p>
                <Input readOnly value={formatCurrency(finalAmount)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">Amount Paid Now</p>
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
                <p className="mb-1 text-xs text-slate-500">Payment Method</p>
                <AppSelect
                  value={paymentMethod}
                  options={BRANCH_ENROLLMENT_PAYMENT_METHODS.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  onValueChange={(value) =>
                    setPaymentMethod(value as BranchEnrollmentPaymentMethod)
                  }
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

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={useInstallments}
                onCheckedChange={(checked) => {
                  const enabled = Boolean(checked);
                  setUseInstallments(enabled);
                  if (enabled && installments.length === 0) {
                    setInstallments([createInstallmentRow()]);
                  }
                }}
              />
              Record remaining amount through installments
            </label>

            {useInstallments ? (
              <div className="space-y-3">
                {installments.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2"
                  >
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Installment Amount</p>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.amount}
                        onChange={(event) => {
                          const next = [...installments];
                          next[index] = {
                            ...row,
                            amount: event.target.value,
                          };
                          setInstallments(next);
                        }}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Due Date</p>
                      <Input
                        type="date"
                        value={row.dueDate}
                        onChange={(event) => {
                          const next = [...installments];
                          next[index] = {
                            ...row,
                            dueDate: event.target.value,
                          };
                          setInstallments(next);
                        }}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Payment Method</p>
                      <AppSelect
                        value={row.paymentMethod}
                        options={BRANCH_ENROLLMENT_PAYMENT_METHODS.map((item) => ({
                          label: item.label,
                          value: item.value,
                        }))}
                        onValueChange={(value) => {
                          const next = [...installments];
                          next[index] = {
                            ...row,
                            paymentMethod: value as BranchEnrollmentPaymentMethod,
                          };
                          setInstallments(next);
                        }}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-slate-500">Payment Status</p>
                      <AppSelect
                        value={row.paymentStatus}
                        options={BRANCH_INSTALLMENT_STATUS_OPTIONS.map((item) => ({
                          label: item.label,
                          value: item.value,
                        }))}
                        onValueChange={(value) => {
                          const next = [...installments];
                          next[index] = {
                            ...row,
                            paymentStatus: value as InstallmentRow["paymentStatus"],
                          };
                          setInstallments(next);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          setInstallments((current) =>
                            current.filter((item) => item.id !== row.id),
                          )
                        }
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInstallments((current) => [...current, createInstallmentRow()])
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Installment
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-4">
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
            !studentId ||
            isLoadingContext
          }
          onClick={() => {
            void handleSubmit();
          }}
        >
          Enroll
        </Button>
      </div>
    </Modal>
  );
}
