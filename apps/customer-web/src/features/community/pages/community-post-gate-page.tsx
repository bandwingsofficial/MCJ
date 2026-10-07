"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { useAuthSessionReady } from "@/src/features/auth/hooks/use-auth-session";
import { CommunityPostPage } from "@/src/features/community/pages/community-post-page";
import { buildCommunityPostSharePath } from "@/src/features/community/utils/community-share-url";

interface Props {
  postId: string;
}

export function CommunityPostGatePage({ postId }: Props) {
  const router = useRouter();
  const redirectPath = buildCommunityPostSharePath(postId);
  const { authReady, hasSession } = useAuthSessionReady();

  if (!authReady) {
    return null;
  }

  if (hasSession) {
    return <CommunityPostPage postId={postId} />;
  }

  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;

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
          <Link
            href={loginHref}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white"
            onClick={(event) => {
              event.preventDefault();
              router.push(loginHref, { scroll: false });
            }}
          >
            Sign in to continue
          </Link>
          <Link href="/register" scroll={false} className="text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </AuthCard>
    </AuthPageWrapper>
  );
}
