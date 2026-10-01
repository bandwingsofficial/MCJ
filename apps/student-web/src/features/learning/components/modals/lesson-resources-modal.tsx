"use client";

import { LessonResourcesList } from "@/src/features/learning/components/lesson/lesson-content-panels";
import { LearningModalShell } from "@/src/features/learning/components/modals/learning-modal-shell";
import type { LessonResourceDto } from "@/src/features/learning/types/learning.types";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface LessonResourcesModalProps {
  open: boolean;
  lessonId: string;
  courseId: string;
  resources: LessonResourceDto[];
  onClose: () => void;
}

export function LessonResourcesModal({
  open,
  lessonId,
  courseId,
  resources,
  onClose,
}: LessonResourcesModalProps) {
  return (
    <LearningModalShell
      open={open}
      title="Lesson Resources"
      onClose={onClose}
      className="sm:max-w-lg"
    >
      <div key={lessonId}>
        {resources.length === 0 ? (
          <EmptyState
            title="No resources available"
            description="No resources available for this lesson."
          />
        ) : (
          <LessonResourcesList
            resources={resources}
            courseId={courseId}
            hideEmptyState
          />
        )}
      </div>
    </LearningModalShell>
  );
}
