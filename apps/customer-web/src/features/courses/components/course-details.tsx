"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import { useCourseBatches } from "@/src/features/batches/hooks/useCourseBatches";
import { CourseBatchCards } from "@/src/features/courses/components/course-batch-cards";
import { LockedCurriculum } from "@/src/features/courses/components/locked-curriculum";
import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCoursePrice,
  formatDuration,
  formatCurrency,
} from "@/src/features/courses/utils/course-display.utils";

interface CourseDetailsProps {
  course: Course;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const router = useRouter();
  const { batches, isLoading: batchesLoading } = useCourseBatches(course.id);

  const branchNames = course.branches
    .map((branch) => branch.branchName)
    .filter(Boolean)
    .join(", ");

  return (
    <main className="w-full bg-slate-50/40 py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">{course.level}</Badge>
                <Badge variant="default">{course.mode}</Badge>
                <Badge variant="success">ACTIVE</Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-indigo-600">
                  {course.code}
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {course.title}
                </h1>
                {course.tagline ? (
                  <p className="mt-2 text-base text-slate-600">
                    {course.tagline}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Category: {course.categoryName}</span>
                <span>
                  Duration: {formatDuration(course.duration, course.durationType)}
                </span>
                <span>Language: {course.language}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full min-h-[220px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
                  No preview image
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-8">
            <Section title="Course Overview">
              <p className="text-sm leading-relaxed text-slate-600">
                {course.description ||
                  course.shortDescription ||
                  "Course overview will be available soon."}
              </p>
            </Section>

            <Section title="Course Information">
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Course Code" value={course.code} />
                <InfoItem label="Category" value={course.categoryName} />
                <InfoItem
                  label="Duration"
                  value={formatDuration(course.duration, course.durationType)}
                />
                <InfoItem label="Mode" value={course.mode} />
                <InfoItem label="Language" value={course.language} />
                <InfoItem
                  label="Branches"
                  value={branchNames || "Available online"}
                />
              </dl>
            </Section>

            <Section title="Available Batches">
              <CourseBatchCards
                batches={batches}
                isLoading={batchesLoading}
                courseSlug={course.slug}
                coursePrice={course.discountPrice}
                isFree={course.isFree}
              />
            </Section>

            <Section title="Course Curriculum">
              <LockedCurriculum
                modules={course.previewModules}
                moduleCount={course.moduleCount}
                lessonCount={course.lessonCount}
              />
            </Section>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Pricing</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatCoursePrice(course)}
              </p>
              {!course.isFree && course.totalDiscount > 0 ? (
                <p className="mt-1 text-sm text-emerald-600">
                  Save {formatCurrency(course.totalDiscount, course.currency)}
                </p>
              ) : null}

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
                <p>{batches.length} upcoming batch{batches.length === 1 ? "" : "es"}</p>
                <p>{course.moduleCount} modules · {course.lessonCount} lessons</p>
              </div>

              <Button
                className="mt-5 w-full"
                onClick={() => router.push(`/courses/${course.slug}/enroll`)}
              >
                Enroll / Select Batch
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
