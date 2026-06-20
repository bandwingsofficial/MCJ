"use client";

import {
  MoreVertical,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { Enrollment } from "../../types";

import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";

import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface EnrollmentTableProps {
  enrollments: Enrollment[];

  onView(
    enrollment: Enrollment,
  ): void;

  onEdit(
    enrollment: Enrollment,
  ): void;

  onDelete(
    enrollment: Enrollment,
  ): void;

  onRestore(
    enrollment: Enrollment,
  ): void;

  onPermanentDelete(
    enrollment: Enrollment,
  ): void;

  onStatusChange(
    enrollment: Enrollment,
  ): void;
}

export function EnrollmentTable({
  enrollments,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onStatusChange,
}: EnrollmentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-1">
            Enrollment No
          </TableHead>

          <TableHead className="py-1">
            Student
          </TableHead>

          <TableHead className="py-1">
            Course
          </TableHead>

          <TableHead className="py-1">
            Batch
          </TableHead>

          <TableHead className="py-1">
            Status
          </TableHead>

          <TableHead className="py-1">
            Payment
          </TableHead>

          <TableHead className="py-1">
            Due
          </TableHead>

          <TableHead className="py-1">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {enrollments.map(
          (
            enrollment,
          ) => (
            <TableRow
              key={
                enrollment.id
              }
            >
              <TableCell className="py-1">
                {
                  enrollment.enrollmentNumber
                }
              </TableCell>

              <TableCell className="py-1">
                {`${enrollment.student.firstName} ${enrollment.student.lastName}`}
              </TableCell>

              <TableCell className="py-1">
                {
                  enrollment.course.title
                }
              </TableCell>

              <TableCell className="py-1">
                {
                  enrollment.batch.name
                }
              </TableCell>

              <TableCell className="py-1">
                <EnrollmentStatusBadge
                  status={
                    enrollment.status
                  }
                />
              </TableCell>

              <TableCell className="py-1">
                <PaymentStatusBadge
                  status={
                    enrollment.paymentStatus
                  }
                />
              </TableCell>

              <TableCell className="py-1">
                ₹
                {enrollment.dueAmount.toLocaleString()}
              </TableCell>

              <TableCell className="py-1">
                <Dropdown
                  trigger={
                    <Button variant="outline">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    {
                      label:
                        "View",
                      onClick:
                        () =>
                          onView(
                            enrollment,
                          ),
                    },
                    {
                      label:
                        "Edit",
                      onClick:
                        () =>
                          onEdit(
                            enrollment,
                          ),
                    },
                    {
                      label:
                        "Update Status",
                      onClick:
                        () =>
                          onStatusChange(
                            enrollment,
                          ),
                    },
                    {
                      label:
                        "Delete",
                      onClick:
                        () =>
                          onDelete(
                            enrollment,
                          ),
                    },
                    {
                      label:
                        "Delete permanently",
                      onClick:
                        () =>
                          onPermanentDelete(
                            enrollment,
                          ),
                    },
                    {
                      label:
                        "Restore",
                      onClick:
                        () =>
                          onRestore(
                            enrollment,
                          ),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ),
        )}
      </TableBody>
    </Table>
  );
}