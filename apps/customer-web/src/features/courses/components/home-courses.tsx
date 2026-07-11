"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/src/shared/components/ui/button";

import { CourseCard } from "@/src/features/courses/components/course-card";
import type { Course } from "@/src/features/courses/types/course.types";

interface HomeCoursesProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
}

export function HomeCourses({
  courses,
  onCourseClick,
}: HomeCoursesProps) {
  if (!courses.length) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
              Professional Learning
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              Explore Our Featured Courses
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Upgrade your skills with industry-focused programs taught by
              experienced mentors. Learn practical concepts, earn valuable
              certifications, and accelerate your career.
            </p>
          </div>

          <Link href="/courses">
  <Button
    size="lg"
    className="h-12 rounded-xl px-6"
  >
    View All Courses
    <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
</Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={onCourseClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}