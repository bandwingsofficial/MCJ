"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

import type { LessonLearnItemDto } from "@/src/features/learning/types/learning.types";
import { parseKeyLearningPoints } from "@/src/features/learning/utils/key-learning-points.utils";
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
  const keyPoints = parseKeyLearningPoints(currentItem.keyLearningPoints);
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">
            Question
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#0B1F3A]">
            {currentItem.title}
          </h3>
        </div>

        {currentItem.imageUrl ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.title}
              width={960}
              height={540}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Answer / Explanation
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {currentItem.explanation}
          </p>
        </div>

        {keyPoints.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Key Learning Points
              </p>
            </div>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li
                  key={`${currentItem.id}-point-${index}`}
                  className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm text-slate-700"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {currentItem.summary?.trim() ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Summary
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {currentItem.summary}
            </p>
          </div>
        ) : null}

        {currentItem.finalThoughts?.trim() ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Final Thoughts
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {currentItem.finalThoughts}
            </p>
          </div>
        ) : null}

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
