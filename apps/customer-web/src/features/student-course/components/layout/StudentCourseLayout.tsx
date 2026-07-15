"use client";

import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

import { LessonContent } from "@/src/features/student-course/components/content/LessonContent";
import { ModuleAccordion } from "@/src/features/student-course/components/sidebar/ModuleAccordion";

interface StudentCourseLayoutProps {
  modules: CourseModule[];

  selectedLesson: Lesson;

  selectedLessonId: string;

  hasPreviousLesson: boolean;

  hasNextLesson: boolean;

  onLessonSelect: (
    lesson: Lesson,
  ) => void;

  onPreviousLesson: () => void;

  onNextLesson: () => void;
}

export function StudentCourseLayout({
  modules,
  selectedLesson,
  selectedLessonId,
  hasPreviousLesson,
  hasNextLesson,
  onLessonSelect,
  onPreviousLesson,
  onNextLesson,
}: StudentCourseLayoutProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <aside className="xl:col-span-4">
        <div className="sticky top-6">
          <ModuleAccordion
            modules={modules}
            selectedLessonId={
              selectedLessonId
            }
            onLessonSelect={
              onLessonSelect
            }
          />
        </div>
      </aside>

      <main className="space-y-6 xl:col-span-8">
        <LessonContent
          lesson={selectedLesson}
          hasPreviousLesson={
            hasPreviousLesson
          }
          hasNextLesson={
            hasNextLesson
          }
          onPreviousLesson={
            onPreviousLesson
          }
          onNextLesson={
            onNextLesson
          }
        />
      </main>
    </div>
  );
}