import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreateCommunityPostCommand } from '../../application/create-community-post/create-community-post.command';
import { CreateCommunityPostHandler } from '../../application/create-community-post/create-community-post.handler';
import {
  DeleteCommunityPostCommand,
} from '../../application/delete-community-post/delete-community-post.command';
import { DeleteCommunityPostHandler } from '../../application/delete-community-post/delete-community-post.handler';
import { GetCommunityPostHandler } from '../../application/get-community-post/get-community-post.handler';
import { GetCommunityPostQuery } from '../../application/get-community-post/get-community-post.query';
import { ListCommunityPostsHandler } from '../../application/list-community-posts/list-community-posts.handler';
import { ListCommunityPostsQuery } from '../../application/list-community-posts/list-community-posts.query';
import { PermanentDeleteCommunityPostCommand } from '../../application/permanent-delete-community-post/permanent-delete-community-post.command';
import { PermanentDeleteCommunityPostHandler } from '../../application/permanent-delete-community-post/permanent-delete-community-post.handler';
import { RestoreCommunityPostCommand } from '../../application/restore-community-post/restore-community-post.command';
import { RestoreCommunityPostHandler } from '../../application/restore-community-post/restore-community-post.handler';
import { UpdateCommunityPostActivationCommand } from '../../application/update-community-post-activation/update-community-post-activation.command';
import { UpdateCommunityPostActivationHandler } from '../../application/update-community-post-activation/update-community-post-activation.handler';
import { UpdateCommunityPostCommand } from '../../application/update-community-post/update-community-post.command';
import { UpdateCommunityPostHandler } from '../../application/update-community-post/update-community-post.handler';
import {
  CreateCommunityPostDto,
  ListCommunityPostsQueryDto,
  UpdateCommunityPostDto,
} from '../dtos/community-post.dto';

@ApiTags('Admin Community Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/community-posts')
export class AdminCommunityPostController {
  constructor(
    private readonly createHandler: CreateCommunityPostHandler,
    private readonly updateHandler: UpdateCommunityPostHandler,
    private readonly listHandler: ListCommunityPostsHandler,
    private readonly getHandler: GetCommunityPostHandler,
    private readonly deleteHandler: DeleteCommunityPostHandler,
    private readonly restoreHandler: RestoreCommunityPostHandler,
    private readonly permanentDeleteHandler: PermanentDeleteCommunityPostHandler,
    private readonly activationHandler: UpdateCommunityPostActivationHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCommunityPostDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createHandler.execute(
      new CreateCommunityPostCommand(
        dto.type,
        dto.caption,
        dto.mediaFileId,
        dto.thumbnailUrl,
        dto.hashtags,
        dto.mentions,
        dto.location,
        dto.status,
        user?.sub,
      ),
    );
    return { success: true, message: 'Post created successfully', data: result };
  }

  @Get()
  async list(@Query() query: ListCommunityPostsQueryDto) {
    const result = await this.listHandler.execute(
      new ListCommunityPostsQuery(undefined, query.search, true, false, query.skip, query.take),
    );
    return { success: true, message: 'Posts fetched successfully', data: result };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getHandler.execute(
      new GetCommunityPostQuery(id, true, false, true, true),
    );
    return { success: true, message: 'Post fetched successfully', data: result };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityPostDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateHandler.execute(
      new UpdateCommunityPostCommand(
        id,
        dto.type,
        dto.caption,
        dto.mediaFileId,
        dto.thumbnailUrl,
        dto.hashtags,
        dto.mentions,
        dto.location,
        dto.status,
        user?.sub,
      ),
    );
    return { success: true, message: 'Post updated successfully', data: result };
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.activationHandler.execute(
      new UpdateCommunityPostActivationCommand(id, true, user?.sub),
    );
    return { success: true, message: 'Post activated successfully', data: result };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.activationHandler.execute(
      new UpdateCommunityPostActivationCommand(id, false, user?.sub),
    );
    return { success: true, message: 'Post deactivated successfully', data: result };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.deleteHandler.execute(
      new DeleteCommunityPostCommand(id, user?.sub),
    );
    return { success: true, message: 'Post deleted successfully', data: result };
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.restoreHandler.execute(
      new RestoreCommunityPostCommand(id, user?.sub),
    );
    return { success: true, message: 'Post restored successfully', data: result };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.permanentDeleteHandler.execute(
      new PermanentDeleteCommunityPostCommand(id),
    );
    return { success: true, message: 'Post permanently deleted', data: result };
  }
}
