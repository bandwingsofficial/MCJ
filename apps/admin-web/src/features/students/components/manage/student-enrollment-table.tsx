"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatEnrollmentBalance,
  formatEnrollmentCategoryName,
  formatEnrollmentFinalPrice,
  formatEnrollmentPaidAmount,
  formatEnrollmentTrainerNames,
  resolveEnrollmentBranchName,
} from "@/src/features/students/utils/enrollment-display.utils";

import { StudentEnrollmentActiveBadge } from "./student-enrollment-active-badge";
import { StudentEnrollmentRowActions } from "./student-enrollment-row-actions";

interface Props {
  student: Student;
  enrollments: Enrollment[];
  branchMap?: Record<string, string>;
  disabled?: boolean;
  onManageEdit: (enrollment: Enrollment) => void;
  onManageDelete: (enrollment: Enrollment) => void;
  onManageRestore: (enrollment: Enrollment) => void;
  onManagePermanentDelete: (enrollment: Enrollment) => void;
  onUnenroll?: (enrollment: Enrollment) => void;
  onActivate: (enrollment: Enrollment) => void;
  onDeactivate: (enrollment: Enrollment) => void;
}

export function StudentEnrollmentTable({
  student: _student,
  enrollments,
  branchMap = {},
  disabled = false,
  onManageEdit,
  onManageDelete,
  onManageRestore,
  onManagePermanentDelete,
  onUnenroll,
  onActivate,
  onDeactivate,
}: Props) {
  if (enrollments.length === 0) {
    return (
      <EmptyState
        title="No Enrollments Yet"
        description="Enroll this student through a branch batch to see enrollment details here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Branch</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Batch Code</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Trainer</TableHead>
          <TableHead>Enrollment Date</TableHead>
          <TableHead>Final Price</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>
              {resolveEnrollmentBranchName(enrollment, branchMap)}
            </TableCell>
            <TableCell>{enrollment.batch?.name ?? "—"}</TableCell>
            <TableCell className="font-mono text-sm">
              {enrollment.batch?.code ?? "—"}
            </TableCell>
            <TableCell>{enrollment.course?.title ?? "—"}</TableCell>
            <TableCell>{formatEnrollmentCategoryName(enrollment)}</TableCell>
            <TableCell>{formatEnrollmentTrainerNames(enrollment)}</TableCell>
            <TableCell>
              {formatStudentDate(
                enrollment.admissionDate ?? enrollment.createdAt,
              )}
            </TableCell>
            <TableCell>{formatEnrollmentFinalPrice(enrollment)}</TableCell>
            <TableCell>{formatEnrollmentPaidAmount(enrollment)}</TableCell>
            <TableCell>{formatEnrollmentBalance(enrollment)}</TableCell>
            <TableCell>
              <PaymentStatusBadge status={enrollment.paymentStatus} />
            </TableCell>
            <TableCell>
              <StudentEnrollmentActiveBadge enrollment={enrollment} />
            </TableCell>
            <TableCell className="text-right">
              <StudentEnrollmentRowActions
                enrollment={enrollment}
                disabled={disabled}
                onManageEdit={onManageEdit}
                onManageDelete={onManageDelete}
                onManageRestore={onManageRestore}
                onManagePermanentDelete={onManagePermanentDelete}
                onUnenroll={onUnenroll}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
