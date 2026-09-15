"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCommunityPost } from "@/src/features/community/hooks/useCommunityPost";
import { communityService } from "@/src/features/community/services/community.service";

import { CommunityManageHeader } from "@/src/features/community/components/manage/community-manage-header";
import {
  CommunityManageWorkspace,
  COMMUNITY_MANAGE_DEFAULT_TAB,
  type CommunityManageTabKey,
} from "@/src/features/community/components/manage/community-manage-workspace";
import { EditCommunityPostModal } from "@/src/features/community/components/edit-community-post-modal";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";

interface Props {
  postId: string;
}

export function CommunityManagePage({ postId }: Props) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useCommunityPost(postId);
  const [activeTab, setActiveTab] = useState<CommunityManageTabKey>(
    COMMUNITY_MANAGE_DEFAULT_TAB,
  );
  const [editPost, setEditPost] = useState<CommunityPostDetails | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const handleEdit = useCallback(async () => {
    if (!data?.data) {
      return;
    }

    try {
      setIsEditLoading(true);
      const response = await communityService.getCommunityPost(data.data.id);
      setEditPost(response.data);
      setIsEditOpen(true);
    } catch (err) {
      appToast.error(
        err instanceof Error ? err.message : "Failed to load post for editing",
      );
    } finally {
      setIsEditLoading(false);
    }
  }, [data?.data]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !data?.data) {
    const description =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Something went wrong while loading the community post.";

    return (
      <ErrorState
        title="Failed to load community post"
        description={description}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const post = data.data;

  return (
    <div className="space-y-4">
      <CommunityManageHeader
        post={post}
        onBack={() => router.push("/community")}
        onEdit={isEditLoading ? undefined : handleEdit}
      />

      <CommunityManageWorkspace
        post={post}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <EditCommunityPostModal
        open={isEditOpen}
        post={editPost}
        onClose={() => {
          setIsEditOpen(false);
          setEditPost(null);
        }}
        onSuccess={() => {
          void refetch();
        }}
      />
    </div>
  );
}
