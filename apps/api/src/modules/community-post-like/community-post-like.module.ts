import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CommunityPostModule } from '../community-post/community-post.module';
import { COMMUNITY_POST_TOKENS } from '../community-post/community-post.tokens';
import type { CommunityPostRepository } from '../community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../community-post/domain/services/community-post-domain.service';

import { COMMUNITY_POST_LIKE_TOKENS } from './community-post-like.tokens';
import { LikeCommunityPostHandler } from './application/like-community-post/like-community-post.handler';
import { ListCommunityPostLikesHandler } from './application/list-community-post-likes/list-community-post-likes.handler';
import { UnlikeCommunityPostHandler } from './application/unlike-community-post/unlike-community-post.handler';
import type { CommunityPostLikeRepository } from './domain/repositories/community-post-like.repository';
import { CommunityPostLikeDomainService } from './domain/services/community-post-like-domain.service';
import { PrismaCommunityPostLikeRepository } from './infrastructure/repositories/prisma-community-post-like.repository';
import { CommunityPostLikeController } from './presentation/controllers/community-post-like.controller';

@Module({
  imports: [PrismaModule, AuthModule, CommunityPostModule],
  controllers: [CommunityPostLikeController],
  providers: [
    CommunityPostLikeDomainService,
    {
      provide: COMMUNITY_POST_LIKE_TOKENS.COMMUNITY_POST_LIKE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCommunityPostLikeRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: LikeCommunityPostHandler,
      useFactory: (
        likeRepo: CommunityPostLikeRepository,
        postRepo: CommunityPostRepository,
        postDomain: CommunityPostDomainService,
        likeDomain: CommunityPostLikeDomainService,
      ) =>
        new LikeCommunityPostHandler(
          likeRepo,
          postRepo,
          postDomain,
          likeDomain,
        ),
      inject: [
        COMMUNITY_POST_LIKE_TOKENS.COMMUNITY_POST_LIKE_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
        CommunityPostLikeDomainService,
      ],
    },
    {
      provide: UnlikeCommunityPostHandler,
      useFactory: (
        likeRepo: CommunityPostLikeRepository,
        postRepo: CommunityPostRepository,
        postDomain: CommunityPostDomainService,
      ) => new UnlikeCommunityPostHandler(likeRepo, postRepo, postDomain),
      inject: [
        COMMUNITY_POST_LIKE_TOKENS.COMMUNITY_POST_LIKE_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
    {
      provide: ListCommunityPostLikesHandler,
      useFactory: (
        likeRepo: CommunityPostLikeRepository,
        postRepo: CommunityPostRepository,
        postDomain: CommunityPostDomainService,
      ) => new ListCommunityPostLikesHandler(likeRepo, postRepo, postDomain),
      inject: [
        COMMUNITY_POST_LIKE_TOKENS.COMMUNITY_POST_LIKE_REPOSITORY,
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
  ],
  exports: [
    COMMUNITY_POST_LIKE_TOKENS.COMMUNITY_POST_LIKE_REPOSITORY,
    CommunityPostLikeDomainService,
  ],
})
export class CommunityPostLikeModule {}
