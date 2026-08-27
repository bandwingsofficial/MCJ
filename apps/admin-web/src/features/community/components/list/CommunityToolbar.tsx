"use client";

import { Button } from "@/src/shared/components/ui/button";
import { PageHeader } from "@/src/shared/components/ui/page-header";

interface CommunityToolbarProps {
  onCreate: () => void;
}

export function CommunityToolbar({
  onCreate,
}: CommunityToolbarProps) {
  return (
    <PageHeader
      title="Community Posts"
      description="Manage all community posts"
      actions={
        <Button className="admin-create-btn" size="lg" onClick={onCreate}>
          Create Post
        </Button>
      }
    />
  );
}