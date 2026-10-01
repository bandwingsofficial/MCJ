"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { LessonLearnItemContent } from "@/src/features/learning/components/lesson/lesson-learn-item-content";
import { LearningConfirmDialog } from "@/src/features/learning/components/modals/learning-confirm-dialog";
import { LearningModalShell } from "@/src/features/learning/components/modals/learning-modal-shell";
import type { LessonLearnItemDto } from "@/src/features/learning/types/learning.types";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface LessonLearnModalProps {
  open: boolean;
  lessonId: string;
  lessonTitle: string;
  learnItems: LessonLearnItemDto[];
  onClose: () => void;
}

export function LessonLearnModal({
  open,
  lessonId,
  lessonTitle,
  learnItems,
  onClose,
}: LessonLearnModalProps) {
  const orderedItems = useMemo(
    () =>
      learnItems
        .slice()
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [learnItems],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
    }
  }, [open, lessonId]);

  const currentItem = orderedItems[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < orderedItems.length - 1;
  const isLast = activeIndex === orderedItems.length - 1;
  const hasProgress = activeIndex > 0;

  const requestClose = () => {
    if (hasProgress && orderedItems.length > 1) {
      setShowLeaveConfirm(true);
      return;
    }

    onClose();
  };

  const footer =
    orderedItems.length > 0 ? (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={!hasPrevious}
          onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <p className="text-xs font-medium text-slate-500">
          {activeIndex + 1} / {orderedItems.length}
        </p>
        {isLast ? (
          <Button
            type="button"
            size="sm"
            className="rounded-lg"
            onClick={requestClose}
          >
            Finish
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="rounded-lg"
            disabled={!hasNext}
            onClick={() =>
              setActiveIndex((index) =>
                Math.min(index + 1, orderedItems.length - 1),
              )
            }
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    ) : null;

  return (
    <>
      <LearningModalShell
        open={open}
        title={`Learn — ${lessonTitle}`}
        onClose={requestClose}
        className="sm:max-w-2xl"
        footer={footer}
      >
        <div key={lessonId}>
          {orderedItems.length === 0 ? (
            <EmptyState
              title="No learning content"
              description="This lesson does not include learning materials yet."
            />
          ) : currentItem ? (
            <>
              <p className="mb-4 text-xs font-medium text-slate-500">
                Topic {activeIndex + 1} of {orderedItems.length}
              </p>
              <LessonLearnItemContent item={currentItem} />
            </>
          ) : null}
        </div>
      </LearningModalShell>

      <LearningConfirmDialog
        open={showLeaveConfirm}
        title="Leave Learning?"
        description="You are currently viewing this lesson. Your current learning position may be lost."
        cancelLabel="Continue Learning"
        confirmLabel="Close"
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onClose();
        }}
      />
    </>
  );
}
