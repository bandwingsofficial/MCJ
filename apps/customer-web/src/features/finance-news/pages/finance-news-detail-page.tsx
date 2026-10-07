"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatMcjEntityPageTitle } from "@mcj/shared-constants";
import { ChevronRight, Clock3, ImageOff } from "lucide-react";

import { FinanceNewsArticleContent } from "@/src/features/finance-news/components/finance-news-article-content";
import { FinanceNewsArticleSidebar } from "@/src/features/finance-news/components/finance-news-article-sidebar";
import { FinanceNewsShareActions } from "@/src/features/finance-news/components/finance-news-share-actions";
import { useFinanceNewsArticle } from "@/src/features/finance-news/hooks/use-finance-news-article";
import { formatFinanceNewsDate } from "@/src/features/finance-news/utils/finance-news-display.util";
import { estimateFinanceNewsReadingTimeMinutes } from "@/src/features/finance-news/utils/finance-news-reading-time.util";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { useBrowserPageTitle } from "@/src/shared/document-title/document-title-provider";
import { cn } from "@/src/shared/lib/cn";

function isNotFoundError(error: unknown): boolean {
  return (
    (error as { response?: { status?: number } })?.response?.status === 404
  );
}

function getAuthorInitials(authorName: string): string {
  const parts = authorName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "MC";
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

function FinanceNewsDetailSkeleton() {
  return (
    <main className="w-full bg-white pb-12">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-64 max-w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
          <Skeleton className="min-h-[280px] w-full rounded-xl lg:min-h-[360px]" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="mt-6 h-12 w-full" />
          </div>
        </div>
        <Skeleton className="mt-10 h-64 w-full" />
      </div>
    </main>
  );
}

export function FinanceNewsDetailPage({ slug }: { slug: string }) {
  const { data: article, isLoading, isError, error } = useFinanceNewsArticle(slug);

  const browserPageTitle = useMemo(
    () => formatMcjEntityPageTitle("Finance News", article?.title),
    [article?.title],
  );

  useBrowserPageTitle(browserPageTitle);

  if (isLoading) {
    return <FinanceNewsDetailSkeleton />;
  }

  if (isError && isNotFoundError(error)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Article not found"
          description="This financial news article may have been removed or is not published yet."
          action={
            <Link
              href="/finance-news"
              className="inline-flex rounded-lg border border-[#2563EB]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
            >
              Browse Financial News
            </Link>
          }
        />
      </main>
    );
  }

  if (isError || !article) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Unable to load article"
          description="Please try again in a moment."
          action={
            <Link
              href="/finance-news"
              className="inline-flex rounded-lg border border-[#2563EB]/30 bg-white px-4 py-2 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
            >
              Browse Financial News
            </Link>
          }
        />
      </main>
    );
  }

  const publishedLabel = formatFinanceNewsDate(
    article.publishedAt ?? article.createdAt,
  );
  const readingMinutes = estimateFinanceNewsReadingTimeMinutes(
    article.content,
    article.shortDescription,
  );
  const relatedArticles = article.relatedArticles ?? [];
  const heroImageUrl = article.thumbnailUrl ?? article.bannerUrl;

  return (
    <main className="w-full overflow-x-hidden bg-white pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 py-4 text-sm text-slate-500"
        >
          <Link href="/" className="transition-colors hover:text-[#2563EB]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
          <Link
            href="/finance-news"
            className="transition-colors hover:text-[#2563EB]"
          >
            Financial News
          </Link>
          {article.category?.name ? (
            <>
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-slate-300"
                aria-hidden
              />
              <span className="text-slate-600">{article.category.name}</span>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
          <span className="line-clamp-1 font-medium text-[#0B1F3A]">
            {article.title}
          </span>
        </nav>

        <header className="border-b border-slate-100 pb-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr] lg:items-stretch lg:gap-8 xl:gap-10">
            <div className="flex min-h-[240px] w-full items-center justify-center rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-3 sm:min-h-[280px] lg:min-h-[360px]">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt=""
                  className="h-auto max-h-[min(480px,38vw)] w-full rounded-lg object-contain object-center"
                />
              ) : (
                <div className="flex h-full min-h-[200px] w-full items-center justify-center rounded-lg text-slate-400">
                  <ImageOff className="h-8 w-8" aria-hidden />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                {article.category?.name ? (
                  <span>{article.category.name}</span>
                ) : null}
                <span className="font-normal normal-case tracking-normal text-slate-500">
                  {publishedLabel}
                </span>
                {readingMinutes ? (
                  <span className="inline-flex items-center gap-1 font-normal normal-case tracking-normal text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden />
                    {readingMinutes} min read
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 w-full text-2xl font-bold leading-tight tracking-tight text-[#0B1F3A] sm:text-3xl md:text-[2rem] md:leading-[1.15] lg:text-[2.125rem]">
                {article.title}
              </h1>

              {article.shortDescription ? (
                <p className="mt-3 w-full text-sm leading-relaxed text-slate-600 sm:text-base">
                  {article.shortDescription}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                      "bg-[#EFF6FF] text-xs font-bold text-[#2563EB]",
                    )}
                    aria-hidden
                  >
                    {getAuthorInitials(article.authorName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0B1F3A]">
                      {article.authorName}
                    </p>
                  </div>
                </div>

                <FinanceNewsShareActions title={article.title} />
              </div>
            </div>
          </div>
        </header>

        <article className="mt-8 w-full min-w-0">
          <FinanceNewsArticleContent content={article.content} />

          {article.tags.length > 0 ? (
            <footer className="mt-10 border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Tags
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li key={tag}>
                    <span className="inline-flex rounded-full border border-slate-200 bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#334155]">
                      {tag}
                    </span>
                  </li>
                ))}
              </ul>
            </footer>
          ) : null}
        </article>

        <div className="mt-12">
          <FinanceNewsArticleSidebar
            currentSlug={article.slug}
            relatedArticles={relatedArticles}
            category={article.category}
          />
        </div>
      </div>
    </main>
  );
}
