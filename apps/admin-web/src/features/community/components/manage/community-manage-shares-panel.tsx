"use client";

import { Share2 } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";

import { useCommunityPostShares } from "@/src/features/community/hooks/use-community-post-shares";
import { formatCommunityDateTime } from "@/src/features/community/utils/community-display.utils";

interface Props {
  postId: string;
  shareCount: number;
}

export function CommunityManageSharesPanel({ postId, shareCount }: Props) {
  const { shares, total, page, pageSize, isLoading, error, setPage, refetch } =
    useCommunityPostShares(postId);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const displayTotal = Math.max(total, shareCount);

  if (isLoading && shares.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load shares"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (shares.length === 0) {
    return (
      <div className="space-y-3">
        <Card className="rounded-xl border-[#E1EBF5] p-5">
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                Total Shares
              </p>
              <p className="text-2xl font-bold text-[#102A56]">{displayTotal}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border-[#E1EBF5] p-8 text-center">
          <p className="text-sm font-medium text-[#102A56]">No shares yet</p>
          <p className="mt-1 text-xs text-[#647A9B]">
            Users who share this post will appear here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="rounded-xl border-[#E1EBF5] p-5">
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Total Shares
            </p>
            <p className="text-2xl font-bold text-[#102A56]">{displayTotal}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[#EEF4FB] bg-[#F8FBFF] text-left text-xs uppercase tracking-wide text-[#647A9B]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Shared At</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share) => (
                <tr key={share.id} className="border-b border-[#EEF4FB]">
                  <td className="px-4 py-3 font-medium text-[#102A56]">
                    {share.user.name}
                  </td>
                  <td className="px-4 py-3 text-[#647A9B]">
                    {share.user.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#647A9B]">
                    {share.user.phone?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#647A9B]">
                    {formatCommunityDateTime(share.sharedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-xs text-[#647A9B]">
        <span>
          Showing {shares.length} of {total} shares
        </span>
        <CategoryPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
