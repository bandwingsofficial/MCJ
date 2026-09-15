"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { FinanceNewsForm } from "@/src/features/finance-news/components/finance-news-form";
import { useUpdateFinanceNews } from "@/src/features/finance-news/hooks/use-update-finance-news";
import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";
import { mapFinanceNewsToFormValues } from "@/src/features/finance-news/utils/map-finance-news-to-form-values";

import type { FinanceNewsDetails } from "@/src/features/finance-news/types/finance-news.types";

interface EditFinanceNewsPageProps {
  newsId: string;
}

export function EditFinanceNewsPage({ newsId }: EditFinanceNewsPageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<FinanceNewsDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { updateFinanceNews, isPending, fieldErrors } =
    useUpdateFinanceNews();

  const fetchArticle = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await financeNewsService.getFinanceNews(newsId);
      setArticle(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load article",
      );
    } finally {
      setIsLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    void fetchArticle();
  }, [fetchArticle]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !article) {
    return (
      <ErrorState
        title="Failed to load article"
        description={error ?? "Article not found"}
        onRetry={() => {
          void fetchArticle();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="px-1 py-1">
        <nav
          aria-label="Breadcrumb"
          className="mb-1 flex items-center gap-1 text-xs"
        >
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link
            href="/finance-news"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Financial News
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-[#102A56]">Edit</span>
        </nav>

        <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Edit Financial News
        </h1>
        <p className="mt-1 text-sm text-[#647A9B]">
          Update {article.title}
        </p>
      </header>

      <Card className="rounded-xl border-[#E1EBF5] p-4 shadow-sm sm:p-6">
        <FinanceNewsForm
          key={article.id}
          mode="edit"
          initialValues={mapFinanceNewsToFormValues(article)}
          thumbnailPreviewUrl={article.thumbnailUrl}
          bannerPreviewUrl={article.bannerUrl}
          isSubmitting={isPending}
          externalErrors={fieldErrors}
          onCancel={() => router.push("/finance-news")}
          onSubmit={async (values, files) => {
            const success = await updateFinanceNews(
              article.id,
              values,
              {
                thumbnailFileId: article.thumbnailFileId,
                bannerFileId: article.bannerFileId,
              },
              files,
            );

            if (success) {
              router.push("/finance-news");
            }
          }}
        />
      </Card>
    </div>
  );
}
