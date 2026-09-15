import { EditFinanceNewsPage } from "@/src/features/finance-news/pages/edit-finance-news-page";

interface EditFinanceNewsPageProps {
  params: Promise<{
    newsId: string;
  }>;
}

export default async function Page({
  params,
}: EditFinanceNewsPageProps) {
  const { newsId } = await params;

  return <EditFinanceNewsPage newsId={newsId} />;
}
