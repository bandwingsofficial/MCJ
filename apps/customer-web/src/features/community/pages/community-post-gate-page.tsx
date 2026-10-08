"use client";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { useAuthModalController } from "@/src/features/auth/components/auth-modal-context";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { useAuthSessionReady } from "@/src/features/auth/hooks/use-auth-session";
import { CommunityPostPage } from "@/src/features/community/pages/community-post-page";
import { buildCommunityPostSharePath } from "@/src/features/community/utils/community-share-url";

interface Props {
  postId: string;
}

export function CommunityPostGatePage({ postId }: Props) {
  const { openAuthModal } = useAuthModalController();
  const redirectPath = buildCommunityPostSharePath(postId);
  const { authReady, hasSession } = useAuthSessionReady();

  if (!authReady) {
    return null;
  }

  if (hasSession) {
    return <CommunityPostPage postId={postId} />;
  }

  return (
    <AuthPageWrapper>
      <AuthCard
        title="Sign in required"
        description="Community posts are available to registered MCJ users only."
      >
        <div className="space-y-4 text-center text-sm">
          <p className="text-slate-600">
            Sign in to view the full post, including media and details.
          </p>
          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white"
            onClick={() =>
              openAuthModal({ mode: "login", redirectTo: redirectPath })
            }
          >
            Sign in to continue
          </button>
          <button
            type="button"
            onClick={() =>
              openAuthModal({ mode: "register", redirectTo: redirectPath })
            }
            className="text-primary hover:underline"
          >
            Create an account
          </button>
        </div>
      </AuthCard>
    </AuthPageWrapper>
  );
}
