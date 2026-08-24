"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { useBatch } from "@/src/features/batches/hooks/useBatch";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import {
  getCourseBatchesSectionPath,
  getCourseDetailPath,
  getCourseEnrollPath,
  getEnrollmentLoginPath,
  getEnrollmentRegisterPath,
} from "@/src/features/courses/utils/course-route.utils";
import {
  formatCurrency,
  getCoursePricing,
} from "@/src/features/courses/utils/course-display.utils";
import { EnrollmentAuthRequired } from "@/src/features/enrollments/components/enrollment-auth-required";
import { EnrollmentBranchInfo } from "@/src/features/enrollments/components/enrollment-branch-info";
import {
  EnrollmentPaymentCancelled,
  EnrollmentSecurePaymentNote,
  EnrollmentSuccessView,
} from "@/src/features/enrollments/components/enrollment-checkout-panels";
import { EnrollmentCourseSummary } from "@/src/features/enrollments/components/enrollment-course-summary";
import { EnrollmentMissingBatch } from "@/src/features/enrollments/components/enrollment-missing-batch";
import { EnrollmentOrderSummary } from "@/src/features/enrollments/components/enrollment-order-summary";
import { EnrollmentPageSkeleton } from "@/src/features/enrollments/components/enrollment-page-skeleton";
import { EnrollmentSelectedBatchReview } from "@/src/features/enrollments/components/enrollment-selected-batch-review";
import { EnrollmentStudentInfo } from "@/src/features/enrollments/components/enrollment-student-info";
import { useEnrollmentCheckout } from "@/src/features/enrollments/hooks/use-enrollment-checkout";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { isBatchSelectable } from "@/src/features/enrollments/utils/enrollment-batch.utils";
import { useStudentProfile } from "@/src/features/student/hooks";

type EnrollmentPageView =
  | "checkout"
  | "success"
  | "payment_cancelled";

type BatchValidationError =
  | "not_found"
  | "wrong_course"
  | "unavailable";

interface EnrollPageProps {
  slug: string;
}

