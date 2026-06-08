"use client";

import { CourseSection } from "@/src/features/courses/components/course-section";
import { CourseSearch } from "@/src/features/courses/components/course-search";

import { useCourseSearch } from "@/src/features/courses/hooks/use-course-search";

export default function CoursesPage() {
  const {
    search,
    setSearch,
    debouncedSearch,
  } = useCourseSearch();

  return (
    <main className="w-full py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div
          className="
            mb-10
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          {/* LEFT */}

          <div>
            <h1
              className="
                text-4xl
                font-bold
                tracking-tight
              "
            >
              Explore Courses
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-muted-foreground
              "
            >
              Discover courses designed to help
              you build real-world skills.
            </p>
          </div>

          {/* RIGHT */}

          <div
            className="
              w-full
              lg:w-[400px]
            "
          >
            <CourseSearch
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>

        <CourseSection
          search={debouncedSearch}
        />

      </div>
    </main>
  );
}