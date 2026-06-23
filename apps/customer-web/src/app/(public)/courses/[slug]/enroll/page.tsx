import {
  EnrollPage,
} from "@/src/features/enrollments/pages/enroll-page";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  return (
    <EnrollPage
      slug={slug}
    />
  );
}