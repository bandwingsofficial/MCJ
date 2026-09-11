import { JobApplyPage } from "@/src/features/jobs/pages/JobApplyPage";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicJobApplyRoute({ params }: Props) {
  const { slug } = await params;
  return <JobApplyPage slug={slug} />;
}
