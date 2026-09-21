import { CommunityManagePage } from "@/src/features/community/pages/community-manage-page";

interface Props {
  params: Promise<{
    Id: string;
  }>;
}

export default async function CommunityManageRoute({ params }: Props) {
  const { Id } = await params;

  return <CommunityManagePage postId={Id} />;
}
