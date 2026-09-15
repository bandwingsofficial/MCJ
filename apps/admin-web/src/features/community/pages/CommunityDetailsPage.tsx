"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader } from "@/src/shared/components/ui/loader";

interface CommunityDetailsPageProps {
  postId: string;
}

export function CommunityDetailsPage({
  postId,
}: CommunityDetailsPageProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/community/${postId}/manage`);
  }, [postId, router]);

  return <Loader />;
}
