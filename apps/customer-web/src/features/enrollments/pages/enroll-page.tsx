"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { FormError } from "@/src/shared/components/ui/form-error";
import { appToast } from "@/src/shared/components/ui/toast";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { tokenStorage } from "@/src/core/storage/token-storage";
import { useBatch } from "@/src/features/batches/hooks/useBatch";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import {
  getCourseBatchesSectionPath,
  getCourseDetailPath,
  getCourseEnrollPath,
  getEnrollmentLoginPath,
} from "@/src/features/courses/utils/course-route.utils";
import {
  formatCurrency,
} from "@/src/features/batches/utils/batch-pricing.utils";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import { resolveModePricing } from "@/src/features/courses/utils/course-batch.utils";
import type { BatchMode } from "@/src/features/batches/types/batch.types";
import {
  EnrollmentPaymentCancelled,
  EnrollmentSuccessView,
} from "@/src/features/enrollments/components/enrollment-checkout-panels";
import { EnrollmentCourseSummary } from "@/src/features/enrollments/components/enrollment-course-summary";
import { EnrollmentMissingBatch } from "@/src/features/enrollments/components/enrollment-missing-batch";
import { EnrollmentOrderSummary } from "@/src/features/enrollments/components/enrollment-order-summary";
import { EnrollmentPageSkeleton } from "@/src/features/enrollments/components/enrollment-page-skeleton";
import { EnrollmentSelectedConfiguration } from "@/src/features/enrollments/components/enrollment-selected-configuration";
import {
  EnrollmentStudentInfo,
  type EnrollmentStudentInfoHandle,
} from "@/src/features/enrollments/components/enrollment-student-info";
import { useEnrollmentCheckout } from "@/src/features/enrollments/hooks/use-enrollment-checkout";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  isBatchSelectable,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";
import {
  resolveEnrollmentBranchName,
  resolveEnrollmentSchedule,
} from "@/src/features/enrollments/utils/enrollment-configuration.utils";
import {
  readEnrollmentSelection,
  selectionMatchesIds,
} from "@/src/features/enrollments/utils/enrollment-selection-storage";
import { useStudentProfile } from "@/src/features/student/hooks";

type EnrollmentPageView =
  | "checkout"
  | "success"
  | "payment_cancelled";

type BatchValidationError =
  | "not_found"
  | "wrong_course"
  | "wrong_branch"
  | "unavailable";

interface EnrollPageProps {
  slug: string;
}

function useAuthSessionReady() {
  const [authReady, setAuthReady] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthReady(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true);
    });
  }, []);

  const hasSession =
    authReady && Boolean(tokenStorage.getAccessToken()) && isAuthenticated;

  return { authReady, hasSession };
}

