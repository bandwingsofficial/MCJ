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
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatEnrollmentBalance,
  formatEnrollmentPaidAmount,
  resolveEnrollmentBranchName,
} from "@/src/features/students/utils/enrollment-display.utils";

interface Props {
  enrollments: Enrollment[];
  branchMap?: Record<string, string>;
}

export function StudentEnrollmentTable({
  enrollments,
  branchMap = {},
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
