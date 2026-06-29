import {
  CommunityDetailsPage,
} from "@/src/features/community/pages/CommunityDetailsPage";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({
  params,
}: PageProps) {
  return (
    <CommunityDetailsPage
      postId={params.id}
    />
  );
}