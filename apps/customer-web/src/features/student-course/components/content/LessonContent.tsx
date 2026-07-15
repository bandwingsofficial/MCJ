"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import { ResourceList } from "@/src/features/student-course/components/content/resource-list";
import { VideoPlayer } from "@/src/features/student-course/components/content/VideoPlayer";

import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

interface LessonContentProps {
  lesson: Lesson;

  hasPreviousLesson: boolean;

  hasNextLesson: boolean;

  onPreviousLesson: () => void;

  onNextLesson: () => void;
}

export function LessonContent({
  lesson,
  hasPreviousLesson,
  hasNextLesson,
  onPreviousLesson,
  onNextLesson,
}: LessonContentProps) {
  return (
    <div className="space-y-6">
      <VideoPlayer
        videoUrl={lesson.videoUrl}
      />

      <Card className="space-y-5 p-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />

            <h2 className="text-2xl font-bold">
              {lesson.title}
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Watch the lesson carefully and review the
            attached learning resources before moving to
            the next lesson.
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={!hasPreviousLesson}
            onClick={onPreviousLesson}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Lesson
          </Button>

          <Button
            type="button"
            disabled={!hasNextLesson}
            onClick={onNextLesson}
            className="gap-2"
          >
            Next Lesson
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <ResourceList
        resources={lesson.resources}
      />
    </div>
  );
}