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

import { CreateFinancialArticleCommand } from '../../application/create-financial-article/create-financial-article.command';
import { CreateFinancialArticleHandler } from '../../application/create-financial-article/create-financial-article.handler';
import { DeleteFinancialArticleCommand } from '../../application/delete-financial-article/delete-financial-article.command';
import { DeleteFinancialArticleHandler } from '../../application/delete-financial-article/delete-financial-article.handler';
import { GetFinancialArticleHandler } from '../../application/get-financial-article/get-financial-article.handler';
import { GetFinancialArticleQuery } from '../../application/get-financial-article/get-financial-article.query';
import { ListFinancialArticlesHandler } from '../../application/list-financial-articles/list-financial-articles.handler';
import { ListFinancialArticlesQuery } from '../../application/list-financial-articles/list-financial-articles.query';
import { MoveFinancialArticleCommand } from '../../application/move-financial-article/move-financial-article.command';
import { MoveFinancialArticleHandler } from '../../application/move-financial-article/move-financial-article.handler';
import { PermanentDeleteFinancialArticleCommand } from '../../application/permanent-delete-financial-article/permanent-delete-financial-article.command';
import { PermanentDeleteFinancialArticleHandler } from '../../application/permanent-delete-financial-article/permanent-delete-financial-article.handler';
import { RestoreFinancialArticleCommand } from '../../application/restore-financial-article/restore-financial-article.command';
import { RestoreFinancialArticleHandler } from '../../application/restore-financial-article/restore-financial-article.handler';
import { UpdateFinancialArticleActivationCommand } from '../../application/update-financial-article-activation/update-financial-article-activation.command';
import { UpdateFinancialArticleActivationHandler } from '../../application/update-financial-article-activation/update-financial-article-activation.handler';
import { UpdateFinancialArticleCommand } from '../../application/update-financial-article/update-financial-article.command';
import { UpdateFinancialArticleHandler } from '../../application/update-financial-article/update-financial-article.handler';
import {
  CreateFinancialArticleDto,
  ListFinancialArticlesQueryDto,
  MoveFinancialArticleDto,
  UpdateFinancialArticleDto,
} from '../dtos/financial-article.dto';

@ApiTags('Admin Financial Articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/financial-articles')
export class AdminFinancialArticleController {
  constructor(
    private readonly createHandler: CreateFinancialArticleHandler,
    private readonly updateHandler: UpdateFinancialArticleHandler,
    private readonly listHandler: ListFinancialArticlesHandler,
    private readonly getHandler: GetFinancialArticleHandler,
    private readonly deleteHandler: DeleteFinancialArticleHandler,
    private readonly restoreHandler: RestoreFinancialArticleHandler,
    private readonly moveHandler: MoveFinancialArticleHandler,
    private readonly permanentDeleteHandler: PermanentDeleteFinancialArticleHandler,
    private readonly updateActivationHandler: UpdateFinancialArticleActivationHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateFinancialArticleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createHandler.execute(
      new CreateFinancialArticleCommand(
        dto.title,
        dto.categoryId,
        dto.content,
        dto.slug,
        dto.shortDescription,
        dto.thumbnailFileId,
        dto.bannerFileId,
        dto.authorName,
        dto.authorImage,
        dto.tags,
        dto.status,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Financial article created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListFinancialArticlesQueryDto) {
    const result = await this.listHandler.execute(
      new ListFinancialArticlesQuery(
        query.categoryId,
        query.status,
        query.search,
        query.includeDeleted,
        false,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Financial articles fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getHandler.execute(
      new GetFinancialArticleQuery(id, true),
    );

    return {
      success: true,
      message: 'Financial article fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFinancialArticleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateHandler.execute(
      new UpdateFinancialArticleCommand(
        id,
        dto.title,
        dto.slug,
        dto.shortDescription,
        dto.content,
        dto.thumbnailFileId,
        dto.bannerFileId,
        dto.authorName,
        dto.authorImage,
        dto.tags,
        dto.categoryId,
        dto.status,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Financial article updated successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateActivationHandler.execute(
      new UpdateFinancialArticleActivationCommand(id, true, user?.sub),
    );

    return {
      success: true,
      message: 'Financial article activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateActivationHandler.execute(
      new UpdateFinancialArticleActivationCommand(id, false, user?.sub),
    );

    return {
      success: true,
      message: 'Financial article deactivated successfully',
      data: result,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() dto: MoveFinancialArticleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.moveHandler.execute(
      new MoveFinancialArticleCommand(id, dto.newPosition, user?.sub),
    );

    return {
      success: true,
      message: 'Financial article moved successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteHandler.execute(
      new DeleteFinancialArticleCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Financial article deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreHandler.execute(
      new RestoreFinancialArticleCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Financial article restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.permanentDeleteHandler.execute(
      new PermanentDeleteFinancialArticleCommand(id),
    );

    return {
      success: true,
      message: 'Financial article permanently deleted successfully',
      data: result,
    };
  }
}
