import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    Id: string;
  }>;
}

export default async function LegacyCommunityDetailRoute({ params }: Props) {
  const { Id } = await params;

  redirect(`/community/${Id}/manage`);
}
