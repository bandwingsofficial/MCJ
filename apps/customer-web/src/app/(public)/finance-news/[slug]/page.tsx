import { FinanceNewsDetailPage } from "@/src/features/finance-news/pages/finance-news-detail-page";

interface FinanceNewsArticleRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function FinanceNewsArticleRoutePage({
  params,
}: FinanceNewsArticleRouteProps) {
  const { slug } = await params;
  return <FinanceNewsDetailPage slug={slug} />;
}
