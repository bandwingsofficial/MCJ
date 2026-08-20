"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { Card } from "@/src/shared/components/ui/card";

import { Badge } from "@/src/shared/components/ui/badge";

import { Loader } from "@/src/shared/components/ui/loader";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { Separator } from "@/src/shared/components/ui/separator";

import { useEnrollment } from "../hooks";
import { formatCurrency } from "../utils/format-payment";

interface EnrollmentDetailsPageProps {
  enrollmentId: string;
}

export function EnrollmentDetailsPage({
  enrollmentId,
}: EnrollmentDetailsPageProps) {
  const {
    enrollment,
    isLoading,
    error,
    refetch,
  } = useEnrollment(
    enrollmentId,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (
    error ||
    !enrollment
  ) {
    return (
      <ErrorState
        title="Enrollment Not Found"
        description={
          error ??
          "Unable to load enrollment."
        }
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Enrollment Details"
        description="View complete enrollment information."
      />

      <Card className="mt-4 p-6 space-y-6">

        <section>

          <h3 className="font-semibold">
            Student
          </h3>

          <Separator  />

          <div className="grid grid-cols-2 gap-4">

            <div>
              <strong>Name</strong>

              <p>
                {
                  enrollment.student.firstName
                }{" "}
                {
                  enrollment.student.lastName
                }
              </p>

            </div>

            <div>

              <strong>Email</strong>

              <p>
                {
                  enrollment.student.email
                }
              </p>

            </div>

            <div>

              <strong>Phone</strong>

              <p>
                {
                  enrollment.student.phone
                }
              </p>

            </div>

            <div>

              <strong>Student Code</strong>

              <p>
                {
                  enrollment.student.studentCode
                }
              </p>

            </div>

          </div>

        </section>

        <section>

          <h3 className="font-semibold">
            Course Information
          </h3>

          <Separator />

          <div className="grid grid-cols-2 gap-4">

            <div>

              <strong>Course</strong>

              <p>
                {
                  enrollment.course.title
                }
              </p>

            </div>

            <div>

              <strong>Batch</strong>

              <p>
                {
                  enrollment.batch.name
                }
              </p>

            </div>

            <div>

              <strong>Branch</strong>

              <p>
                {
                  enrollment.branch.branchName
                }
              </p>

            </div>

            <div>

              <strong>Status</strong>

              <Badge variant="info">
                {
                  enrollment.status
                }
              </Badge>

            </div>

          </div>

        </section>

        <section>

          <h3 className="font-semibold">
            Payment
          </h3>

          <Separator />

          <div className="grid grid-cols-2 gap-4">

            <div>

              <strong>Fee</strong>

              <p>{formatCurrency(enrollment.feeAmount)}</p>

            </div>

            <div>

              <strong>Discount</strong>

              <p>{formatCurrency(enrollment.discountAmount)}</p>

            </div>

            <div>

              <strong>Paid</strong>

              <p>{formatCurrency(enrollment.paidAmount)}</p>

            </div>

            <div>

              <strong>Due</strong>

              <p>{formatCurrency(enrollment.dueAmount)}</p>

            </div>

          </div>

        </section>

      </Card>
    </>
  );
}