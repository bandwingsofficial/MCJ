"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatDuration } from "@/src/features/courses/utils/course-display.utils";

interface StudentCourseCardProps {
  enrollment: Enrollment;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusVariant(
  status: Enrollment["status"],
): "success" | "warning" | "default" | "danger" {
  switch (status) {
    case "ADMITTED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export function StudentCourseCard({ enrollment }: StudentCourseCardProps) {
  const { course, batch, branch, joiningDate, expectedCompletionDate, status } =
    enrollment;

  return (
    <Card className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-indigo-200">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-slate-300" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
              {course.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {batch.name} · {batch.code}
            </p>
          </div>
          <Badge variant={statusVariant(status)}>{status}</Badge>
        </div>

        <div className="mb-4 space-y-2 text-xs text-slate-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-orange-500" />
            {branch.branchName}
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
            {formatDate(joiningDate)} → {formatDate(expectedCompletionDate)}
          </p>
          <p>
            Duration: {formatDuration(course.duration, course.durationType)}
          </p>
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>0%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-indigo-600" />
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <Link
            href={`/student/my-learning/${course.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-4 py-2 text-sm font-medium text-white hover:from-[#1E58C7] hover:to-[#123D94]"
          >
            Continue Learning
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