export function EnrollPage({ slug }: EnrollPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlBatchId = searchParams.get("batchId") ?? undefined;
  const urlBranchId = searchParams.get("branchId") ?? undefined;
  const urlCourseId = searchParams.get("courseId") ?? undefined;
  const urlBatchTimingId =
    searchParams.get("batchTimingId") ??
    searchParams.get("timingId") ??
    undefined;
  const urlMode = searchParams.get("mode") ?? undefined;

  const { authReady, hasSession } = useAuthSessionReady();
  const authUser = useAuthStore((state) => state.user);
  const { branches: publicBranches } = useBranches();

  const [pageView, setPageView] = useState<EnrollmentPageView>("checkout");
  const [completedEnrollment, setCompletedEnrollment] =
    useState<Enrollment | null>(null);
  const [selectionSnapshot, setSelectionSnapshot] = useState(() =>
    readEnrollmentSelection(),
  );
  const studentInfoRef = useRef<EnrollmentStudentInfoHandle>(null);

  useEffect(() => {
    setSelectionSnapshot(readEnrollmentSelection());
  }, [urlBatchId, urlBranchId, urlBatchTimingId, urlCourseId]);

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
    refetch: refetchStudentProfile,
  } = useStudentProfile({
    enabled: hasSession,
  });

  const {
    completeCheckout,
    isProcessing,
    error: checkoutError,
    clearError,
  } = useEnrollmentCheckout();

  const selectedBatchId = urlBatchId;
  const selectedBranchId = urlBranchId;
  const selectedBatchTimingId = urlBatchTimingId;
  const selectedMode = urlMode;

  const selectedBatch = useMemo(() => {
    if (!selectedBatchId) {
      return null;
    }

    if (fetchedBatch?.id === selectedBatchId) {
      return fetchedBatch;
    }

    return null;
  }, [fetchedBatch, selectedBatchId]);

  const publicBranchNames = useMemo(() => {
    const map = new Map<string, string>();
    publicBranches.forEach((branch) => {
      map.set(branch.id, branch.branchName);
    });
    return map;
  }, [publicBranches]);

  const selectedBranchName = useMemo(
    () =>
      resolveEnrollmentBranchName({
        branchId: selectedBranchId,
        course,
        batch: selectedBatch,
        publicBranchNames,
      }),
    [course, publicBranchNames, selectedBatch, selectedBranchId],
  );

  const matchedSelection = useMemo(() => {
    const snapshot = selectionSnapshot;
    if (
      !selectionMatchesIds(snapshot, {
        courseId: course?.id ?? urlCourseId,
        branchId: selectedBranchId,
        batchId: selectedBatchId,
        batchTimingId: selectedBatchTimingId,
      })
    ) {
      return null;
    }
    return snapshot;
  }, [
    course?.id,
    selectionSnapshot,
    selectedBatchId,
    selectedBatchTimingId,
    selectedBranchId,
    urlCourseId,
  ]);

  const selectedSchedule = useMemo(
    () =>
      resolveEnrollmentSchedule({
        batch: selectedBatch,
        batchTimingId: selectedBatchTimingId,
        mode: selectedMode ?? matchedSelection?.mode,
        timingSnapshot: matchedSelection?.timing ?? null,
      }),
    [
      matchedSelection?.mode,
      matchedSelection?.timing,
      selectedBatch,
      selectedBatchTimingId,
      selectedMode,
    ],
  );

  const isBatchResolving = Boolean(selectedBatchId) && fetchedBatchLoading;

  const batchValidationError = useMemo((): BatchValidationError | null => {
    if (!selectedBatchId || isBatchResolving) {
      return null;
    }

    if (selectedBatch && course && selectedBatch.courseId !== course.id) {
      return "wrong_course";
    }

    if (
      selectedBatch &&
      selectedBranchId &&
      selectedBatch.branchId !== selectedBranchId &&
      !(selectedBatch.assignedBranchIds ?? []).includes(selectedBranchId)
    ) {
      return "wrong_branch";
    }

    if (selectedBatch && !selectedBranchId) {
      return "wrong_branch";
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
    selectedBranchId,
  ]);

  const pricing = selectedBatch
    ? resolveModePricing(
        selectedBatch,
        (selectedSchedule.learningMode ||
          selectedBatch.mode) as BatchMode,
      )
    : null;

  const enrollPath = useMemo(
    () =>
      getCourseEnrollPath(
        { slug },
        {
          batchId: selectedBatchId,
          branchId: selectedBranchId,
          courseId: course?.id ?? urlCourseId,
          batchTimingId: selectedBatchTimingId,
          mode: selectedMode,
        },
      ),
    [
      course?.id,
      selectedBatchId,
      selectedBatchTimingId,
      selectedBranchId,
      selectedMode,
      slug,
      urlCourseId,
    ],
  );

  useEffect(() => {
    if (!authReady || hasSession) {
      return;
    }

    if (courseLoading) {
      return;
    }

    router.replace(getEnrollmentLoginPath(enrollPath));
  }, [authReady, courseLoading, enrollPath, hasSession, router]);

  const checkoutButtonLabel = useMemo(() => {
    if (!pricing) {
      return "Continue";
    }

    if (pricing.isFree) {
      return "Complete Enrollment";
    }

    return `Pay ${formatCurrency(pricing.discountedPrice, pricing.currency)}`;
  }, [pricing]);

  const handlePayNow = async () => {
    if (!course || !selectedBatchId || !selectedBranchId || !selectedBatch) {
      return;
    }

    if (!hasSession) {
      router.replace(getEnrollmentLoginPath(enrollPath));
      return;
    }

    if (!selectedBatchTimingId) {
      appToast.error("Please select a batch timing from the course page.");
      return;
    }

    if (batchValidationError) {
      appToast.error("The selected batch is no longer available.");
      return;
    }

    if (!isBatchSelectable(selectedBatch)) {
      appToast.error(BLOCKED_BATCH_SELECTION_MESSAGE);
      return;
    }

    const synced = await studentInfoRef.current?.syncBeforePayment();
    if (!synced) {
      return;
    }

    await refetchStudentProfile();

    clearError();

    const batchPricing = resolveModePricing(
      selectedBatch,
      (selectedSchedule.learningMode || selectedBatch.mode) as BatchMode,
    );

    if (!selectedBatchTimingId) {
      appToast.error("Please select a batch timing before continuing.");
      return;
    }

    const result = await completeCheckout({
      batchId: selectedBatchId,
      branchId: selectedBranchId,
      courseId: course.id,
      batchTimingId: selectedBatchTimingId,
      isFree: batchPricing.isFree,
    });

    if (!result) {
      return;
    }

    if (result.status === "success_free" || result.status === "success_paid") {
      setCompletedEnrollment(result.enrollment);
      setPageView("success");
      void refetchStudentProfile();
      appToast.success(
        result.status === "success_free"
          ? "Enrollment confirmed successfully."
          : "Payment verified. Your enrollment is confirmed.",
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

  if (
    !authReady ||
    !hasSession ||
    courseLoading ||
    (selectedBatchId && isBatchResolving && !course)
  ) {
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
      : batchValidationError === "wrong_branch"
        ? "This batch is not available at the selected branch."
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
            <Link href="/" className="transition-colors hover:text-[#2563D9]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/courses" className="transition-colors hover:text-[#2563D9]">
              Courses
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/courses?category=${course.categoryId}`}
              className="transition-colors hover:text-[#2563D9]"
            >
              {course.categoryName || "Category"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={getCourseDetailPath(course)}
              className="transition-colors hover:text-[#2563D9]"
            >
              {course.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-900">Enrollment</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.85fr)]">
            <div className="space-y-6">
              <EnrollmentCourseSummary
                course={course}
                learningMode={
                  selectedSchedule.learningMode ?? selectedBatch?.mode ?? null
                }
                batchName={selectedBatch?.name ?? null}
              />

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
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-6 text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
                  >
                    Continue Learning
                  </Link>
                </div>
              ) : !selectedBatchId || !selectedBranchId ? (
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
                        className="mt-3 inline-flex text-sm font-semibold text-[#2563D9] hover:underline"
                      >
                        Choose another batch
                      </Link>
                    </div>
                  ) : null}

                  <EnrollmentStudentInfo
                    ref={studentInfoRef}
                    authUser={authUser}
                    studentProfile={studentProfile}
                    isLoading={profileLoading}
                    profileError={profileError}
                    onProfileSynced={() => {
                      void refetchStudentProfile();
                    }}
                  />
                </>
              )}
            </div>

            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              {selectedBatchId && selectedBranchId ? (
                <EnrollmentSelectedConfiguration
                  course={course}
                  batch={selectedBatch}
                  branchId={selectedBranchId}
                  batchTimingId={selectedBatchTimingId}
                  mode={selectedMode ?? matchedSelection?.mode}
                  branchNameOverride={selectedBranchName}
                  timingSnapshot={matchedSelection?.timing ?? null}
                  isLoading={isBatchResolving}
                  compact
                />
              ) : null}

              <EnrollmentOrderSummary
                selectedBatch={selectedBatch}
                learningMode={selectedSchedule.learningMode}
                isBatchLoading={isBatchResolving}
              />

              {!isAlreadyEnrolled && selectedBatchId && selectedBranchId ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <FormError message={checkoutError ?? undefined} />
                  <Button
                    type="button"
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold hover:from-[#2860D4] hover:to-[#1A3F96]"
                    disabled={
                      !selectedBatchId ||
                      !selectedBranchId ||
                      !selectedBatchTimingId ||
                      Boolean(batchValidationError) ||
                      isBatchResolving ||
                      isProcessing ||
                      !selectedBatch ||
                      !isBatchSelectable(selectedBatch)
                    }
                    loading={isProcessing}
                    onClick={handlePayNow}
                  >
                    {checkoutButtonLabel}
                  </Button>
                  {!pricing?.isFree ? (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      Secure Payment
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
