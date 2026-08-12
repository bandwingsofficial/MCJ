import { Prisma } from '@prisma/client';

import type {
  CommunityPostLikeUserView,
  CommunityPostLikeView,
} from '../../domain/repositories/community-post-like.repository';

const userInclude = {
  user: {
    include: {
      profile: true,
    },
  },
} satisfies Prisma.CommunityPostLikeInclude;

type LikeWithUser = Prisma.CommunityPostLikeGetPayload<{
  include: typeof userInclude;
}>;

export class CommunityPostLikeResponseMapper {
  static toView(record: LikeWithUser): CommunityPostLikeView {
    return {
      id: record.id,
      postId: record.postId,
      userId: record.userId,
      user: this.toUser(record),
      createdAt: record.createdAt,
    };
  }

  private static toUser(record: LikeWithUser): CommunityPostLikeUserView {
    const profile = record.user.profile;
    const name =
      [profile?.firstName, profile?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || record.user.name;

    return {
      id: record.userId,
      name,
      profileImage: profile?.profileImage ?? null,
    };
  }
}

export { userInclude as communityPostLikeUserInclude };
