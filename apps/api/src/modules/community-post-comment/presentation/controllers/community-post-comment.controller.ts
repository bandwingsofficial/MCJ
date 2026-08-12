import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { AdminBlockCommunityPostCommentCommand } from '../../application/admin-block-community-post-comment/admin-block-community-post-comment.command';
import { AdminBlockCommunityPostCommentHandler } from '../../application/admin-block-community-post-comment/admin-block-community-post-comment.handler';
import { AdminDeleteCommunityPostCommentCommand } from '../../application/admin-delete-community-post-comment/admin-delete-community-post-comment.command';
import { AdminDeleteCommunityPostCommentHandler } from '../../application/admin-delete-community-post-comment/admin-delete-community-post-comment.handler';
import { AdminRestoreCommunityPostCommentCommand } from '../../application/admin-restore-community-post-comment/admin-restore-community-post-comment.command';
import { AdminRestoreCommunityPostCommentHandler } from '../../application/admin-restore-community-post-comment/admin-restore-community-post-comment.handler';
import { AdminUnblockCommunityPostCommentCommand } from '../../application/admin-unblock-community-post-comment/admin-unblock-community-post-comment.command';
import { AdminUnblockCommunityPostCommentHandler } from '../../application/admin-unblock-community-post-comment/admin-unblock-community-post-comment.handler';
import { CreateCommunityPostCommentCommand } from '../../application/create-community-post-comment/create-community-post-comment.command';
import { CreateCommunityPostCommentHandler } from '../../application/create-community-post-comment/create-community-post-comment.handler';
import { DeleteCommunityPostCommentCommand } from '../../application/delete-community-post-comment/delete-community-post-comment.command';
import { DeleteCommunityPostCommentHandler } from '../../application/delete-community-post-comment/delete-community-post-comment.handler';
import { GetCommunityPostCommentHandler } from '../../application/get-community-post-comment/get-community-post-comment.handler';
import { GetCommunityPostCommentQuery } from '../../application/get-community-post-comment/get-community-post-comment.query';
import { ListCommunityPostCommentsHandler } from '../../application/list-community-post-comments/list-community-post-comments.handler';
import { ListCommunityPostCommentsQuery } from '../../application/list-community-post-comments/list-community-post-comments.query';
import { ReplyCommunityPostCommentCommand } from '../../application/reply-community-post-comment/reply-community-post-comment.command';
import { ReplyCommunityPostCommentHandler } from '../../application/reply-community-post-comment/reply-community-post-comment.handler';
import { RestoreCommunityPostCommentCommand } from '../../application/restore-community-post-comment/restore-community-post-comment.command';
import { RestoreCommunityPostCommentHandler } from '../../application/restore-community-post-comment/restore-community-post-comment.handler';
import { UpdateCommunityPostCommentCommand } from '../../application/update-community-post-comment/update-community-post-comment.command';
import { UpdateCommunityPostCommentHandler } from '../../application/update-community-post-comment/update-community-post-comment.handler';
import {
  CreateCommunityPostCommentDto,
  ReplyCommunityPostCommentDto,
  UpdateCommunityPostCommentDto,
} from '../dtos/community-post-comment.dto';

@ApiTags('Community Post Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community-posts')
export class CommunityPostCommentController {
  constructor(
    private readonly createHandler: CreateCommunityPostCommentHandler,
    private readonly replyHandler: ReplyCommunityPostCommentHandler,
    private readonly listHandler: ListCommunityPostCommentsHandler,
    private readonly getHandler: GetCommunityPostCommentHandler,
    private readonly updateHandler: UpdateCommunityPostCommentHandler,
    private readonly deleteHandler: DeleteCommunityPostCommentHandler,
    private readonly restoreHandler: RestoreCommunityPostCommentHandler,
  ) {}

  @Post(':id/comments')
  async create(
    @Param('id') postId: string,
    @Body() dto: CreateCommunityPostCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createHandler.execute(
      new CreateCommunityPostCommentCommand(postId, user.sub, dto.content),
    );
    return { success: true, message: 'Comment created successfully', data: result };
  }

  @Get(':id/comments')
  async list(@Param('id') postId: string) {
    const result = await this.listHandler.execute(
      new ListCommunityPostCommentsQuery(postId, true, false),
    );
    return { success: true, message: 'Comments fetched successfully', data: result };
  }

  @Get(':id/comments/:commentId')
  async get(@Param('commentId') commentId: string) {
    const result = await this.getHandler.execute(
      new GetCommunityPostCommentQuery(commentId, false, false),
    );
    return { success: true, message: 'Comment fetched successfully', data: result };
  }

  @Post(':postId/comments/:commentId/reply')
  async reply(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: ReplyCommunityPostCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.replyHandler.execute(
      new ReplyCommunityPostCommentCommand(
        postId,
        commentId,
        user.sub,
        dto.content,
      ),
    );
    return { success: true, message: 'Reply created successfully', data: result };
  }
}

@ApiTags('Community Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community-posts/comments')
export class CommunityPostCommentUserController {
  constructor(
    private readonly updateHandler: UpdateCommunityPostCommentHandler,
    private readonly deleteHandler: DeleteCommunityPostCommentHandler,
    private readonly restoreHandler: RestoreCommunityPostCommentHandler,
  ) {}

  @Patch(':commentId')
  async update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommunityPostCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateHandler.execute(
      new UpdateCommunityPostCommentCommand(commentId, user.sub, dto.content),
    );
    return { success: true, message: 'Comment updated successfully', data: result };
  }

  @Delete(':commentId')
  async delete(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteHandler.execute(
      new DeleteCommunityPostCommentCommand(commentId, user.sub),
    );
    return { success: true, message: 'Comment deleted successfully', data: result };
  }

  @Patch(':commentId/restore')
  async restore(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreHandler.execute(
      new RestoreCommunityPostCommentCommand(commentId, user.sub),
    );
    return { success: true, message: 'Comment restored successfully', data: result };
  }
}

@ApiTags('Admin Community Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/community-comments')
export class AdminCommunityPostCommentController {
  constructor(
    private readonly deleteHandler: AdminDeleteCommunityPostCommentHandler,
    private readonly restoreHandler: AdminRestoreCommunityPostCommentHandler,
    private readonly blockHandler: AdminBlockCommunityPostCommentHandler,
    private readonly unblockHandler: AdminUnblockCommunityPostCommentHandler,
  ) {}

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.deleteHandler.execute(
      new AdminDeleteCommunityPostCommentCommand(id),
    );
    return { success: true, message: 'Comment deleted successfully', data: result };
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    const result = await this.restoreHandler.execute(
      new AdminRestoreCommunityPostCommentCommand(id),
    );
    return { success: true, message: 'Comment restored successfully', data: result };
  }

  @Patch(':id/block')
  async block(@Param('id') id: string) {
    const result = await this.blockHandler.execute(
      new AdminBlockCommunityPostCommentCommand(id),
    );
    return { success: true, message: 'Comment blocked successfully', data: result };
  }

  @Patch(':id/unblock')
  async unblock(@Param('id') id: string) {
    const result = await this.unblockHandler.execute(
      new AdminUnblockCommunityPostCommentCommand(id),
    );
    return { success: true, message: 'Comment unblocked successfully', data: result };
  }
}
