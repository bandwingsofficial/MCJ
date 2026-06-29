"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCommunityPosts } from "@/src/features/community/hooks";

import { CommunityCreateModal } from "@/src/features/community/components/CommunityCreateModal";
import { CommunityFilters } from "@/src/features/community/components/list/CommunityFilters";
import { CommunityPostGrid } from "@/src/features/community/components/list/CommunityPostGrid";
import { CommunitySkeleton } from "@/src/features/community/components/list/CommunitySkeleton";
import { CommunityToolbar } from "@/src/features/community/components/list/CommunityToolbar";

export function CommunityListPage() {
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const {
    posts,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useCommunityPosts();

  if (isLoading) {
    return <CommunitySkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load community posts"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <CommunityToolbar
          onCreate={() =>
            setIsCreateModalOpen(
              true,
            )
          }
        />

        <CommunityFilters
          value={filters}
          onChange={setFilters}
        />

        <CommunityPostGrid
          posts={posts}
          onPostClick={(post) =>
            router.push(
              `/admin/community/${post.id}`,
            )
          }
        />
      </div>

      <CommunityCreateModal
        open={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(
            false,
          )
        }
      />
    </>
  );
}