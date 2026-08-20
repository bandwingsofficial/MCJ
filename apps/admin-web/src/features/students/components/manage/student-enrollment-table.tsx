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

import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

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
  onActivate: (enrollment: Enrollment) => void;
  onDeactivate: (enrollment: Enrollment) => void;
}

function formatBatchLabel(enrollment: Enrollment): string {
  const name = enrollment.batch?.name ?? "—";
  const code = enrollment.batch?.code;

  return code ? `${name} (${code})` : name;
}

function resolveBranchName(
  enrollment: Enrollment,
  branchMap: Record<string, string>,
): string {
  return (
    enrollment.branch?.branchName ??
    branchMap[enrollment.branch?.id ?? ""] ??
    "—"
  );
}

function formatStudentName(student: Student): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

export function StudentEnrollmentTable({
  student,
  enrollments,
  branchMap = {},
  disabled = false,
  onManageEdit,
  onManageDelete,
  onManageRestore,
  onManagePermanentDelete,
  onActivate,
  onDeactivate,
}: Props) {
  if (enrollments.length === 0) {
    return (
      <EmptyState
        title="No enrollments yet"
        description="Create an enrollment to assign this student to a batch."
      />
    );
  }

  const studentName = formatStudentName(student);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Enrollment Date</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell className="font-medium text-slate-900">
              {studentName}
            </TableCell>
            <TableCell>{formatBatchLabel(enrollment)}</TableCell>
            <TableCell>{enrollment.course?.title ?? "—"}</TableCell>
            <TableCell>{resolveBranchName(enrollment, branchMap)}</TableCell>
            <TableCell>
              {formatStudentDate(enrollment.admissionDate ?? enrollment.createdAt)}
            </TableCell>
            <TableCell>{formatCurrency(enrollment.feeAmount)}</TableCell>
            <TableCell>{formatCurrency(enrollment.discountAmount)}</TableCell>
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
