"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion";

import { CourseLessonActions } from "@/src/features/course-lessons/components/CourseLessonActions";
import { CourseResourcesManager } from "@/src/features/course-modules/components/CourseResourcesManager";

import type {
  CourseLesson,
} from "@/src/features/course-lessons/types";

interface CourseLessonCardProps {
  lesson: CourseLesson;

  onEdit: (
    lesson: CourseLesson,
  ) => void;

  onMove: (
    lesson: CourseLesson,
  ) => void;

  onResources: (
    lesson: CourseLesson,
  ) => void;

  onDelete: (
    lesson: CourseLesson,
  ) => void;

  onRestore: (
    lesson: CourseLesson,
  ) => void;
}

export function CourseLessonCard({
  lesson,
  onEdit,
  onMove,
  onResources,
  onDelete,
  onRestore,
}: CourseLessonCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {lesson.displayOrder}. {lesson.title}
          </h3>

          {lesson.description && (
            <p className="text-sm text-muted-foreground">
              {lesson.description}
            </p>
          )}

          {lesson.videoUrl && (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Video Link
            </a>
          )}

          <div className="flex items-center gap-3">
            <Badge
              variant={
                lesson.isDeleted
                  ? "danger"
                  : "success"
              }
            >
              {lesson.isDeleted
                ? "Deleted"
                : "Active"}
            </Badge>

            <Badge variant="info">
              Order #{lesson.displayOrder}
            </Badge>
          </div>
        </div>

        <CourseLessonActions
          lesson={lesson}
          onEdit={onEdit}
          onMove={onMove}
          onResources={onResources}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </div>

      <Accordion
        type="single"
        collapsible
        className="mt-5"
      >
        <AccordionItem value="resources">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start">
              <span className="font-medium">
                Resources
              </span>

              <span className="text-xs text-muted-foreground">
                Manage lesson resources
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <CourseResourcesManager
              lessonId={lesson.id}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}