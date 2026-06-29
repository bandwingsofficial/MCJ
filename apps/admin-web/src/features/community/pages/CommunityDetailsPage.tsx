"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import {
  CommunityCommentList,
  CommunityDetailHeader,
  CommunityMediaPreview,
  CommunityStatistics,
} from "@/src/features/community/components";
import { useCommunityPost } from "@/src/features/community/hooks";

interface CommunityDetailsPageProps {
  postId: string;
}

export function CommunityDetailsPage({
  postId,
}: CommunityDetailsPageProps) {
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useCommunityPost(postId);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load community post"
        description="Something went wrong while loading the community post."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const post = data.data;

  return (
    <div className="space-y-6">
      <CommunityDetailHeader
        post={post}
      />

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() =>
            router.back()
          }
        >
          Back
        </Button>
      </div>

      <CommunityMediaPreview
        post={post}
      />

      <CommunityStatistics
        post={post}
      />

      <div className="rounded-lg border bg-white p-6 space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            Caption
          </h3>

          <p>
            {post.caption}
          </p>
        </div>

        {post.location && (
          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Location
            </h3>

            <p>
              {post.location}
            </p>
          </div>
        )}

        {post.hashtags.length >
          0 && (
          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Hashtags
            </h3>

            <div className="flex flex-wrap gap-2">
              {post.hashtags.map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded bg-slate-100 px-3 py-1 text-sm"
                  >
                    #{tag}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        {post.mentions.length >
          0 && (
          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Mentions
            </h3>

            <div className="flex flex-wrap gap-2">
              {post.mentions.map(
                (
                  mention,
                ) => (
                  <span
                    key={
                      mention
                    }
                    className="rounded bg-slate-100 px-3 py-1 text-sm"
                  >
                    @{mention}
                  </span>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Comments
        </h2>

        <CommunityCommentList
          comments={
            post.comments
          }
        />
      </div>
    </div>
  );
}