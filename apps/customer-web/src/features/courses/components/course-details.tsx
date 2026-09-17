"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  GraduationCap,
  Home,
  ImageOff,
  IndianRupee,
  Languages,
  LayoutDashboard,
  Monitor,
  Share2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourseBatches } from "@/src/features/batches/hooks/useCourseBatches";
import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import { CourseCurriculumAccordion } from "@/src/features/courses/components/course-curriculum-accordion";
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
  CourseFaq,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";
import {
  buildCourseFeesByMode,
  collectBatchTrainerIds,
  COURSE_MODE_ORDER,
  isUpcomingBatch,
  type CourseModeFeeRow,
} from "@/src/features/courses/utils/course-batch.utils";
import {
  formatCourseLevel,
  formatDuration,
  getCourseLearningOutcomes,
} from "@/src/features/courses/utils/course-display.utils";
import { getCourseEnrollPath } from "@/src/features/courses/utils/course-route.utils";
import {
  formatCourseRatingCountLabel,
  formatCourseRatingValue,
  hasCourseRating,
} from "@/src/features/courses/utils/course-rating.utils";
import { isBatchSelectable } from "@/src/features/enrollments/utils/enrollment-batch.utils";
import { useCourseTrainers } from "@/src/features/trainers/hooks/useCourseTrainers";
import type { Trainer } from "@/src/features/trainers/types/trainer.types";

interface CourseDetailsProps {
  course: Course;
}

type DetailTab =
  | "overview"
  | "curriculum"
  | "fees"
  | "batches"
  | "instructors"
  | "reviews"
  | "faq";

const TABS: {
  id: DetailTab;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "fees", label: "Fees", icon: IndianRupee },
  { id: "batches", label: "Batch Timings", icon: Clock3 },
  { id: "instructors", label: "Instructors", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "faq", label: "FAQ", icon: CircleHelp },
];

const HERO_FEATURES = [
  {
    icon: BookOpen,
    title: "Practical Learning",
    description: "Hands-on training",
  },
  {
    icon: Monitor,
    title: "Online & Offline",
    description: "Flexible learning",
  },
  {
    icon: Award,
    title: "Certificate",
    description: "Upon completion",
  },
  {
    icon: Briefcase,
    title: "Placement Support",
    description: "Career guidance",
  },
] as const;

