import { Suspense } from "react";

import { EnrollPage } from "@/src/features/enrollments/pages/enroll-page";
import { Loader } from "@/src/shared/components/ui/loader";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      }
    >
      <EnrollPage slug={slug} />
    </Suspense>
  );
}
