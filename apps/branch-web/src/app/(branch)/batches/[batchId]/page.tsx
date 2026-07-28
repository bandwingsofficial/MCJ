interface PageProps {
  params: Promise<{
    batchId: string;
  }>;
}

export default async function BatchDetailsPage({ params }: PageProps) {
  const { batchId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Batch Details</h1>

      <p className="mt-2">
        Batch ID: <strong>{batchId}</strong>
      </p>

      <p className="mt-2 text-gray-600">
        Batch details page is under development.
      </p>
    </div>
  );
}