function formatCourseStatus(status: string | null | undefined): string {
  if (!status) {
    return "Active";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveModesLabel(modes: BatchMode[]): string {
  const hasOffline = modes.includes("OFFLINE");
  const hasOnline = modes.includes("ONLINE");
  const hasRecorded = modes.includes("RECORDED");

  if (hasOffline && hasOnline) {
    return "Online & Offline";
  }

  if (hasOffline) {
    return "Offline";
  }

  if (hasOnline) {
    return "Online";
  }

  if (hasRecorded) {
    return "Self-Paced";
  }

  return "Flexible";
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash === "#batch-timings") {
      setActiveTab("batches");
      window.requestAnimationFrame(() => {
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  const { batches: courseBatches, isLoading: courseBatchesLoading } =
    useCourseBatches(course.id);
  const { data: summary } = useCourseSummary(course.id);
  const { data: faqs = [], isLoading: faqsLoading } = useCourseFaqs(course.id);
  const {
    data: courseTrainers = [],
    isLoading: trainersLoading,
    isError: trainersError,
    refetch: refetchTrainers,
  } = useCourseTrainers(course.id);

  const upcomingBatches = useMemo(
    () =>
      (Array.isArray(courseBatches) ? courseBatches : []).filter(
        isUpcomingBatch,
      ),
    [courseBatches],
  );

  const selectableCourseBatches = useMemo(
    () => upcomingBatches.filter(isBatchSelectable),
    [upcomingBatches],
  );

  const configuredModes = useMemo(() => {
    const modes = new Set<BatchMode>();

    upcomingBatches.forEach((batch) => {
      const timings = (batch.timings ?? []).filter(
        (timing) => timing.isActive && timing.status === "UPCOMING",
      );

      if (timings.length > 0) {
        timings.forEach((timing) => modes.add(timing.mode));
      } else {
        modes.add(batch.mode);
      }
    });

    return COURSE_MODE_ORDER.filter((mode) => modes.has(mode));
  }, [upcomingBatches]);

  const modesLabel = resolveModesLabel(configuredModes);

  const safeModules = Array.isArray(course.previewModules)
    ? course.previewModules
    : [];

  const moduleCount =
    summary?.modules ?? course.moduleCount ?? safeModules.length;
  const lessonCount = summary?.lessons ?? course.lessonCount ?? 0;
  const durationLabel = course.duration
    ? formatDuration(course.duration, course.durationType)
    : null;

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
    const byId = new Map<string, Trainer>();

    const source =
      batchTrainerIds.size > 0
        ? trainers.filter((trainer) => batchTrainerIds.has(trainer.id))
        : trainers;

    (source.length > 0 ? source : trainers).forEach((trainer) => {
      byId.set(trainer.id, trainer);
    });

    return Array.from(byId.values());
  }, [batchTrainerIds, courseTrainers]);

  const tagline = course.tagline?.trim() || null;
  const shortDescription = course.shortDescription?.trim() || null;
  const overviewDescription =
    course.description?.trim() ||
    shortDescription ||
    tagline ||
    "Course overview will be available soon.";

  const learningOutcomes = useMemo(
    () => getCourseLearningOutcomes(safeModules),
    [safeModules],
  );

  const skillsCovered = useMemo(() => {
    const skills = safeModules.flatMap((module) =>
      Array.isArray(module.keySkills) ? module.keySkills : [],
    );

    return [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))];
  }, [safeModules]);

  const courseHighlights = useMemo(() => {
    const highlights: string[] = [];

    if (course.level) {
      highlights.push(`${formatCourseLevel(course.level)} level curriculum`);
    }

    if (course.language) {
      highlights.push(`Delivered in ${course.language}`);
    }

    if (moduleCount > 0) {
      highlights.push(
        `${moduleCount} structured module${moduleCount === 1 ? "" : "s"}`,
      );
    }

    if (lessonCount > 0) {
      highlights.push(
        `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} and topics`,
      );
    }

    if (selectableCourseBatches.length > 0) {
      highlights.push(
        `${selectableCourseBatches.length} upcoming batch${selectableCourseBatches.length === 1 ? "" : "es"} open for enrollment`,
      );
    }

    return highlights;
  }, [
    course.language,
    course.level,
    lessonCount,
    moduleCount,
    selectableCourseBatches.length,
  ]);

  const firstJoinHref = useMemo(() => {
    const batch = selectableCourseBatches[0];
    if (!batch) {
      return null;
    }

    return getCourseEnrollPath(
      { slug: course.slug },
      {
        batchId: batch.id,
        branchId: batch.branchId ?? undefined,
        courseId: course.id,
      },
    );
  }, [course.id, course.slug, selectableCourseBatches]);

  const scrollToTabs = () => {
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEnroll = () => {
    if (course.isEnrolled) {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    if (firstJoinHref) {
      router.push(firstJoinHref);
      return;
    }

    setActiveTab("batches");
    window.requestAnimationFrame(scrollToTabs);
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : undefined;

    if (!url) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: course.title,
          text: tagline ?? course.title,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      appToast.success("Course link copied");
    } catch {
      appToast.error("Unable to share right now");
    }
  };

  const setTab = (tab: DetailTab) => {
    setActiveTab(tab);
    window.requestAnimationFrame(scrollToTabs);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#EEF4FF_0%,#F8FBFF_42%,#FFFFFF_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,217,0.10),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-3 lg:px-8 lg:pb-12">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[#2563D9]"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href="/courses" className="transition-colors hover:text-[#2563D9]">
              Courses
            </Link>
            {course.categoryName ? (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <Link
                  href={`/courses?category=${course.categoryId}`}
                  className="transition-colors hover:text-[#2563D9]"
                >
                  {course.categoryName}
                </Link>
              </>
            ) : null}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-semibold text-[#0B1F3A]">{course.title}</span>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* Left */}
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#E8F0FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563D9]">
                  {course.categoryName || "Course"}
                </span>

                {course.level ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1E6] px-3 py-1 text-[11px] font-semibold text-[#B45309]">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {formatCourseLevel(course.level)}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-[11px] font-semibold text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {formatCourseStatus(course.status)}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                {course.title}
              </h1>

              {tagline ? (
                <p className="mt-3 text-base font-medium leading-7 text-[#1E3A5F] sm:text-lg sm:leading-8">
                  {tagline}
                </p>
              ) : null}

              {shortDescription && shortDescription !== tagline ? (
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">
                  {shortDescription}
                </p>
              ) : !tagline && overviewDescription ? (
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">
                  {overviewDescription.length > 220
                    ? `${overviewDescription.slice(0, 220).trim()}…`
                    : overviewDescription}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                <CourseRatingMeta
                  rating={course.averageRating}
                  totalReviews={course.totalReviews}
                  className="inline-flex items-center gap-1.5"
                  emptyClassName="text-sm text-slate-400"
                />

                {course.code && course.code !== "—" ? (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold tracking-wide text-slate-500">
                      {course.code}
                    </span>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex items-center gap-1.5 font-medium text-[#2563D9] transition hover:text-[#1746A2]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
                {HERO_FEATURES.map((feature) => (
                  <div key={feature.title} className="min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#2563D9]">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-[#0B1F3A]">
                      {feature.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

           {/* Right — image */}
<div className="relative">
  <div className="relative aspect-[16/13] overflow-hidden rounded-[1.5rem] border border-white/70 bg-slate-100 shadow-[0_24px_60px_-28px_rgba(11,31,58,0.45)] sm:aspect-[16/11] lg:aspect-[16/10]">
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

    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/55 via-transparent to-transparent" />

    {/* Bottom info pills */}
    <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2 sm:inset-x-4 sm:bottom-4">
      {durationLabel ? (
        <HeroPill icon={Clock3} label={durationLabel} />
      ) : null}

      <HeroPill icon={Monitor} label={modesLabel} />

      {course.level ? (
        <HeroPill
          icon={GraduationCap}
          label={formatCourseLevel(course.level)}
        />
      ) : null}

      {course.language ? (
        <HeroPill icon={Languages} label={course.language} />
      ) : null}
    </div>
  </div>
</div>
          </div>
        </div>
      </section>

      {/* Sticky tabs */}
      <div
        id="batch-timings"
        ref={tabsRef}
        className="sticky top-[76px] z-30 scroll-mt-[76px] border-y border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-2 rounded-t-lg px-3.5 py-3.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#EAF1FF] text-[#2563D9]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0B1F3A]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {active ? (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[#2563D9]" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            onClick={handleEnroll}
            className="hidden h-10 shrink-0 rounded-xl bg-[#0B1F3A] px-5 text-sm font-semibold text-white hover:bg-[#132a4a] sm:inline-flex"
          >
            {course.isEnrolled ? "Continue Learning" : "Enroll Now"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {activeTab === "overview" ? (
          <OverviewPanel
            description={overviewDescription}
            learningOutcomes={learningOutcomes}
            skillsCovered={skillsCovered}
            highlights={courseHighlights}
            moduleCount={moduleCount}
            lessonCount={lessonCount}
            durationLabel={durationLabel}
            level={course.level}
            language={course.language}
          />
        ) : null}

        {activeTab === "curriculum" ? (
          <CurriculumPanel
            modules={safeModules}
            moduleCount={moduleCount}
            lessonCount={lessonCount}
          />
        ) : null}

        {activeTab === "fees" ? (
          <FeesPanel
            rows={feesByMode}
            isLoading={courseBatchesLoading}
            onJoin={handleEnroll}
            joinHref={firstJoinHref}
          />
        ) : null}

        {activeTab === "batches" ? (
          <BatchesPanel
            batches={upcomingBatches}
            courseSlug={course.slug}
            courseId={course.id}
            isLoading={courseBatchesLoading}
          />
        ) : null}

        {activeTab === "instructors" ? (
          <InstructorsPanel
            trainers={displayTrainers}
            isLoading={trainersLoading}
            isError={trainersError}
            onRetry={() => void refetchTrainers()}
          />
        ) : null}

        {activeTab === "reviews" ? (
          <ReviewsPanel
            rating={course.averageRating}
            totalReviews={course.totalReviews}
          />
        ) : null}

        {activeTab === "faq" ? (
          <FaqPanel faqs={faqs} isLoading={faqsLoading} />
        ) : null}

        {/* Mobile enroll CTA */}
        <div className="mt-10 sm:hidden">
          <Button
            type="button"
            onClick={handleEnroll}
            className="h-12 w-full rounded-xl bg-[#0B1F3A] text-sm font-semibold text-white hover:bg-[#132a4a]"
          >
            {course.isEnrolled ? "Continue Learning" : "Enroll Now"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function HeroPill({
  icon: Icon,
  label,
}: {
  icon: typeof Clock3;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#0B1F3A] shadow-sm backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-[#2563D9]" />
      {label}
    </span>
  );
}

function OverviewPanel({
  description,
  learningOutcomes,
  skillsCovered,
  highlights,
  moduleCount,
  lessonCount,
  durationLabel,
  level,
  language,
}: {
  description: string;
  learningOutcomes: string[];
  skillsCovered: string[];
  highlights: string[];
  moduleCount: number;
  lessonCount: number;
  durationLabel: string | null;
  level: Course["level"];
  language: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
          About
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
          About this course
        </h2>
        <p className="mt-4 text-[15px] leading-8 text-slate-600 whitespace-pre-line">
          {description}
        </p>
      </section>

      {learningOutcomes.length > 0 ? (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
            Outcomes
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
            What you will learn
          </h2>
          <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {learningOutcomes.map((outcome) => (
              <li
                key={outcome}
                className="flex items-start gap-3 text-[15px] leading-7 text-slate-700"
              >
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#2563D9]" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {skillsCovered.length > 0 ? (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
            Skills
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
            Skills covered
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {skillsCovered.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full border border-[#D6E4FF] bg-[#F3F7FF] px-3.5 py-1.5 text-sm font-medium text-[#1E4ED8]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {highlights.length > 0 ? (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
            Highlights
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
            Course highlights
          </h2>
          <div className="mt-6 space-y-3 border-l-2 border-[#2563D9]/25 pl-5">
            {highlights.map((highlight) => (
              <p key={highlight} className="text-[15px] leading-7 text-slate-700">
                {highlight}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
          Snapshot
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
          Course at a glance
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Modules", value: moduleCount > 0 ? String(moduleCount) : null },
            { label: "Lessons", value: lessonCount > 0 ? String(lessonCount) : null },
            { label: "Duration", value: durationLabel },
            {
              label: "Level",
              value: level ? formatCourseLevel(level) : null,
            },
            { label: "Language", value: language || null },
          ]
            .filter((item) => item.value)
            .map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3"
              >
                <dt className="text-sm text-slate-500">{item.label}</dt>
                <dd className="text-sm font-semibold text-[#0B1F3A]">
                  {item.value}
                </dd>
              </div>
            ))}
        </dl>
      </section>
    </div>
  );
}

function CurriculumPanel({
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
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
        Syllabus
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
        Course curriculum
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {moduleCount} module{moduleCount === 1 ? "" : "s"} · {lessonCount}{" "}
        lesson{lessonCount === 1 ? "" : "s"}
      </p>
      <div className="mt-8">
        <CourseCurriculumAccordion modules={modules} />
      </div>
    </div>
  );
}

function FeesPanel({
  rows,
  isLoading,
  onJoin,
  joinHref,
}: {
  rows: CourseModeFeeRow[];
  isLoading: boolean;
  onJoin: () => void;
  joinHref: string | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
        Pricing
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
        Fees & learning modes
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Pricing is shown only for learning modes configured on upcoming batches.
      </p>
      <div className="mt-8">
        <CourseFeesSection
          rows={rows}
          isLoading={isLoading}
          onJoin={onJoin}
          joinHref={joinHref}
        />
      </div>
    </div>
  );
}

function BatchesPanel({
  batches,
  courseSlug,
  courseId,
  isLoading,
}: {
  batches: Batch[];
  courseSlug: string;
  courseId: string;
  isLoading: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
        Schedule
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
        Upcoming batches & timings
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Each timing is listed as its own row. Parent batch names span all related
        timings.
      </p>
      <div className="mt-8">
        <CourseUpcomingBatchesSection
          batches={batches}
          courseSlug={courseSlug}
          courseId={courseId}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function InstructorsPanel({
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
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
        Faculty
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
        Instructors
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Trainers associated with upcoming batches for this course.
      </p>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-6">
            <InstructorSkeleton />
            <InstructorSkeleton />
          </div>
        ) : isError ? (
          <div className="py-8">
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
        ) : trainers.length === 0 ? (
          <p className="py-8 text-sm text-slate-500">
            Instructor information will be available soon.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {trainers.map((trainer) => (
              <InstructorRow key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InstructorRow({ trainer }: { trainer: Trainer }) {
  const fullName = `${trainer.firstName} ${trainer.lastName}`.trim();

  return (
    <div className="flex gap-5 py-6 first:pt-0 last:pb-0">
      {trainer.profileImageUrl ? (
        <img
          src={trainer.profileImageUrl}
          alt={fullName}
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F4F8FC] text-lg font-bold text-[#2563D9] ring-1 ring-slate-200">
          {trainer.firstName?.charAt(0) ?? "T"}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-[#0B1F3A]">{fullName}</h3>
        {trainer.qualification ? (
          <p className="mt-1 text-sm text-slate-600">{trainer.qualification}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          {(trainer.specialization ?? trainer.trainerType) ? (
            <span className="font-medium text-[#2563D9]">
              {trainer.specialization ?? trainer.trainerType}
            </span>
          ) : null}
          {trainer.experienceYears > 0 ? (
            <span>{trainer.experienceYears}+ years experience</span>
          ) : null}
        </div>
        {trainer.bio ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {trainer.bio}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function InstructorSkeleton() {
  return (
    <div className="flex gap-5">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
    </div>
  );
}

function ReviewsPanel({
  rating,
  totalReviews,
}: {
  rating: number;
  totalReviews: number;
}) {
  const hasRating = hasCourseRating(rating, totalReviews);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
        Feedback
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
        Reviews
      </h2>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F8FBFF] px-6 py-8">
        {hasRating ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
              <span className="text-3xl font-bold text-[#0B1F3A]">
                {formatCourseRatingValue(rating)}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1F3A]">
                {formatCourseRatingCountLabel(totalReviews)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Based on learner feedback for this course.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-[#2563D9]" />
            <div>
              <p className="text-sm font-semibold text-[#0B1F3A]">
                Reviews coming soon
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Detailed learner reviews will appear here once they are
                published for this course.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FaqPanel({
  faqs,
  isLoading,
}: {
  faqs: CourseFaq[];
  isLoading: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563D9]">
        Support
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F3A]">
        Frequently asked questions
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Answers to common questions about this course.
      </p>
      <div className="mt-8">
        <CourseFaqAccordion faqs={faqs} isLoading={isLoading} />
      </div>
    </div>
  );
}
