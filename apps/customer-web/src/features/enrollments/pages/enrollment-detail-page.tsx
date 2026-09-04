"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Separator } from "@/src/shared/components/ui/separator";

import { PaymentButton } from "@/src/features/payments/components/PaymentButton";
import { EnrollmentRejectedBanner } from "@/src/features/enrollments/components/enrollment-checkout-panels";
import { useEnrollment } from "@/src/features/enrollments/hooks/useEnrollment";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

interface EnrollmentDetailPageProps {
  enrollmentId: string;
}

function getStatusVariant(
  status: string,
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "ADMITTED":
    case "ACTIVE":
      return "success";
    case "PENDING_APPROVAL":
    case "PENDING":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    case "COMPLETED":
      return "info";
    default:
      return "default";
  }
}

function getStatusLabel(status: string, paymentStatus: string): string {
  if (status === "ADMITTED" || status === "ACTIVE") {
    return "Admitted";
  }

  if (status === "PENDING_APPROVAL") {
    return "Awaiting Approval";
  }

  if (status === "PENDING" && paymentStatus === "PAID") {
    return "Awaiting Approval";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  return status.replaceAll("_", " ");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function EnrollmentDetailPage({
  enrollmentId,
}: EnrollmentDetailPageProps) {
  const { enrollment, isLoading, error, refetch } =
    useEnrollment(enrollmentId);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !enrollment) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorState
          title="Enrollment Not Found"
          description={error ?? "Unable to load enrollment details."}
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  const canPay =
    enrollment.status === "PENDING" && enrollment.paymentStatus === "UNPAID";

  return (
    <main className="container mx-auto space-y-8 px-4 py-0">
      <PageHeader
        title="Enrollment Details"
        description={`Enrollment ID: ${enrollment.enrollmentNumber}`}
      />

      {enrollment.status === "REJECTED" ? (
        <EnrollmentRejectedBanner reason={enrollment.rejectionReason} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {enrollment.course.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {enrollment.category.name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusVariant(enrollment.status)}>
                  {getStatusLabel(
                    enrollment.status,
                    enrollment.paymentStatus,
                  )}
                </Badge>
                <Badge variant={getStatusVariant(enrollment.paymentStatus)}>
                  {enrollment.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="my-6">
              <Separator />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <section>
                <h3 className="text-sm font-semibold text-slate-900">Student</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </p>
                  <p>{enrollment.student.email}</p>
                  <p>{enrollment.student.phone}</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900">Batch</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>{enrollment.batch.name}</p>
                  <p>
                    {formatEnrollmentDate(enrollment.batch.startDate)} –{" "}
                    {formatEnrollmentDate(enrollment.batch.endDate)}
                  </p>
                  <p>{enrollment.batch.mode}</p>
                  <p>
                    {formatBatchDays(enrollment.batch.daysOfWeek)} ·{" "}
                    {formatEnrollmentTime(enrollment.batch.startTime)} –{" "}
                    {formatEnrollmentTime(enrollment.batch.endTime)}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900">Branch</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>{enrollment.branch.branchName}</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-slate-900">
                  Enrollment
                </h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    Created:{" "}
                    {new Date(enrollment.createdAt).toLocaleString()}
                  </p>
                  <p>Source: {enrollment.source}</p>
                  {enrollment.admissionDate ? (
                    <p>
                      Admitted:{" "}
                      {new Date(enrollment.admissionDate).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </section>
            </div>

            {enrollment.remarks ? (
              <>
                <div className="my-6">
              <Separator />
            </div>
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Remarks
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {enrollment.remarks}
                  </p>
                </section>
              </>
            ) : null}
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Need help with this enrollment?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Contact our support team and mention your enrollment ID{" "}
              <span className="font-mono font-medium">
                {enrollment.enrollmentNumber}
              </span>
              .
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2563D9]" />
                <a
                  href="mailto:support@mcjinstitute.com"
                  className="hover:text-[#2563D9]"
                >
                  support@mcjinstitute.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#2563D9]" />
                <span>We respond within 24 hours</span>
              </div>
              <Link
                href="/contact"
                className="inline-flex text-sm font-semibold text-[#2563D9] hover:underline"
              >
                Visit Contact Page
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-900">
              Fee Summary
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Original Price</span>
                <span>{formatCurrency(enrollment.feeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span>-{formatCurrency(enrollment.discountAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Final Amount</span>
                <span>{formatCurrency(enrollment.finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid</span>
                <span>{formatCurrency(enrollment.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due</span>
                <span>{formatCurrency(enrollment.dueAmount)}</span>
              </div>
            </div>

            {canPay ? (
              <div className="mt-6">
                <PaymentButton enrollmentId={enrollment.id} />
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </main>
  );
}
