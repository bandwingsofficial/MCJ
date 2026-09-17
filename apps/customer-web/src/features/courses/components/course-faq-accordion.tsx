"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { CourseFaq } from "@/src/features/courses/types/course.types";

interface CourseFaqAccordionProps {
  faqs: CourseFaq[];
  isLoading?: boolean;
}

export function CourseFaqAccordion({
  faqs,
  isLoading = false,
}: CourseFaqAccordionProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const sortedFaqs = [...faqs].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );

  if (sortedFaqs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No FAQs available yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Frequently asked questions for this course will appear here once they
          are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedFaqs.map((faq) => {
        const isOpen = openFaqId === faq.id;

        return (
          <section
            key={faq.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:px-5"
            >
              <span className="text-sm font-semibold text-[#0B1F3A]">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-7 text-slate-600 sm:px-5">
                  {faq.answer}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