export function EnrollPage({ slug }: EnrollPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlBatchId = searchParams.get("batchId") ?? undefined;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);

  const [remarks, setRemarks] = useState("");
  const [pageView, setPageView] = useState<EnrollmentPageView>("checkout");
  const [completedEnrollment, setCompletedEnrollment] =
    useState<Enrollment | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    refetch: refetchCourse,
  } = useCourse(slug);

  const {
    batch: fetchedBatch,
    isLoading: fetchedBatchLoading,
    error: fetchedBatchError,
  } = useBatch(urlBatchId);

  const {
    profile: studentProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useStudentProfile({
    enabled: isAuthenticated,
  });

  const {
    completeCheckout,
    isProcessing,
    error: checkoutError,
    clearError,
  } = useEnrollmentCheckout();

  const selectedBatchId = urlBatchId;

  const selectedBatch = useMemo(() => {
    if (!selectedBatchId) {
      return null;
    }

    if (fetchedBatch?.id === selectedBatchId) {
      return fetchedBatch;
    }

    return null;
  }, [fetchedBatch, selectedBatchId]);

  const isBatchResolving = Boolean(selectedBatchId) && fetchedBatchLoading;

  const batchValidationError = useMemo((): BatchValidationError | null => {
    if (!selectedBatchId || isBatchResolving) {
      return null;
    }

    if (selectedBatch && course && selectedBatch.courseId !== course.id) {
      return "wrong_course";
    }

    if (selectedBatch && !isBatchSelectable(selectedBatch)) {
      return "unavailable";
    }

    if (!selectedBatch) {
      if (fetchedBatchError || !fetchedBatchLoading) {
        return "not_found";
      }
    }

    return null;
  }, [
    course,
    fetchedBatchError,
    fetchedBatchLoading,
    isBatchResolving,
    selectedBatch,
    selectedBatchId,
  ]);

  const pricing = course ? getCoursePricing(course) : null;

  const enrollPath = useMemo(
    () => getCourseEnrollPath({ slug }, { batchId: selectedBatchId }),
    [selectedBatchId, slug],
  );

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthPrompt(false);
    }
  }, [isAuthenticated]);

  const canSubmit =
    Boolean(isAuthenticated) &&
    Boolean(studentProfile) &&
    Boolean(selectedBatchId) &&
    Boolean(selectedBatch && isBatchSelectable(selectedBatch)) &&
    !batchValidationError &&
    !isProcessing &&
    pageView === "checkout";

  const checkoutButtonLabel = useMemo(() => {
    if (!pricing) {
      return "Continue";
    }

    if (pricing.isFree) {
      return "Complete Enrollment";
    }

    if (isAuthenticated) {
      return `Pay ${formatCurrency(pricing.discountedPrice, pricing.currency)}`;
    }

    return "Continue to Payment";
  }, [isAuthenticated, pricing]);

  const handlePayNow = async () => {
    if (!course || !selectedBatchId || !pricing) {
      return;
    }

    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!studentProfile) {
      appToast.error("Please complete your student profile before enrolling.");
      return;
    }

    if (batchValidationError) {
      appToast.error("The selected batch is no longer available.");
      return;
    }

    if (!selectedBatch || !isBatchSelectable(selectedBatch)) {
      appToast.error(
        "This batch is no longer available. Please select another batch.",
      );
      return;
    }

    clearError();
    setShowAuthPrompt(false);

    const result = await completeCheckout({
      batchId: selectedBatchId,
      remarks: remarks.trim() || undefined,
      isFree: pricing.isFree,
    });

    if (!result) {
      return;
    }

    if (result.status === "success_free" || result.status === "success_paid") {
      setCompletedEnrollment(result.enrollment);
      setPageView("success");
      appToast.success(
        result.status === "success_free"
          ? "Enrollment submitted for approval."
          : "Payment successful. Your enrollment is awaiting approval.",
      );
      return;
    }

    if (result.status === "payment_cancelled") {
      setCompletedEnrollment(result.enrollment);
      setPageView("payment_cancelled");
      return;
    }

    appToast.error(checkoutError ?? "Payment failed. Please try again.");
  };

  if (courseLoading || (selectedBatchId && isBatchResolving && !course)) {
    return <EnrollmentPageSkeleton />;
  }

  if (courseError || !course) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <ErrorState
            title="Course Not Found"
            description="The course you are trying to enroll in could not be found."
            onRetry={() => refetchCourse()}
          />
        </div>
      </main>
    );
  }

  if (course.status && course.status !== "ACTIVE") {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <ErrorState
            title="Course Unavailable"
            description="This course is not currently open for enrollment."
            onRetry={() => router.push(getCourseDetailPath(course))}
          />
        </div>
      </main>
    );
  }

  const isAlreadyEnrolled = Boolean(course.isEnrolled);

  const batchErrorMessage =
    batchValidationError === "wrong_course"
      ? "This batch is not available for this course."
      : batchValidationError === "unavailable"
        ? "This batch is no longer available. Please select another batch."
        : batchValidationError === "not_found"
          ? "The selected batch could not be found."
          : null;

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <Link href="/" className="transition-colors hover:text-blue-600">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/courses" className="transition-colors hover:text-blue-600">
              Courses
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/courses?category=${course.categoryId}`}
              className="transition-colors hover:text-blue-600"
            >
              {course.categoryName || "Category"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={getCourseDetailPath(course)}
              className="transition-colors hover:text-blue-600"
            >
              {course.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-900">Enrollment</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Complete Your Enrollment
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Review your course and selected batch, then securely complete your
            enrollment.
          </p>
        </div>

        {pageView === "success" && completedEnrollment ? (
          <div className="mt-8 max-w-3xl">
            <EnrollmentSuccessView
              course={course}
              enrollment={completedEnrollment}
            />
          </div>
        ) : pageView === "payment_cancelled" ? (
          <div className="mt-8 max-w-3xl">
            <EnrollmentPaymentCancelled
              course={course}
              onTryAgain={() => setPageView("checkout")}
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
            <div className="space-y-6">
              <EnrollmentCourseSummary course={course} />

              {isAlreadyEnrolled ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
                  <h3 className="text-base font-semibold text-slate-900">
                    You are already enrolled in this course.
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Continue learning from your student dashboard.
                  </p>
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Continue Learning
                  </Link>
                </div>
              ) : !selectedBatchId ? (
                <EnrollmentMissingBatch course={course} />
              ) : (
                <>
                  {batchErrorMessage ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                      <p className="text-sm font-medium text-amber-900">
                        {batchErrorMessage}
                      </p>
                      <Link
                        href={getCourseBatchesSectionPath(course)}
                        className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Choose another batch
                      </Link>
                    </div>
                  ) : null}

                  <EnrollmentSelectedBatchReview
                    course={course}
                    batch={selectedBatch}
                    isLoading={isBatchResolving}
                  />

                  {selectedBatch ? (
                    <EnrollmentBranchInfo batch={selectedBatch} />
                  ) : null}

                  {!isAuthenticated ? (
                    <EnrollmentAuthRequired
                      variant="inline"
                      loginHref={getEnrollmentLoginPath(enrollPath)}
                      registerHref={getEnrollmentRegisterPath(enrollPath)}
                    />
                  ) : (
                    <EnrollmentStudentInfo
                      authUser={authUser}
                      studentProfile={studentProfile}
                      isLoading={profileLoading}
                      profileError={profileError}
                    />
                  )}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(event) => setRemarks(event.target.value)}
                      placeholder="Add any information you would like us to know..."
                      className="mt-2 min-h-28 rounded-xl border-slate-200"
                    />
                  </section>
                </>
              )}
            </div>

            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <EnrollmentOrderSummary
                course={course}
                selectedBatch={selectedBatch}
                isBatchLoading={isBatchResolving}
                hasBatchId={Boolean(selectedBatchId)}
              />

              {!pricing?.isFree ? <EnrollmentSecurePaymentNote /> : null}

              {!isAlreadyEnrolled && selectedBatchId ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {showAuthPrompt && !isAuthenticated ? (
                    <div className="mb-4">
                      <EnrollmentAuthRequired
                        loginHref={getEnrollmentLoginPath(enrollPath)}
                        registerHref={getEnrollmentRegisterPath(enrollPath)}
                      />
                    </div>
                  ) : null}

                  <FormError message={checkoutError ?? undefined} />
                  <Button
                    type="button"
                    className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold hover:bg-blue-700"
                    disabled={
                      !selectedBatchId ||
                      Boolean(batchValidationError) ||
                      isBatchResolving ||
                      isProcessing ||
                      (isAuthenticated &&
                        (!studentProfile ||
                          !selectedBatch ||
                          !isBatchSelectable(selectedBatch)))
                    }
                    loading={isProcessing}
                    onClick={handlePayNow}
                  >
                    {checkoutButtonLabel}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
