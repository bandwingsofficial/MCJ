"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, Layers } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import type { CourseModuleListItem } from "@/src/features/course-modules/types/course-module.types";
import { formatCourseLevel } from "@/src/features/branches/utils/branch-display.utils";
import { courseService } from "@/src/features/courses/services/course.service";
import type { Course } from "@/src/features/courses/types/course.types";
import { formatCourseQualifications } from "@/src/features/courses/utils/course-display.utils";
import { EnrollmentDetailItem } from "@/src/features/enrollments/components/manage/enrollment-detail-item";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatEnrollmentCategoryName } from "@/src/features/students/utils/enrollment-display.utils";

interface Props {
  enrollment: Enrollment;
}

const MODULE_ACCENTS = [
  "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] to-white",
  "border-violet-200/80 bg-gradient-to-br from-violet-50/70 to-[#FAF8FF]",
  "border-teal-200/70 bg-gradient-to-br from-teal-50/60 to-[#F6FDFB]",
] as const;

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
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!course) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
        <h3 className="text-base font-semibold text-[#102A56]">
          Course not available
        </h3>
        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
          Assigned course information is not linked to this enrollment.
        </p>
      </div>
    );
  }

  const categoryName = formatEnrollmentCategoryName(enrollment);
  const qualifications = formatCourseQualifications(
    course.minimumQualifications ?? [],
  );
  const description =
    course.shortDescription?.trim() ||
    course.description?.trim() ||
    "—";

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Course
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Assigned course details for {enrollment.enrollmentNumber}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <Accordion type="multiple" defaultValue={["assigned-course", "modules"]}>
          <AccordionItem value="assigned-course" className="border-[#D9E4F2]">
            <AccordionTrigger className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#102A56]">
                    Assigned Course
                  </p>
                  <p className="truncate text-sm text-[#647A9B]">
                    {course.title} · {course.code ?? course.slug}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 shrink-0 rounded-xl border border-[#DCE8F5] object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#DCE8F5] bg-gradient-to-br from-slate-50 to-[#F8FBFF] text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    No Image
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[#102A56]">
                    {course.title}
                  </h3>
                  <p className="font-mono text-sm text-[#647A9B]">
                    {course.code ?? course.slug}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <EnrollmentDetailItem
                  label="Category"
                  value={categoryName ?? course.category?.name ?? "—"}
                />
                <EnrollmentDetailItem
                  label="Level"
                  value={formatCourseLevel(course.level)}
                />
                <EnrollmentDetailItem label="Language" value={course.language || "—"} />
                <EnrollmentDetailItem
                  label="Minimum Qualification"
                  value={qualifications || "—"}
                />
                <EnrollmentDetailItem
                  label="Description"
                  value={description}
                  />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="modules" className="border-0">
            <AccordionTrigger className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#102A56]">
                    Course Modules
                  </p>
                  <p className="text-sm text-[#647A9B]">
                    {modules.length} module{modules.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4">
              {modules.length === 0 ? (
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold text-[#102A56]">
                    No modules yet
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Course modules will appear here once they are added to this
                    course.
                  </p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {modules.map((module, index) => (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      className={cn(
                        "overflow-hidden rounded-xl border shadow-sm",
                        MODULE_ACCENTS[index % MODULE_ACCENTS.length],
                      )}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2 text-left">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                              Module {index + 1}
                            </p>
                            <p className="truncate text-sm font-semibold text-[#102A56]">
                              {module.title}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-[#E8F0FA] bg-white/70 px-4 py-3">
                        <p className="text-sm leading-6 text-slate-700">
                          {module.description?.trim() ||
                            "No module description provided."}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
