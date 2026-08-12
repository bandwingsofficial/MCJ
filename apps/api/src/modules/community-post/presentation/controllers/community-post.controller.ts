import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetCommunityPostHandler } from '../../application/get-community-post/get-community-post.handler';
import { GetCommunityPostQuery } from '../../application/get-community-post/get-community-post.query';
import { IncrementCommunityPostShareCommand } from '../../application/increment-community-post-share/increment-community-post-share.command';
import { IncrementCommunityPostShareHandler } from '../../application/increment-community-post-share/increment-community-post-share.handler';
import { IncrementCommunityPostViewCommand } from '../../application/increment-community-post-view/increment-community-post-view.command';
import { IncrementCommunityPostViewHandler } from '../../application/increment-community-post-view/increment-community-post-view.handler';
import { ListCommunityPostsHandler } from '../../application/list-community-posts/list-community-posts.handler';
import { ListCommunityPostsQuery } from '../../application/list-community-posts/list-community-posts.query';
import { ListCommunityPostsQueryDto } from '../dtos/community-post.dto';

@ApiTags('Community Posts')
@Controller('community-posts')
export class CommunityPostController {
  constructor(
    private readonly listHandler: ListCommunityPostsHandler,
    private readonly getHandler: GetCommunityPostHandler,
    private readonly viewHandler: IncrementCommunityPostViewHandler,
    private readonly shareHandler: IncrementCommunityPostShareHandler,
  ) {}

  @Get()
  async list(@Query() query: ListCommunityPostsQueryDto) {
    const result = await this.listHandler.execute(
      new ListCommunityPostsQuery(undefined, query.search, false, true, query.skip, query.take),
    );
    return { success: true, message: 'Posts fetched successfully', data: result };
  }

  @Post(':id/view')
  async view(@Param('id') id: string) {
    const result = await this.viewHandler.execute(
      new IncrementCommunityPostViewCommand(id),
    );
    return { success: true, message: 'View recorded', data: result };
  }

  @Post(':id/share')
  async share(@Param('id') id: string) {
    const result = await this.shareHandler.execute(
      new IncrementCommunityPostShareCommand(id),
    );
    return { success: true, message: 'Share recorded', data: result };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getHandler.execute(
      new GetCommunityPostQuery(id, false, true, true, false),
    );
    return { success: true, message: 'Post fetched successfully', data: result };
  }
}
