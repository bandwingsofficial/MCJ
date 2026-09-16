"use client";

import { MCJ_FEATURE_STRIP_ITEMS } from "@/src/shared/constants/site.constants";
import {
  Award,
  BookOpen,
  CalendarClock,
  Layers,
  Sparkles,
} from "lucide-react";

const icons = [BookOpen, Layers, CalendarClock, Award, Sparkles];

export function FeatureStripSection() {
  return (
    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#0B1F3A] px-4 py-4 shadow-[0_20px_50px_rgba(11,31,58,0.25)] sm:px-6">
        <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {MCJ_FEATURE_STRIP_ITEMS.map((item, index) => {
            const Icon = icons[index] ?? Sparkles;

            return (
              <div
                key={item}
                className="flex items-center gap-3 px-2 py-3 sm:flex-col sm:px-3 sm:py-4 sm:text-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9EC5FF]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium leading-snug text-slate-100 sm:text-[11px]">
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
