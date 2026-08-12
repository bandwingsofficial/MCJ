import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { LikeCommunityPostCommand } from '../../application/like-community-post/like-community-post.command';
import { LikeCommunityPostHandler } from '../../application/like-community-post/like-community-post.handler';
import { ListCommunityPostLikesHandler } from '../../application/list-community-post-likes/list-community-post-likes.handler';
import { ListCommunityPostLikesQuery } from '../../application/list-community-post-likes/list-community-post-likes.query';
import { UnlikeCommunityPostCommand } from '../../application/unlike-community-post/unlike-community-post.command';
import { UnlikeCommunityPostHandler } from '../../application/unlike-community-post/unlike-community-post.handler';

@ApiTags('Community Post Likes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community-posts')
export class CommunityPostLikeController {
  constructor(
    private readonly likeHandler: LikeCommunityPostHandler,
    private readonly unlikeHandler: UnlikeCommunityPostHandler,
    private readonly listLikesHandler: ListCommunityPostLikesHandler,
  ) {}

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.likeHandler.execute(new LikeCommunityPostCommand(id, user.sub));
    return { success: true, message: 'Post liked successfully', data: null };
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.unlikeHandler.execute(
      new UnlikeCommunityPostCommand(id, user.sub),
    );
    return { success: true, message: 'Post unliked successfully', data: null };
  }

  @Get(':id/likes')
  async listLikes(@Param('id') id: string) {
    const result = await this.listLikesHandler.execute(
      new ListCommunityPostLikesQuery(id),
    );
    return { success: true, message: 'Likes fetched successfully', data: result };
  }
}
