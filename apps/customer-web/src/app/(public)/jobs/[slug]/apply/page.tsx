import { PublicJobApplyPage } from "@/src/features/jobs/pages/PublicJobApplyPage";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicJobApplyRoute({ params }: Props) {
  const { slug } = await params;
  return <PublicJobApplyPage slug={slug} />;
}
