"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { CommunityPostCard } from "@/src/features/community/components/list/CommunityPostCard";

import type { CommunityPostListItem } from "@/src/features/community/types/community.types";

interface Props {
  items: CommunityPostListItem[];
  selectedIds: string[];
  emptyMessage: string;
  selectionDisabled?: boolean;
  actionsDisabled?: boolean;
  onSelectionChange: (selectedIds: string[]) => void;
  onManage: (item: CommunityPostListItem) => void;
  onEdit: (item: CommunityPostListItem) => void;
  onActivate: (item: CommunityPostListItem) => void;
  onDeactivate: (item: CommunityPostListItem) => void;
  onDelete: (item: CommunityPostListItem) => void;
  onRestore: (item: CommunityPostListItem) => void;
  onPermanentDelete: (item: CommunityPostListItem) => void;
}

export function CommunityFeedGrid({
  items,
  selectedIds,
  emptyMessage,
  selectionDisabled = false,
  actionsDisabled = false,
  onSelectionChange,
  onManage,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState title="No posts found" description={emptyMessage} />
      </div>
    );
  }

  const selectedSet = new Set(selectedIds);

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((post) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          selected={selectedSet.has(post.id)}
          selectionDisabled={selectionDisabled}
          actionsDisabled={actionsDisabled}
          onSelectChange={(postId, selected) => {
            if (selected) {
              onSelectionChange([...selectedIds, postId]);
              return;
            }

            onSelectionChange(selectedIds.filter((id) => id !== postId));
          }}
          onManage={onManage}
          onEdit={onEdit}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
        />
      ))}
    </div>
  );
}
