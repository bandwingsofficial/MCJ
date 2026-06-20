"use client";

import { Drawer } from "@/src/shared/components/ui/drawer";

import { Badge } from "@/src/shared/components/ui/badge";

import { Separator } from "@/src/shared/components/ui/separator";

import { Enrollment } from "../../types";

interface EnrollmentDetailsDrawerProps {
  open: boolean;

  enrollment: Enrollment | null;

  onClose: () => void;
}

export function EnrollmentDetailsDrawer({
  open,
  enrollment,
  onClose,
}: EnrollmentDetailsDrawerProps) {
  if (!enrollment) {
    return null;
  }

  return (
    <Drawer
      open={open}
      title="Enrollment Details"
      onClose={onClose}
    >
      <div className="space-y-5">

        {/* Student */}

        <section className="space-y-2">

          <h3 className="font-semibold">
            Student
          </h3>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">

            <div>
              <span className="font-medium">
                Name
              </span>

              <p>
                {enrollment.student?.firstName ?? "-"}{" "}
                {enrollment.student.lastName}
              </p>
            </div>

            <div>
              <span className="font-medium">
                Student Code
              </span>

              <p>
                {
                  enrollment.student.studentCode
                }
              </p>
            </div>

            <div>
              <span className="font-medium">
                Email
              </span>

              <p>
                {
                  enrollment.student.email
                }
              </p>
            </div>

            <div>
              <span className="font-medium">
                Phone
              </span>

              <p>
                {
                  enrollment.student.phone
                }
              </p>
            </div>

          </div>

        </section>

        {/* Course */}

        <section className="space-y-2">

          <h3 className="font-semibold">
            Course
          </h3>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">

            <div>
              <span className="font-medium">
                Course
              </span>

              <p>
                {
                  enrollment.course?.title ?? "-"
                }
              </p>
            </div>

            <div>
              <span className="font-medium">
                Batch
              </span>

              <p>
                {
                  enrollment.batch?.name ?? "-"
                }
              </p>
            </div>

            <div>
              <span className="font-medium">
                Branch
              </span>

              <p>
                {
                  enrollment.branch?.branchName ?? "-"
                }
              </p>
            </div>

            <div>
              <span className="font-medium">
                Category
              </span>

              <p>
                {
                 enrollment.category?.name ?? "-"
                }
              </p>
            </div>

          </div>

        </section>

        {/* Payment */}

        <section className="space-y-2">

          <h3 className="font-semibold">
            Payment
          </h3>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">

            <div>
              <span className="font-medium">
                Fee
              </span>

              <p>
                ₹
                {enrollment.feeAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <span className="font-medium">
                Discount
              </span>

              <p>
                ₹
                {(enrollment.discountAmount ?? 0).toLocaleString()}
              </p>
            </div>

            <div>
              <span className="font-medium">
                Final
              </span>

              <p>
                ₹
                {enrollment.finalAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <span className="font-medium">
                Paid
              </span>

              <p>
                ₹
                {enrollment.paidAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <span className="font-medium">
                Due
              </span>

              <p>
                ₹
                {enrollment.dueAmount.toLocaleString()}
              </p>
            </div>

          </div>

        </section>

        {/* Status */}

        <section className="space-y-2">

          <h3 className="font-semibold">
            Status
          </h3>

          <Separator />

          <div className="flex gap-3">

            <Badge variant="info">
              {enrollment.status}
            </Badge>

            <Badge variant="success">
              {enrollment.paymentStatus}
            </Badge>

          </div>

        </section>

        {/* Remarks */}

        <section className="space-y-2">

          <h3 className="font-semibold">
            Remarks
          </h3>

          <Separator />

          <p className="text-sm">
            {enrollment.remarks ||
              "-"}
          </p>

        </section>

      </div>
    </Drawer>
  );
}