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
    <div className="p-6">
      <h1 className="text-2xl font-bold">Edit Financial News</h1>

      <p className="mt-2 text-gray-600">
        Update an existing financial news article, announcement, or notification.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8">
        <p className="font-medium text-gray-700">
          News ID
        </p>

        <p className="mt-2 font-mono text-blue-600">
          {newsId}
        </p>

        <p className="mt-4 text-gray-500">
          Financial News editing module is under development.
        </p>
      </div>
    </div>
  );
}