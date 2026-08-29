"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  ImageOff,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { useCourseBatches } from "@/src/features/batches/hooks/useCourseBatches";
import type { BatchBranch } from "@/src/features/batches/types/batch.types";
import { CourseAvailableBranches } from "@/src/features/courses/components/course-available-branches";
import { CourseBatchCards } from "@/src/features/courses/components/course-batch-cards";
import { CourseCurriculumAccordion } from "@/src/features/courses/components/course-curriculum-accordion";
import { CourseDetailPricingCard } from "@/src/features/courses/components/course-detail-pricing-card";
import { useCourseSummary } from "@/src/features/courses/hooks/use-course";
import type {
  Course,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";
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

  const {
    data: courseTrainers = [],
    isLoading: trainersLoading,
    isError: trainersError,
    refetch: refetchTrainers,
  } = useCourseTrainers(course.id);

  const selectableCourseBatches = useMemo(
    () => (Array.isArray(courseBatches) ? courseBatches : []).filter(isBatchSelectable),
    [courseBatches],
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

  const safeBatches = branchFilteredBatches;
  const safeTrainers = Array.isArray(courseTrainers) ? courseTrainers : [];
  const safeModules = Array.isArray(course.previewModules)
    ? course.previewModules
    : [];

  const moduleCount =
    summary?.modules ?? course.moduleCount ?? safeModules.length;
  const lessonCount = summary?.lessons ?? course.lessonCount ?? 0;
  const trainerCount = summary?.instructors ?? safeTrainers.length;

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

  const courseIncludes = [
    moduleCount > 0
      ? `${moduleCount} Module${moduleCount === 1 ? "" : "s"}`
      : null,
    lessonCount > 0
      ? `${lessonCount} Lesson${lessonCount === 1 ? "" : "s"}`
      : null,
    course.duration
      ? formatDuration(course.duration, course.durationType)
      : null,
    course.level ? formatCourseLevel(course.level) : null,
    trainerCount > 0
      ? `${trainerCount} Trainer${trainerCount === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean) as string[];

  const scrollToAvailableBranches = () => {
    branchesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
      {/* Breadcrumb */}
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
            <span className="font-medium text-slate-900">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero: left = image + info, right = pricing */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-6 sm:px-6 lg:px-8 lg:pt-6">
          <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:items-start lg:gap-8">
            {/* LEFT 70% */}
            <div className="min-w-0">
              <div className="relative h-[220px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-[260px] lg:h-[300px]">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageOff className="h-10 w-10 stroke-[1.4]" />
                    <span className="text-sm font-medium">
                      No Preview Available
                    </span>
                  </div>
                )}

                <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {course.status ?? "ACTIVE"}
                </span>
              </div>

              <div className="mt-5">
                <Badge
                  variant="info"
                  className="rounded-full px-3 py-0.5 text-xs font-medium"
                >
                  {course.categoryName || "Course"}
                </Badge>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {course.title}
                </h1>

                {heroDescription ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {heroDescription}
                  </p>
                ) : null}

                <p className="mt-2 text-sm font-semibold text-blue-600">
                  {course.code}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {course.level ? (
                    <Badge className="border-0 bg-slate-100 px-3 py-0.5 text-xs font-medium uppercase text-slate-700 hover:bg-slate-100">
                      {formatCourseLevel(course.level)}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            {/* RIGHT 30% */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <CourseDetailPricingCard
                course={course}
                summary={summary}
                batchCount={selectableCourseBatches.length}
                sticky={false}
                onPrimaryAction={handleEnroll}
              />
            </aside>
          </div>
        </div>
      </section>

      {/* Main content: modules + sidebar, then tabs */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:items-start lg:gap-8">
          {/* LEFT column */}
          <div className="min-w-0 space-y-6">
            {/* Tabs */}
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
                            ? "text-blue-600"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                        {active ? (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {activeTab === "overview" ? (
                  <OverviewContent
                    description={overviewDescription}
                    learningOutcomes={learningOutcomes}
                  />
                ) : null}

                {activeTab === "curriculum" ? (
                  <CurriculumOverviewContent modules={safeModules} />
                ) : null}

                {activeTab === "instructor" ? (
                  <InstructorContent
                    trainers={safeTrainers}
                    isLoading={trainersLoading}
                    isError={trainersError}
                    onRetry={() => void refetchTrainers()}
                  />
                ) : null}

                {activeTab === "faq" ? <FaqContent /> : null}
              </div>
            </div>

            {/* Course Modules */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-bold text-slate-950">
                  Course Modules
                </h2>
                {safeModules.length > 0 ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {moduleCount} module{moduleCount === 1 ? "" : "s"} ·{" "}
                    {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>
              <div className="p-4 sm:p-5">
                <CourseCurriculumAccordion modules={safeModules} />
              </div>
            </div>
          </div>

          {/* RIGHT sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">
                This Course Includes
              </h2>
              <div className="mt-4 space-y-3">
                {courseIncludes.length > 0 ? (
                  courseIncludes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Course details will be available soon.
                  </p>
                )}
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
                      className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : safeTrainers.length > 0 ? (
                  <div className="space-y-4">
                    {safeTrainers.slice(0, 2).map((trainer) => (
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
                    batches={safeBatches}
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

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/70">
          <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 sm:px-8 lg:flex-row">
            <div className="text-center lg:text-left">
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                Ready to start your learning journey?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select an available branch and batch below to continue enrollment.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleEnroll}
              className="h-11 min-w-[160px] shrink-0 rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {course.isEnrolled ? "Continue Learning" : "Enroll Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function OverviewContent({
  description,
  learningOutcomes,
}: {
  description: string;
  learningOutcomes: string[];
}) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-950">About This Course</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

      {learningOutcomes.length > 0 ? (
        <div className="mt-6 rounded-xl bg-emerald-50/60 p-5">
          <h3 className="text-sm font-bold text-slate-950">
            What You&apos;ll Learn
          </h3>
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
        </div>
      ) : null}
    </div>
  );
}

function CurriculumOverviewContent({
  modules,
}: {
  modules: CoursePreviewModule[];
}) {
  const safeModules = Array.isArray(modules) ? modules : [];

  const sortedModules = [...safeModules].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  if (!sortedModules.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm text-slate-600">
          Curriculum details will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold text-slate-950">Course Curriculum</h2>
      <p className="mt-1 text-sm text-slate-500">
        Module overviews and learning focus areas for this course.
      </p>
      <div className="mt-5 space-y-4">
        {sortedModules.map((module, index) => {
          const lessonCount = Array.isArray(module.lessons)
            ? module.lessons.length
            : 0;
          const keySkills = Array.isArray(module.keySkills)
            ? module.keySkills
            : [];

          return (
            <div
              key={module.id}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Module {index + 1}
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-slate-900">
                {module.title}
              </h3>
              {lessonCount > 0 ? (
                <p className="mt-1 text-xs text-slate-500">
                  {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                </p>
              ) : null}
              {module.description?.trim() ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {module.description.trim()}
                </p>
              ) : null}
              {keySkills.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {keySkills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InstructorContent({
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
  const safeTrainers = Array.isArray(trainers) ? trainers : [];

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
          className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!safeTrainers.length) {
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
      {safeTrainers.map((trainer) => (
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
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-blue-600">
            {trainer.firstName?.charAt(0) ?? "T"}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-950">{fullName}</h3>
          {(trainer.specialization ?? trainer.trainerType) ? (
            <p className="mt-1 text-sm text-blue-600">
              {trainer.specialization ?? trainer.trainerType}
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
        {(trainer.specialization ?? trainer.trainerType) ? (
          <p className="truncate text-xs text-slate-600">
            {trainer.specialization ?? trainer.trainerType}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FaqContent() {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-950">
        Frequently Asked Questions
      </h2>
      <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm text-slate-600">
          FAQ content will be available soon.
        </p>
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
