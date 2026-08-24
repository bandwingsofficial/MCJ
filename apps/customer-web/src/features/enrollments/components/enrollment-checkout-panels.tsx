"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Lock, XCircle } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCurrency,
  getCoursePricing,
} from "@/src/features/courses/utils/course-display.utils";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface EnrollmentSuccessViewProps {
  course: Course;
  enrollment: Enrollment;
}

function getEnrollmentStatusLabel(enrollment: Enrollment): string {
  switch (enrollment.status) {
    case "ADMITTED":
    case "ACTIVE":
      return "Admitted";
    case "PENDING_APPROVAL":
      return "Awaiting Approval";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return enrollment.paymentStatus === "PAID"
        ? "Awaiting Approval"
        : "Pending Payment";
    default:
      return enrollment.status;
  }
}

export function EnrollmentSuccessView({
  course,
  enrollment,
}: EnrollmentSuccessViewProps) {
  const pricing = getCoursePricing(course);
  const isAwaitingApproval =
    enrollment.status === "PENDING_APPROVAL" ||
    (enrollment.status === "PENDING" && enrollment.paymentStatus === "PAID");
  const isAdmitted =
    enrollment.status === "ADMITTED" || enrollment.status === "ACTIVE";
  const isFree = pricing.isFree || enrollment.finalAmount <= 0;

  return (
    <div
      className={`rounded-2xl border p-8 text-center shadow-sm ${
        isAdmitted
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-blue-200 bg-blue-50/40"
      }`}
    >
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          isAdmitted
            ? "bg-emerald-100 text-emerald-600"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        {isAdmitted ? (
          <CheckCircle2 className="h-8 w-8" />
        ) : (
          <Clock className="h-8 w-8" />
        )}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        {isAdmitted
          ? "Enrollment Approved"
          : isFree && enrollment.status === "PENDING_APPROVAL"
            ? "Enrollment Submitted Successfully"
            : "Enrollment Submitted Successfully"}
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        {isAdmitted
          ? "You have been admitted to this course. Course access is now enabled."
          : isAwaitingApproval || enrollment.status === "PENDING_APPROVAL"
            ? "Your payment was successful. Our team will review your enrollment and update your admission status within 24 hours."
            : isFree
              ? "Your enrollment has been submitted. Our team will review your request and update your admission status within 24 hours."
              : "Your enrollment request has been recorded."}
      </p>

      <div className="mx-auto mt-6 max-w-md rounded-xl border border-white bg-white p-4 text-left text-sm">
        <p className="font-medium text-slate-900">{course.title}</p>
        <p className="mt-1 text-slate-600">
          Enrollment ID: {enrollment.enrollmentNumber}
        </p>
        <p className="mt-1 text-slate-600">
          Batch: {enrollment.batch?.name ?? "—"}
        </p>
        <p className="mt-1 text-slate-600">
          Branch: {enrollment.branch?.branchName ?? "—"}
        </p>
        {!isFree ? (
          <p className="mt-1 text-slate-600">
            Payment: {formatCurrency(enrollment.finalAmount, pricing.currency)}
          </p>
        ) : null}
        <p className="mt-1 text-slate-600">
          Payment Status: {enrollment.paymentStatus}
        </p>
        <p className="mt-1 font-medium text-slate-900">
          Status: {getEnrollmentStatusLabel(enrollment)}
        </p>
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={`/student/enrollments/${enrollment.id}`}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          View Enrollment Details
        </Link>
        {isAdmitted ? (
          <Link
            href={`/student/courses/${course.id}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Course
          </Link>
        ) : (
          <Link
            href="/student/enrollments"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View Enrollment History
          </Link>
        )}
      </div>
    </div>
  );
}

interface EnrollmentPaymentCancelledProps {
  course: Course;
  onTryAgain: () => void;
}

export function EnrollmentPaymentCancelled({
  course,
  onTryAgain,
}: EnrollmentPaymentCancelledProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Payment Cancelled</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Your enrollment has not been completed.
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          type="button"
          className="h-11 rounded-xl bg-blue-600 px-6 hover:bg-blue-700"
          onClick={onTryAgain}
        >
          Try Again
        </Button>
        <Link
          href={getCourseDetailPath(course)}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Back to Course
        </Link>
      </div>
    </div>
  );
}

function getCourseDetailPath(course: Course): string {
  return `/courses/${course.slug}`;
}

export function EnrollmentSecurePaymentNote() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Secure Payment</h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Your payment will be securely processed through Razorpay.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            After successful payment, your enrollment will be submitted for
            verification by our team. Course access will be enabled after your
            enrollment is approved.
          </p>
        </div>
      </div>
    </section>
  );
}

export function EnrollmentRejectedBanner({
  reason,
}: {
  reason: string | null;
}) {
  if (!reason) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <h4 className="text-sm font-semibold text-red-900">
            Enrollment Rejected
          </h4>
          <p className="mt-1 text-sm text-red-800">Reason: {reason}</p>
        </div>
      </div>
    </div>
  );
}
