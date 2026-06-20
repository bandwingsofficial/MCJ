// src/features/enrollments/utils/export-enrollments.ts

import { Enrollment } from "../types";

export function exportEnrollments(
  enrollments: Enrollment[],
): void {
  const rows =
    enrollments.map(
      (
        enrollment,
      ) => ({
        EnrollmentNo:
          enrollment.enrollmentNumber,

        Student: `${enrollment.student.firstName} ${enrollment.student.lastName}`,

        Course:
          enrollment.course.title,

        Batch:
          enrollment.batch.name,

        Status:
          enrollment.status,

        PaymentStatus:
          enrollment.paymentStatus,

        Fee:
          enrollment.feeAmount,

        Paid:
          enrollment.paidAmount,

        Due:
          enrollment.dueAmount,
      }),
    );

  console.table(rows);
}