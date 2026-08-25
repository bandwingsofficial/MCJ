"use client";

import { useEffect, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchEnrollmentCourseDetails } from "@/src/features/branches/components/manage/branch-enrollment-course-details";
import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import type { CourseModuleListItem } from "@/src/features/course-modules/types/course-module.types";
import { courseService } from "@/src/features/courses/services/course.service";
import type { Course } from "@/src/features/courses/types/course.types";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatEnrollmentCategoryName } from "@/src/features/students/utils/enrollment-display.utils";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageCoursePanel({ enrollment }: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModuleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const courseId = enrollment.course?.id;
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const [courseResponse, moduleResponse] = await Promise.all([
          courseService.getCourse(courseId),
          courseModuleService.getCourseModules({
            courseId,
            includeDeleted: false,
          }),
        ]);
        setCourse(courseResponse.data);
        setModules(Array.isArray(moduleResponse.data) ? moduleResponse.data : []);
      } catch (error) {
        appToast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [enrollment.course?.id]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <BranchEnrollmentCourseDetails
        course={course}
        categoryName={formatEnrollmentCategoryName(enrollment)}
      />

      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Course Modules
        </h2>
        {modules.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-900">
              No data yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Course modules will appear here once they are added to this course.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {modules.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Enrollment Course Snapshot
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <EnrollmentDetailItem
            label="Course"
            value={enrollment.course?.title ?? "—"}
          />
          <EnrollmentDetailItem
            label="Category"
            value={formatEnrollmentCategoryName(enrollment)}
          />
        </div>
      </Card>
    </div>
  );
}
