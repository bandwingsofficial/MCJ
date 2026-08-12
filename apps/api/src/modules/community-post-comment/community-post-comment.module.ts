import { Module, forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CommunityPostModule } from '../community-post/community-post.module';
import { COMMUNITY_POST_TOKENS } from '../community-post/community-post.tokens';
import type { CommunityPostRepository } from '../community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../community-post/domain/services/community-post-domain.service';

import { COMMUNITY_POST_COMMENT_TOKENS } from './community-post-comment.tokens';
import { AdminBlockCommunityPostCommentHandler } from './application/admin-block-community-post-comment/admin-block-community-post-comment.handler';
import { AdminDeleteCommunityPostCommentHandler } from './application/admin-delete-community-post-comment/admin-delete-community-post-comment.handler';
import { AdminRestoreCommunityPostCommentHandler } from './application/admin-restore-community-post-comment/admin-restore-community-post-comment.handler';
import { AdminUnblockCommunityPostCommentHandler } from './application/admin-unblock-community-post-comment/admin-unblock-community-post-comment.handler';
import { CreateCommunityPostCommentHandler } from './application/create-community-post-comment/create-community-post-comment.handler';
import { DeleteCommunityPostCommentHandler } from './application/delete-community-post-comment/delete-community-post-comment.handler';
import { GetCommunityPostCommentHandler } from './application/get-community-post-comment/get-community-post-comment.handler';
import { ListCommunityPostCommentsHandler } from './application/list-community-post-comments/list-community-post-comments.handler';
import { ReplyCommunityPostCommentHandler } from './application/reply-community-post-comment/reply-community-post-comment.handler';
import { RestoreCommunityPostCommentHandler } from './application/restore-community-post-comment/restore-community-post-comment.handler';
import { UpdateCommunityPostCommentHandler } from './application/update-community-post-comment/update-community-post-comment.handler';
import type { CommunityPostCommentRepository } from './domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from './domain/services/community-post-comment-domain.service';
import { PrismaCommunityPostCommentRepository } from './infrastructure/repositories/prisma-community-post-comment.repository';
import {
  AdminCommunityPostCommentController,
  CommunityPostCommentController,
  CommunityPostCommentUserController,
} from './presentation/controllers/community-post-comment.controller';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => CommunityPostModule)],
  controllers: [
    CommunityPostCommentController,
    CommunityPostCommentUserController,
    AdminCommunityPostCommentController,
  ],
  providers: [
    CommunityPostCommentDomainService,
    SuperAdminGuard,
    {
      provide: COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCommunityPostCommentRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        postDomain: CommunityPostDomainService,
        domain: CommunityPostCommentDomainService,
      ) =>
        new CreateCommunityPostCommentHandler(
          commentRepo,
          postRepo,
          postDomain,
          domain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: ReplyCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        postDomain: CommunityPostDomainService,
        domain: CommunityPostCommentDomainService,
      ) =>
        new ReplyCommunityPostCommentHandler(
          commentRepo,
          postRepo,
          postDomain,
          domain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: ListCommunityPostCommentsHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        postDomain: CommunityPostDomainService,
      ) =>
        new ListCommunityPostCommentsHandler(
          commentRepo,
          postRepo,
          postDomain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
    {
      provide: GetCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        domain: CommunityPostCommentDomainService,
      ) => new GetCommunityPostCommentHandler(commentRepo, domain),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: UpdateCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        domain: CommunityPostCommentDomainService,
      ) => new UpdateCommunityPostCommentHandler(commentRepo, domain),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: DeleteCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        domain: CommunityPostCommentDomainService,
      ) =>
        new DeleteCommunityPostCommentHandler(
          commentRepo,
          postRepo,
          domain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: RestoreCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        domain: CommunityPostCommentDomainService,
      ) =>
        new RestoreCommunityPostCommentHandler(
          commentRepo,
          postRepo,
          domain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: AdminDeleteCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        domain: CommunityPostCommentDomainService,
      ) =>
        new AdminDeleteCommunityPostCommentHandler(
          commentRepo,
          postRepo,
          domain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: AdminRestoreCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        postRepo: CommunityPostRepository,
        domain: CommunityPostCommentDomainService,
      ) =>
        new AdminRestoreCommunityPostCommentHandler(
          commentRepo,
          postRepo,
          domain,
        ),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: AdminBlockCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        domain: CommunityPostCommentDomainService,
      ) => new AdminBlockCommunityPostCommentHandler(commentRepo, domain),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
    {
      provide: AdminUnblockCommunityPostCommentHandler,
      useFactory: (
        commentRepo: CommunityPostCommentRepository,
        domain: CommunityPostCommentDomainService,
      ) => new AdminUnblockCommunityPostCommentHandler(commentRepo, domain),
      inject: [
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
        CommunityPostCommentDomainService,
      ],
    },
  ],
  exports: [
    COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
    CommunityPostCommentDomainService,
  ],
})
export class CommunityPostCommentModule {}
