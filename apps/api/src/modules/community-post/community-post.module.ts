import { Module, forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';
import { CommunityPostCommentModule } from '../community-post-comment/community-post-comment.module';
import { COMMUNITY_POST_COMMENT_TOKENS } from '../community-post-comment/community-post-comment.tokens';
import type { CommunityPostCommentRepository } from '../community-post-comment/domain/repositories/community-post-comment.repository';

import { COMMUNITY_POST_TOKENS } from './community-post.tokens';
import { CreateCommunityPostHandler } from './application/create-community-post/create-community-post.handler';
import { DeleteCommunityPostHandler } from './application/delete-community-post/delete-community-post.handler';
import { GetCommunityPostHandler } from './application/get-community-post/get-community-post.handler';
import { IncrementCommunityPostShareHandler } from './application/increment-community-post-share/increment-community-post-share.handler';
import { IncrementCommunityPostViewHandler } from './application/increment-community-post-view/increment-community-post-view.handler';
import { ListCommunityPostsHandler } from './application/list-community-posts/list-community-posts.handler';
import { PermanentDeleteCommunityPostHandler } from './application/permanent-delete-community-post/permanent-delete-community-post.handler';
import { RestoreCommunityPostHandler } from './application/restore-community-post/restore-community-post.handler';
import { UpdateCommunityPostActivationHandler } from './application/update-community-post-activation/update-community-post-activation.handler';
import { UpdateCommunityPostHandler } from './application/update-community-post/update-community-post.handler';
import type { CommunityPostRepository } from './domain/repositories/community-post.repository';
import { CommunityPostDomainService } from './domain/services/community-post-domain.service';
import { PrismaCommunityPostRepository } from './infrastructure/repositories/prisma-community-post.repository';
import { AdminCommunityPostController } from './presentation/controllers/admin-community-post.controller';
import { CommunityPostController } from './presentation/controllers/community-post.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UploadsModule,
    forwardRef(() => CommunityPostCommentModule),
  ],
  controllers: [AdminCommunityPostController, CommunityPostController],
  providers: [
    CommunityPostDomainService,
    SuperAdminGuard,
    {
      provide: COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCommunityPostRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateCommunityPostHandler,
      useFactory: (
        repo: CommunityPostRepository,
        uploadDomainService: UploadDomainService,
      ) => new CreateCommunityPostHandler(repo, uploadDomainService),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        UploadDomainService,
      ],
    },
    {
      provide: UpdateCommunityPostHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
        uploadDomainService: UploadDomainService,
      ) => new UpdateCommunityPostHandler(repo, domain, uploadDomainService),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: ListCommunityPostsHandler,
      useFactory: (repo: CommunityPostRepository) =>
        new ListCommunityPostsHandler(repo),
      inject: [COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY],
    },
    {
      provide: GetCommunityPostHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
        commentRepo: CommunityPostCommentRepository,
      ) => new GetCommunityPostHandler(repo, domain, commentRepo),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
        COMMUNITY_POST_COMMENT_TOKENS.COMMUNITY_POST_COMMENT_REPOSITORY,
      ],
    },
    {
      provide: DeleteCommunityPostHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
      ) => new DeleteCommunityPostHandler(repo, domain),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
    {
      provide: RestoreCommunityPostHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
      ) => new RestoreCommunityPostHandler(repo, domain),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
    {
      provide: PermanentDeleteCommunityPostHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new PermanentDeleteCommunityPostHandler(
          repo,
          domain,
          uploadDomainService,
        ),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: UpdateCommunityPostActivationHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
      ) => new UpdateCommunityPostActivationHandler(repo, domain),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
    {
      provide: IncrementCommunityPostViewHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
      ) => new IncrementCommunityPostViewHandler(repo, domain),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
    {
      provide: IncrementCommunityPostShareHandler,
      useFactory: (
        repo: CommunityPostRepository,
        domain: CommunityPostDomainService,
      ) => new IncrementCommunityPostShareHandler(repo, domain),
      inject: [
        COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
        CommunityPostDomainService,
      ],
    },
  ],
  exports: [
    COMMUNITY_POST_TOKENS.COMMUNITY_POST_REPOSITORY,
    CommunityPostDomainService,
  ],
})
export class CommunityPostModule {}
