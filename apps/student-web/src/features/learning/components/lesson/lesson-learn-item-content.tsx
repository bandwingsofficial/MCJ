"use client";

import Image from "next/image";
import { Lightbulb } from "lucide-react";

import type { LessonLearnItemDto } from "@/src/features/learning/types/learning.types";
import { parseKeyLearningPoints } from "@/src/features/learning/utils/key-learning-points.utils";

interface LessonLearnItemContentProps {
  item: LessonLearnItemDto;
}

export function LessonLearnItemContent({ item }: LessonLearnItemContentProps) {
  const keyPoints = parseKeyLearningPoints(item.keyLearningPoints);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">
          Topic
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[#0B1F3A]">{item.title}</h3>
      </div>

      {item.imageUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={960}
            height={540}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Explanation
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {item.explanation}
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
                key={`${item.id}-point-${index}`}
                className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm text-slate-700"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.summary?.trim() ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Summary
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {item.summary}
          </p>
        </div>
      ) : null}

      {item.finalThoughts?.trim() ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Final Thoughts
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {item.finalThoughts}
          </p>
        </div>
      ) : null}
    </div>
  );
}
