"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Lock } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import { LockedCurriculum } from "@/src/features/courses/components/locked-curriculum";
import type { CoursePreviewModule } from "@/src/features/courses/types/course.types";
import { formatDuration } from "@/src/features/courses/utils/course-display.utils";
import { CourseError } from "@/src/features/student-course/components/states/CourseError";
import { CourseSkeleton } from "@/src/features/student-course/components/states/CourseSkeleton";
import { EmptyModules } from "@/src/features/student-course/components/states/EmptyModules";
import { useStudentCourse } from "@/src/features/student-course/hooks/use-student-course";
import type { CourseModule } from "@/src/features/student-course/types/module.types";

function toPreviewModules(modules: CourseModule[]): CoursePreviewModule[] {
  return modules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    displayOrder: module.displayOrder,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      displayOrder: lesson.displayOrder,
      duration: lesson.duration,
      isPreview: false,
    })),
  }));
}

interface StudentCoursePageProps {
  courseId: string;
}

export function StudentCoursePage({ courseId }: StudentCoursePageProps) {
  const { course, progress, isLoading, error, refetch } =
    useStudentCourse(courseId);

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (error || !course) {
    return (
      <CourseError
        message={error ?? "Unable to load the course."}
        onRetry={refetch}
      />
    );
  }

  if (course.modules.length === 0) {
    return <EmptyModules />;
  }

  const previewModules = toPreviewModules(course.modules);
  const completionPercentage = progress?.completionPercentage ?? 0;

  return (
    <main className="w-full bg-slate-50/40 py-8">
      <div className="mx-auto max-w-5xl space-y-6 px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="gap-2 px-0">
          <Link href="/student/my-learning" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Learning
          </Link>
        </Button>

        <Card className="rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">{course.level}</Badge>
              </div>

              {course.code ? (
                <p className="text-sm font-medium text-indigo-600">{course.code}</p>
              ) : null}

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {course.title}
              </h1>

              {course.tagline ? (
                <p className="text-slate-600">{course.tagline}</p>
              ) : null}

              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course.moduleCount} modules · {course.lessonCount} lessons
                </span>
                <span>
                  Duration:{" "}
                  {formatDuration(course.duration, course.durationType)}
                </span>
              </div>
            </div>

            <div className="min-w-[200px] rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-600">Your Progress</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {completionPercentage}%
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Course Curriculum
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                All lessons are currently locked. Content will unlock when
                available.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </span>
          </div>

          <LockedCurriculum
            modules={previewModules}
            moduleCount={course.moduleCount}
            lessonCount={course.lessonCount}
          />
        </Card>
      </div>
    </main>
  );
}
