import { Prisma } from '@prisma/client';

import type {
  CommunityPostCommentUserView,
  CommunityPostCommentView,
} from '../../domain/repositories/community-post-comment.repository';

const commentUserInclude = {
  user: {
    include: {
      profile: true,
    },
  },
} satisfies Prisma.CommunityPostCommentInclude;

type CommentWithUser = Prisma.CommunityPostCommentGetPayload<{
  include: typeof commentUserInclude;
}>;

export class CommunityPostCommentResponseMapper {
  static toView(
    record: CommentWithUser,
    replies: CommunityPostCommentView[] = [],
    options?: { includeModeration?: boolean },
  ): CommunityPostCommentView {
    const view: CommunityPostCommentView = {
      id: record.id,
      postId: record.postId,
      content: record.content,
      user: this.toUser(record),
      replies,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    if (options?.includeModeration) {
      view.isBlocked = record.isBlocked;
      view.isDeleted = record.isDeleted;
    }

    return view;
  }

  static nestComments(
    records: CommentWithUser[],
    options?: { includeModeration?: boolean },
  ): CommunityPostCommentView[] {
    const map = new Map<string, CommunityPostCommentView>();
    const roots: CommunityPostCommentView[] = [];

    for (const record of records) {
      map.set(
        record.id,
        this.toView(record, [], options),
      );
    }

    for (const record of records) {
      const view = map.get(record.id)!;

      if (record.parentId) {
        const parent = map.get(record.parentId);
        if (parent) {
          parent.replies.push(view);
        }
      } else {
        roots.push(view);
      }
    }

    const sortByCreatedAt = (
      items: CommunityPostCommentView[],
    ) => {
      items.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      items.forEach((item) => sortByCreatedAt(item.replies));
    };

    sortByCreatedAt(roots);
    return roots;
  }

  private static toUser(
    record: CommentWithUser,
  ): CommunityPostCommentUserView {
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

export { commentUserInclude as communityPostCommentUserInclude };
