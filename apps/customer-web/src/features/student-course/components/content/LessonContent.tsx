"use client";

import { Lock } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { Lesson } from "@/src/features/student-course/types/lesson.types";

interface LessonContentProps {
  lesson: Lesson;
  hasPreviousLesson: boolean;
  hasNextLesson: boolean;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
}

export function LessonContent({ lesson }: LessonContentProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <Lock className="h-10 w-10 text-slate-400" />
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {lesson.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          This lesson is currently locked and unavailable.
        </p>
      </div>
    </Card>
  );
}
