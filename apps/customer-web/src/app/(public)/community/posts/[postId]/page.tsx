import { Suspense } from "react";

import { CommunityPostGatePage } from "@/src/features/community/pages/community-post-gate-page";

interface Props {
  params: Promise<{ postId: string }>;
}

export default async function CommunityPostRoute({ params }: Props) {
  const { postId } = await params;

  return (
    <Suspense fallback={null}>
      <CommunityPostGatePage postId={postId} />
    </Suspense>
  );
}
