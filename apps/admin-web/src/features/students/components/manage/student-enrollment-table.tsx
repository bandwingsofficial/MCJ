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

import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { PaymentStatusBadge } from "@/src/features/enrollments/components/table/PaymentStatusBadge";
import { enrollmentListDisplayStatus } from "@/src/features/enrollments/utils/current-enrollment";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatEnrollmentBalance,
  formatEnrollmentPaidAmount,
  resolveEnrollmentBranchName,
} from "@/src/features/students/utils/enrollment-display.utils";

import { StudentEnrollmentRowActions } from "./student-enrollment-row-actions";

interface Props {
  student: Student;
  enrollments: Enrollment[];
  branchMap?: Record<string, string>;
  disabled?: boolean;
  onManageEdit: (enrollment: Enrollment) => void;
  onManageDelete: (enrollment: Enrollment) => void;
  onManagePermanentDelete: (enrollment: Enrollment) => void;
  onUnenroll?: (enrollment: Enrollment) => void;
  onActivate: (enrollment: Enrollment) => void;
  onDeactivate: (enrollment: Enrollment) => void;
  onChangeStatus?: (enrollment: Enrollment) => void;
}

export function StudentEnrollmentTable({
  student: _student,
  enrollments,
  branchMap = {},
  disabled = false,
  onManageEdit,
  onManageDelete,
  onManagePermanentDelete,
  onUnenroll,
  onActivate,
  onDeactivate,
  onChangeStatus,
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
          <TableHead>Course</TableHead>
          <TableHead>Enrollment Date</TableHead>
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
            <TableCell>{enrollment.course?.title ?? "—"}</TableCell>
            <TableCell>
              {formatStudentDate(
                enrollment.admissionDate ?? enrollment.createdAt,
              )}
            </TableCell>
            <TableCell>{formatEnrollmentPaidAmount(enrollment)}</TableCell>
            <TableCell>{formatEnrollmentBalance(enrollment)}</TableCell>
            <TableCell>
              <PaymentStatusBadge status={enrollment.paymentStatus} />
            </TableCell>
            <TableCell>
              <EnrollmentStatusBadge
                status={enrollmentListDisplayStatus(enrollment)}
                isDeleted={enrollment.isDeleted}
              />
            </TableCell>
            <TableCell className="text-right">
              <StudentEnrollmentRowActions
                enrollment={enrollment}
                disabled={disabled}
                onManageEdit={onManageEdit}
                onManageDelete={onManageDelete}
                onManagePermanentDelete={onManagePermanentDelete}
                onUnenroll={onUnenroll}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                onChangeStatus={onChangeStatus}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
