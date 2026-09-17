"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  ImageOff,
  Layers3,
  PlayCircle,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { useCourseBatches } from "@/src/features/batches/hooks/useCourseBatches";
import type { Batch, BatchBranch } from "@/src/features/batches/types/batch.types";
import { CourseAvailableBranches } from "@/src/features/courses/components/course-available-branches";
import { CourseBatchCards } from "@/src/features/courses/components/course-batch-cards";
import { CourseCurriculumAccordion } from "@/src/features/courses/components/course-curriculum-accordion";
import { CourseDetailPricingCard } from "@/src/features/courses/components/course-detail-pricing-card";
import { CourseFaqAccordion } from "@/src/features/courses/components/course-faq-accordion";
import { CourseFeesSection } from "@/src/features/courses/components/course-fees-section";
import { CourseRatingMeta } from "@/src/features/courses/components/course-rating-meta";
import { CourseUpcomingBatchesSection } from "@/src/features/courses/components/course-upcoming-batches-section";
import {
  useCourseFaqs,
  useCourseSummary,
} from "@/src/features/courses/hooks/use-course";
import type {
  Course,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";
import {
  buildCourseFeesByMode,
  collectBatchTrainerIds,
  isUpcomingBatch,
} from "@/src/features/courses/utils/course-batch.utils";
import {
  formatCourseLevel,
  formatDuration,
  getCourseLearningOutcomes,
} from "@/src/features/courses/utils/course-display.utils";
import { useCourseTrainers } from "@/src/features/trainers/hooks/useCourseTrainers";
import type { Trainer } from "@/src/features/trainers/types/trainer.types";
import { isBatchSelectable } from "@/src/features/enrollments/utils/enrollment-batch.utils";

interface CourseDetailsProps {
  course: Course;
}

type DetailTab = "overview" | "curriculum" | "instructor" | "faq";

function formatCourseStatus(status: string | null | undefined): string {
  if (!status) {
    return "Active";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const router = useRouter();
  const branchesSectionRef = useRef<HTMLDivElement>(null);
  const batchesSectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [selectedBranchId, setSelectedBranchId] = useState<string>();

  const { batches: courseBatches, isLoading: courseBatchesLoading } =
    useCourseBatches(course.id);
  const { batches: branchBatches, isLoading: branchBatchesLoading } =
    useCourseBatches(course.id, selectedBranchId, Boolean(selectedBranchId));
  const { data: summary } = useCourseSummary(course.id);
  const { data: faqs = [], isLoading: faqsLoading } = useCourseFaqs(course.id);
  const {
    data: courseTrainers = [],
    isLoading: trainersLoading,
    isError: trainersError,
    refetch: refetchTrainers,
  } = useCourseTrainers(course.id);

  const upcomingBatches = useMemo(
    () => (Array.isArray(courseBatches) ? courseBatches : []).filter(isUpcomingBatch),
    [courseBatches],
  );

  const selectableCourseBatches = useMemo(
    () => upcomingBatches.filter(isBatchSelectable),
    [upcomingBatches],
  );

  const branchFilteredBatches = useMemo(
    () =>
      (Array.isArray(branchBatches) ? branchBatches : []).filter(
        (batch) => !selectedBranchId || batch.branchId === selectedBranchId,
      ),
    [branchBatches, selectedBranchId],
  );

  const availableBranches = useMemo(() => {
    const byId = new Map<string, BatchBranch>();

    for (const batch of selectableCourseBatches) {
      const branchId = batch.branchId ?? batch.branch?.id;
      if (!branchId) {
        continue;
      }

      byId.set(branchId, {
        id: branchId,
        branchName: batch.branch?.branchName ?? "Branch",
        branchCode: batch.branch?.branchCode ?? "",
      });
    }

    return Array.from(byId.values());
  }, [selectableCourseBatches]);

  useEffect(() => {
    if (!selectedBranchId && availableBranches.length === 1) {
      setSelectedBranchId(availableBranches[0].id);
      return;
    }

    if (
      selectedBranchId &&
      availableBranches.length > 0 &&
      !availableBranches.some((branch) => branch.id === selectedBranchId)
    ) {
      setSelectedBranchId(undefined);
    }
  }, [availableBranches, selectedBranchId]);

  const safeModules = Array.isArray(course.previewModules)
    ? course.previewModules
    : [];

  const moduleCount =
    summary?.modules ?? course.moduleCount ?? safeModules.length;
  const lessonCount = summary?.lessons ?? course.lessonCount ?? 0;
  const resourceCount = course.resourceCount ?? 0;
  const quizCount = summary?.quizzes ?? course.quizCount ?? 0;

  const feesByMode = useMemo(
    () => buildCourseFeesByMode(upcomingBatches),
    [upcomingBatches],
  );

  const batchTrainerIds = useMemo(
    () => new Set(collectBatchTrainerIds(upcomingBatches)),
    [upcomingBatches],
  );

  const displayTrainers = useMemo(() => {
    const trainers = Array.isArray(courseTrainers) ? courseTrainers : [];

    if (batchTrainerIds.size === 0) {
      return trainers;
    }

    const matched = trainers.filter((trainer) => batchTrainerIds.has(trainer.id));

    return matched.length > 0 ? matched : trainers;
  }, [batchTrainerIds, courseTrainers]);

  const heroDescription =
    course.tagline?.trim() || course.shortDescription?.trim() || null;

  const overviewDescription =
    course.description?.trim() ||
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    "Course overview will be available soon.";

  const learningOutcomes = useMemo(
    () => getCourseLearningOutcomes(safeModules),
    [safeModules],
  );

  const courseHighlights = useMemo(() => {
    const highlights: string[] = [];

    if (course.level) {
      highlights.push(`${formatCourseLevel(course.level)} level course`);
    }

    if (course.language) {
      highlights.push(`Delivered in ${course.language}`);
    }

    if (course.selfPacedVideoCount > 0 || course.liveRecordedVideoCount > 0) {
      highlights.push("Recorded and live learning content included");
    }

    if (quizCount > 0) {
      highlights.push(`${quizCount} assessment${quizCount === 1 ? "" : "s"} included`);
    }

    if (summary?.branches && summary.branches > 0) {
      highlights.push(`Available across ${summary.branches} branch${summary.branches === 1 ? "" : "es"}`);
    }

    return highlights;
  }, [course, quizCount, summary?.branches]);

  const heroStats = [
    {
      label: "Modules",
      value: moduleCount > 0 ? String(moduleCount) : "—",
      icon: Layers3,
    },
    {
      label: "Lessons",
      value: lessonCount > 0 ? String(lessonCount) : "—",
      icon: BookOpen,
    },
    {
      label: "Resources",
      value: resourceCount > 0 ? String(resourceCount) : "—",
      icon: FileText,
    },
    {
      label: "Duration",
      value: course.duration
        ? formatDuration(course.duration, course.durationType)
        : "—",
      icon: Clock3,
    },
  ];

  const scrollToAvailableBranches = () => {
    branchesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleEnquire = () => {
    router.push(
      `/contact?course=${encodeURIComponent(course.slug)}&courseId=${course.id}`,
    );
  };

  const handleEnroll = () => {
    if (course.isEnrolled) {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    scrollToAvailableBranches();
  };

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "faq", label: "FAQ" },
  ];

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
            <span className="font-medium text-slate-900">{course.title}</span>
          </nav>
        </div>
      </div>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-6 sm:px-6 lg:px-8 lg:pt-6">
          <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:items-start lg:gap-8">
            <div className="min-w-0">
              <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
                <div className="relative h-[180px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[200px] lg:h-[220px]">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                      <ImageOff className="h-8 w-8 stroke-[1.4]" />
                      <span className="text-sm font-medium">No Preview Available</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="info"
                      className="rounded-full px-3 py-0.5 text-xs font-medium"
                    >
                      {course.categoryName || "Course"}
                    </Badge>
                    <Badge className="border-0 bg-emerald-50 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 hover:bg-emerald-50">
                      {formatCourseStatus(course.status)}
                    </Badge>
                  </div>

                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {course.title}
                  </h1>

                  {heroDescription ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      {heroDescription}
                    </p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <CourseRatingMeta
                      rating={course.averageRating}
                      totalReviews={course.totalReviews}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-600"
                      emptyClassName="text-sm text-slate-400"
                    />
                    {course.code ? (
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#2563D9]">
                        {course.code}
                      </span>
                    ) : null}
                    {course.level ? (
                      <Badge className="border-0 bg-slate-100 px-3 py-0.5 text-xs font-medium uppercase text-slate-700 hover:bg-slate-100">
                        {formatCourseLevel(course.level)}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {heroStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-3"
                      >
                        <div className="flex items-center gap-2 text-[#2563D9]">
                          <stat.icon className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                            {stat.label}
                          </span>
                        </div>
                        <p className="mt-1 text-lg font-bold text-[#0B1F3A]">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 lg:hidden">
                    <Button
                      type="button"
                      onClick={handleEnquire}
                      className="h-11 rounded-xl px-5 text-sm font-semibold"
                    >
                      {course.isEnrolled ? "Continue Learning" : "Enquire Now"}
                    </Button>
                    {!course.isEnrolled ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEnroll}
                        className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold text-[#2563D9]"
                      >
                        Enroll Now
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
              <CourseDetailPricingCard
                course={course}
                batchCount={selectableCourseBatches.length}
                sticky={false}
                onPrimaryAction={handleEnquire}
                onSecondaryAction={handleEnroll}
              />
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 sm:px-6">
                <div className="flex items-center gap-6 overflow-x-auto">
                  {tabs.map((tab) => {
                    const active = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative shrink-0 py-3.5 text-sm font-medium transition-colors ${
                          active
                            ? "text-[#2563D9]"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                        {active ? (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#2563D9] to-[#1746A2]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {activeTab === "overview" ? (
                  <OverviewTabContent
                    description={overviewDescription}
                    learningOutcomes={learningOutcomes}
                    highlights={courseHighlights}
                    moduleCount={moduleCount}
                    lessonCount={lessonCount}
                    resourceCount={resourceCount}
                    quizCount={quizCount}
                    videoCount={
                      course.selfPacedVideoCount + course.liveRecordedVideoCount
                    }
                    batchCount={selectableCourseBatches.length}
                    branchCount={summary?.branches ?? availableBranches.length}
                    durationLabel={
                      course.duration
                        ? formatDuration(course.duration, course.durationType)
                        : "—"
                    }
                    feesByMode={feesByMode}
                    feesLoading={courseBatchesLoading}
                    upcomingBatches={upcomingBatches}
                    courseSlug={course.slug}
                    courseId={course.id}
                    batchesLoading={courseBatchesLoading}
                  />
                ) : null}

                {activeTab === "curriculum" ? (
                  <CurriculumTabContent
                    modules={safeModules}
                    moduleCount={moduleCount}
                    lessonCount={lessonCount}
                  />
                ) : null}

                {activeTab === "instructor" ? (
                  <InstructorTabContent
                    trainers={displayTrainers}
                    isLoading={trainersLoading}
                    isError={trainersError}
                    onRetry={() => void refetchTrainers()}
                  />
                ) : null}

                {activeTab === "faq" ? (
                  <div>
                    <h2 className="text-base font-bold text-slate-950">
                      Frequently Asked Questions
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Answers to common questions about this course.
                    </p>
                    <div className="mt-5">
                      <CourseFaqAccordion faqs={faqs} isLoading={faqsLoading} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">
                This Course Includes
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  moduleCount > 0
                    ? `${moduleCount} structured module${moduleCount === 1 ? "" : "s"}`
                    : null,
                  lessonCount > 0
                    ? `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} and topics`
                    : null,
                  resourceCount > 0
                    ? `${resourceCount} downloadable resource${resourceCount === 1 ? "" : "s"}`
                    : null,
                  quizCount > 0
                    ? `${quizCount} quiz${quizCount === 1 ? "" : "zes"}`
                    : null,
                  course.duration
                    ? `${formatDuration(course.duration, course.durationType)} program duration`
                    : null,
                ]
                  .filter(Boolean)
                  .map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2563D9]" />
                      <span>{item}</span>
                    </div>
                  ))}
                {moduleCount === 0 &&
                lessonCount === 0 &&
                resourceCount === 0 ? (
                  <p className="text-sm text-slate-500">
                    Course details will be available soon.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">Instructor</h2>
              <div className="mt-4">
                {trainersLoading ? (
                  <SidebarTrainerSkeleton />
                ) : trainersError ? (
                  <div>
                    <p className="text-sm text-slate-500">
                      Unable to load instructor.
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetchTrainers()}
                      className="mt-2 text-sm font-semibold text-[#2563D9] hover:text-[#1746A2]"
                    >
                      Retry
                    </button>
                  </div>
                ) : displayTrainers.length > 0 ? (
                  <div className="space-y-4">
                    {displayTrainers.slice(0, 2).map((trainer) => (
                      <SidebarTrainerCard key={trainer.id} trainer={trainer} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <GraduationCap className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">
                      Instructor information will be available soon.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              id="available-branches"
              ref={branchesSectionRef}
              className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 className="text-base font-bold text-slate-950">
                Available Branches
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a branch to view batches for this course.
              </p>
              <div className="mt-4">
                <CourseAvailableBranches
                  branches={availableBranches}
                  selectedBranchId={selectedBranchId}
                  isLoading={courseBatchesLoading}
                  onSelect={(branchId) => {
                    setSelectedBranchId(branchId);
                    window.requestAnimationFrame(() => {
                      batchesSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    });
                  }}
                />
              </div>
            </div>

            {selectedBranchId ? (
              <div
                id="available-batches"
                ref={batchesSectionRef}
                className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5"
              >
                <h2 className="text-base font-bold text-slate-950">
                  Available Batches
                </h2>
                <div className="mt-4">
                  <CourseBatchCards
                    batches={branchFilteredBatches}
                    isLoading={branchBatchesLoading}
                    courseSlug={course.slug}
                    courseId={course.id}
                    branchId={selectedBranchId}
                    variant="list"
                  />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/70">
          <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 sm:px-8 lg:flex-row">
            <div className="text-center lg:text-left">
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                Ready to start your learning journey?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Enquire now or select an available branch and batch to continue enrollment.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={handleEnquire}
                className="h-11 min-w-[160px] shrink-0 rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-7 text-sm font-semibold text-white hover:from-[#1E58C7] hover:to-[#123D94]"
              >
                Enquire Now
              </Button>
              {!course.isEnrolled ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEnroll}
                  className="h-11 min-w-[160px] rounded-lg border-slate-200 bg-white px-7 text-sm font-semibold text-[#2563D9]"
                >
                  Enroll Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function OverviewTabContent({
  description,
  learningOutcomes,
  highlights,
  moduleCount,
  lessonCount,
  resourceCount,
  quizCount,
  videoCount,
  batchCount,
  branchCount,
  durationLabel,
  feesByMode,
  feesLoading,
  upcomingBatches,
  courseSlug,
  courseId,
  batchesLoading,
}: {
  description: string;
  learningOutcomes: string[];
  highlights: string[];
  moduleCount: number;
  lessonCount: number;
  resourceCount: number;
  quizCount: number;
  videoCount: number;
  batchCount: number;
  branchCount: number;
  durationLabel: string;
  feesByMode: ReturnType<typeof buildCourseFeesByMode>;
  feesLoading: boolean;
  upcomingBatches: Batch[];
  courseSlug: string;
  courseId: string;
  batchesLoading: boolean;
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-bold text-slate-950">About This Course</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </section>

      {learningOutcomes.length > 0 ? (
        <section className="rounded-xl bg-emerald-50/60 p-5">
          <h3 className="text-sm font-bold text-slate-950">What You&apos;ll Learn</h3>
          <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {learningOutcomes.map((outcome) => (
              <div
                key={outcome}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {highlights.length > 0 ? (
        <section>
          <h3 className="text-sm font-bold text-slate-950">Course Highlights</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700"
              >
                {highlight}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-sm font-bold text-slate-950">Course Structure</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Modules", value: moduleCount, icon: Layers3 },
            { label: "Lessons", value: lessonCount, icon: BookOpen },
            { label: "Resources", value: resourceCount, icon: FileText },
            { label: "Quizzes", value: quizCount, icon: HelpCircle },
            { label: "Videos", value: videoCount, icon: PlayCircle },
            { label: "Duration", value: durationLabel, icon: Clock3 },
            { label: "Upcoming Batches", value: batchCount, icon: GraduationCap },
            { label: "Branches", value: branchCount, icon: CheckCircle2 },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-[#2563D9]">
                <item.icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-[#0B1F3A]">
                {typeof item.value === "number" && item.value <= 0 ? "—" : item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563D9]">
            Pricing
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-950">
            Fees & Learning Modes
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Pricing is shown only for learning modes configured on upcoming batches.
          </p>
        </div>
        <CourseFeesSection rows={feesByMode} isLoading={feesLoading} />
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563D9]">
            Schedule
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-950">
            Upcoming Batches & Timings
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Each timing is listed individually. Batch names span all related rows.
          </p>
        </div>
        <CourseUpcomingBatchesSection
          batches={upcomingBatches}
          courseSlug={courseSlug}
          courseId={courseId}
          isLoading={batchesLoading}
        />
      </section>
    </div>
  );
}

function CurriculumTabContent({
  modules,
  moduleCount,
  lessonCount,
}: {
  modules: CoursePreviewModule[];
  moduleCount: number;
  lessonCount: number;
}) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-950">Course Curriculum</h2>
      <p className="mt-1 text-sm text-slate-500">
        {moduleCount} module{moduleCount === 1 ? "" : "s"} · {lessonCount} lesson
        {lessonCount === 1 ? "" : "s"}
      </p>
      <div className="mt-5">
        <CourseCurriculumAccordion modules={modules} />
      </div>
    </div>
  );
}

function InstructorTabContent({
  trainers,
  isLoading,
  isError,
  onRetry,
}: {
  trainers: Trainer[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <TrainerTabSkeleton />
        <TrainerTabSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Unable to load instructor information.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-semibold text-[#2563D9] hover:text-[#1746A2]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trainers.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">
          Instructor information will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trainers.map((trainer) => (
        <TrainerTabCard key={trainer.id} trainer={trainer} />
      ))}
    </div>
  );
}

function TrainerTabCard({ trainer }: { trainer: Trainer }) {
  const fullName = `${trainer.firstName} ${trainer.lastName}`.trim();

  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        {trainer.profileImageUrl ? (
          <img
            src={trainer.profileImageUrl}
            alt={fullName}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-[#2563D9]">
            {trainer.firstName?.charAt(0) ?? "T"}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-950">{fullName}</h3>
          {trainer.qualification ? (
            <p className="mt-1 text-sm text-slate-600">{trainer.qualification}</p>
          ) : null}
          {(trainer.specialization ?? trainer.trainerType) ? (
            <p className="mt-1 text-sm text-[#2563D9]">
              {trainer.specialization ?? trainer.trainerType}
            </p>
          ) : null}
          {trainer.experienceYears > 0 ? (
            <p className="mt-1 text-xs text-slate-500">
              {trainer.experienceYears}+ years experience
            </p>
          ) : null}
          {trainer.bio ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{trainer.bio}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SidebarTrainerCard({ trainer }: { trainer: Trainer }) {
  const fullName = `${trainer.firstName} ${trainer.lastName}`.trim();

  return (
    <div className="flex items-center gap-3">
      {trainer.profileImageUrl ? (
        <img
          src={trainer.profileImageUrl}
          alt={fullName}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
          {trainer.firstName?.charAt(0) ?? "T"}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{fullName}</p>
        {(trainer.specialization ?? trainer.qualification ?? trainer.trainerType) ? (
          <p className="truncate text-xs text-slate-600">
            {trainer.specialization ?? trainer.qualification ?? trainer.trainerType}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SidebarTrainerSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function TrainerTabSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
