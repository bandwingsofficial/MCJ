"use client";

import { ArrowRight, CalendarDays, ImageOff, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

import type { FinancialArticleListItem } from "@/src/features/finance-news/types/finance-news.types";
import {
  formatFinanceNewsDate,
  getFinanceNewsDetailPath,
} from "@/src/features/finance-news/utils/finance-news-display.util";

interface FinanceNewsCardProps {
  article: FinancialArticleListItem;
}

export function FinanceNewsCard({ article }: FinanceNewsCardProps) {
  const router = useRouter();
  const href = getFinanceNewsDetailPath(article.slug);
  const imageUrl = article.thumbnailUrl ?? article.bannerUrl;

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white",
        "shadow-[0_2px_12px_rgba(11,31,58,0.04)] transition-all duration-300",
        "hover:-translate-y-1 hover:border-[#2563EB]/25 hover:shadow-[0_16px_32px_rgba(11,31,58,0.08)]",
      )}
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={article.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/55 via-[#0B1F3A]/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#EEF4FF] via-[#F8FBFF] to-[#F5F3FF] text-slate-400">
            <ImageOff className="h-7 w-7" aria-hidden />
            <span className="text-[11px] font-medium text-slate-500">
              No preview image
            </span>
          </div>
        )}
        {article.category?.name ? (
          <span className="absolute left-3 top-3 rounded-md border border-white/40 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2563EB] shadow-sm">
            {article.category.name}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden />
            {article.authorName}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden />
            {formatFinanceNewsDate(article.publishedAt ?? article.createdAt)}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold tracking-tight text-[#0B1F3A] transition-colors group-hover:text-[#2563EB]">
          {article.title}
        </h2>

        {article.shortDescription ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
            {article.shortDescription}
          </p>
        ) : (
          <p className="mt-2 flex-1 text-sm text-slate-500">
            Read the latest financial insights from MCJ.
          </p>
        )}

        {article.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-[#E0E7FF] bg-[#F5F3FF]/70 px-2 py-1 text-[11px] font-medium text-[#4338CA]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="mb-3 h-px bg-slate-100" />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 rounded-lg bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-3.5 text-[10px] font-semibold text-white shadow-none transition-all duration-200 hover:from-[#2860D4] hover:to-[#1A3F96] hover:shadow-[0_5px_14px_rgba(47,107,229,0.25)]"
              onClick={() => router.push(href)}
            >
              Explore More
              <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
