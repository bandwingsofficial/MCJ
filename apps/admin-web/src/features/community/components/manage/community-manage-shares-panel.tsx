"use client";

import { Share2 } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface Props {
  shareCount: number;
}

export function CommunityManageSharesPanel({ shareCount }: Props) {
  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-4 rounded-xl border-[#E1EBF5] p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4FB] text-[#2563EB]">
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
            Total Shares
          </p>
          <p className="text-2xl font-bold tabular-nums text-[#102A56]">
            {shareCount}
          </p>
        </div>
      </Card>

      <EmptyState
        title="No individual share records"
        description="The database only stores an aggregate share count for this post. Per-user share activity is not tracked, so there is no share history table to display."
      />
    </div>
  );
}
