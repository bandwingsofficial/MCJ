"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

import { LessonLearnItemContent } from "@/src/features/learning/components/lesson/lesson-learn-item-content";
import type { LessonLearnItemDto } from "@/src/features/learning/types/learning.types";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

interface LessonLearnSectionProps {
  learnItems: LessonLearnItemDto[];
}

export function LessonLearnSection({ learnItems }: LessonLearnSectionProps) {
  const orderedItems = useMemo(
    () =>
      learnItems
        .slice()
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [learnItems],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  if (orderedItems.length === 0) {
    return null;
  }

  const currentItem = orderedItems[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < orderedItems.length - 1;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0B1F3A]">Learn</h2>
          <p className="text-xs text-slate-500">
            Item {activeIndex + 1} of {orderedItems.length}
          </p>
        </div>
      </div>

      <Card className="space-y-5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-sm">
        <LessonLearnItemContent item={currentItem} />

        {orderedItems.length > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={!hasPrevious}
              onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous Item
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"
              disabled={!hasNext}
              onClick={() =>
                setActiveIndex((index) =>
                  Math.min(index + 1, orderedItems.length - 1),
                )
              }
            >
              Next Item
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
