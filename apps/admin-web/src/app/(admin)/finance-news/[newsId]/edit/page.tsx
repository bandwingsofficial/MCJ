interface EditFinanceNewsPageProps {
  params: Promise<{
    newsId: string;
  }>;
}

export default async function EditFinanceNewsPage({
  params,
}: EditFinanceNewsPageProps) {
  const { newsId } = await params;

  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
        Edit Financial News
      </h1>

      <p className="mt-2 text-[#647A9B]">
        Update an existing financial news article, announcement, or notification.
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-[#DCE8F5] bg-white p-8">
        <p className="font-medium text-[#102A56]">
          News ID
        </p>

        <p className="mt-2 font-mono text-[#2563EB]">
          {newsId}
        </p>

        <p className="mt-4 text-[#647A9B]">
          Financial News editing module is under development.
        </p>
      </div>
    </div>
  );
}
