"use client";

import { Avatar } from "@/src/shared/components/ui/avatar";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";

import { useCommunityPostLikes } from "@/src/features/community/hooks/use-community-post-likes";
import { formatCommunityDateTime } from "@/src/features/community/utils/community-display.utils";

interface Props {
  postId: string;
}

export function CommunityManageLikesPanel({ postId }: Props) {
  const { likes, total, page, pageSize, isLoading, error, setPage, refetch } =
    useCommunityPostLikes(postId);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load likes"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (likes.length === 0) {
    return (
      <Card className="rounded-xl border-[#E1EBF5] p-8 text-center">
        <p className="text-sm font-medium text-[#102A56]">No likes yet</p>
        <p className="mt-1 text-xs text-[#647A9B]">
          Users who like this post will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden rounded-xl border-[#E1EBF5]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[#EEF4FB] bg-[#F8FBFF] text-left text-xs uppercase tracking-wide text-[#647A9B]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Liked At</th>
              </tr>
            </thead>
            <tbody>
              {likes.map((like) => (
                <tr key={like.id} className="border-b border-[#EEF4FB]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={like.user.profileImage ?? ""}
                        alt={like.user.name}
                        fallback={like.user.name.slice(0, 2).toUpperCase()}
                      />
                      <span className="font-medium text-[#102A56]">
                        {like.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#647A9B]">
                    {formatCommunityDateTime(like.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-xs text-[#647A9B]">
        <span>
          Showing {likes.length} of {total} likes
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
