import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LegacyCompanyJobApplicationPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/jobs/${encodeURIComponent(slug)}/apply`);
}
