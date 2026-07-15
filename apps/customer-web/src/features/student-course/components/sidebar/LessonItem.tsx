"use client";

import {
  Clock3,
  FileText,
  PlayCircle,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

interface LessonItemProps {
  lesson: Lesson;

  isActive?: boolean;

  onSelect: (
    lesson: Lesson,
  ) => void;
}

export function LessonItem({
  lesson,
  isActive = false,
  onSelect,
}: LessonItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-current={
        isActive
          ? "page"
          : undefined
      }
      onClick={() =>
        onSelect(lesson)
      }
      className={[
        "h-auto w-full justify-start rounded-xl border p-4 text-left transition-all",
        isActive
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-muted/60",
      ].join(" ")}
    >
      <div className="flex w-full items-start gap-3">
        <div
          className={[
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          <PlayCircle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h4 className="truncate font-medium">
              {lesson.title}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />

              <span>
                {lesson.duration
                  ? `${lesson.duration} min`
                  : "Duration N/A"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />

              <span>
                {
                  lesson.resources
                    .length
                }{" "}
                Resources
              </span>
            </div>
          </div>
        </div>

        {isActive && (
          <Badge variant="success">
            Current
          </Badge>
        )}
      </div>
    </Button>
  );
}