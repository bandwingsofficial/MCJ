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
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreateCategoryCommand } from '../../application/create-category/create-category.command';
import { CreateCategoryHandler } from '../../application/create-category/create-category.handler';
import { DeleteCategoryCommand } from '../../application/delete-category/delete-category.command';
import { DeleteCategoryHandler } from '../../application/delete-category/delete-category.handler';
import { GetCategoryHandler } from '../../application/get-category/get-category.handler';
import { GetCategoryQuery } from '../../application/get-category/get-category.query';
import { ListCategoriesHandler } from '../../application/list-categories/list-categories.handler';
import { ListCategoriesQuery } from '../../application/list-categories/list-categories.query';
import { PermanentDeleteCategoryCommand } from '../../application/permanent-delete-category/permanent-delete-category.command';
import { PermanentDeleteCategoryHandler } from '../../application/permanent-delete-category/permanent-delete-category.handler';
import { RestoreCategoryCommand } from '../../application/restore-category/restore-category.command';
import { RestoreCategoryHandler } from '../../application/restore-category/restore-category.handler';
import { UpdateCategoryCommand } from '../../application/update-category/update-category.command';
import { UpdateCategoryHandler } from '../../application/update-category/update-category.handler';
import { UpdateCategoryStatusCommand } from '../../application/update-category-status/update-category-status.command';
import { UpdateCategoryStatusHandler } from '../../application/update-category-status/update-category-status.handler';

import { BulkActivateCategoryCommand } from '../../application/bulk-activate-category/bulk-activate-category.command';
import { BulkActivateCategoryHandler } from '../../application/bulk-activate-category/bulk-activate-category.handler';

import { BulkDeactivateCategoryCommand } from '../../application/bulk-deactivate-category/bulk-deactivate-category.command';
import { BulkDeactivateCategoryHandler } from '../../application/bulk-deactivate-category/bulk-deactivate-category.handler';

import { BulkDeleteCategoryCommand } from '../../application/bulk-delete-category/bulk-delete-category.command';
import { BulkDeleteCategoryHandler } from '../../application/bulk-delete-category/bulk-delete-category.handler';

import { BulkPermanentDeleteCategoryCommand } from '../../application/bulk-permanent-delete-category/bulk-permanent-delete-category.command';
import { BulkPermanentDeleteCategoryHandler } from '../../application/bulk-permanent-delete-category/bulk-permanent-delete-category.handler';

import { BulkRestoreCategoryCommand } from '../../application/bulk-restore-category/bulk-restore-category.command';
import { BulkRestoreCategoryHandler } from '../../application/bulk-restore-category/bulk-restore-category.handler';

import { BulkActivateCategoryDto } from '../dtos/bulk-activate-category.dto';
import { BulkDeactivateCategoryDto } from '../dtos/bulk-deactivate-category.dto';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { BulkDeleteCategoryDto } from '../dtos/bulk-delete-category.dto';
import { BulkPermanentDeleteCategoryDto } from '../dtos/bulk-permanent-delete-category.dto';
import { BulkRestoreCategoryDto } from '../dtos/bulk-restore-category.dto';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(
    private readonly createCategoryHandler: CreateCategoryHandler,
    private readonly updateCategoryHandler: UpdateCategoryHandler,
    private readonly listCategoriesHandler: ListCategoriesHandler,
    private readonly getCategoryHandler: GetCategoryHandler,
    private readonly deleteCategoryHandler: DeleteCategoryHandler,
    private readonly restoreCategoryHandler: RestoreCategoryHandler,
    private readonly permanentDeleteCategoryHandler: PermanentDeleteCategoryHandler,
    private readonly updateCategoryStatusHandler: UpdateCategoryStatusHandler,
    private readonly bulkActivateCategoryHandler: BulkActivateCategoryHandler,
    private readonly bulkDeactivateCategoryHandler: BulkDeactivateCategoryHandler,
    private readonly bulkDeleteCategoryHandler: BulkDeleteCategoryHandler,
    private readonly bulkRestoreCategoryHandler: BulkRestoreCategoryHandler,
    private readonly bulkPermanentDeleteCategoryHandler: BulkPermanentDeleteCategoryHandler,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createCategoryHandler.execute(
      new CreateCategoryCommand(
        dto.name,
        dto.slug,
        dto.description,
        dto.thumbnailFileId,
        dto.status,
        dto.displayOrder,
        dto.branchId,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Category created successfully',
      data: result,
    };
  }

  @Patch('bulk-restore')
  async bulkRestore(
    @Body() dto: BulkRestoreCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkRestoreCategoryHandler.execute(
      new BulkRestoreCategoryCommand(dto.ids, user?.sub),
    );

    return {
      success: true,
      message: 'Categories restored successfully',
      data: result,
    };
  }

  @Delete('bulk-permanent-delete')
  async bulkPermanentDelete(
    @Body() dto: BulkPermanentDeleteCategoryDto,
  ) {
    const result =
      await this.bulkPermanentDeleteCategoryHandler.execute(
        new BulkPermanentDeleteCategoryCommand(dto.ids),
      );

    return {
      success: true,
      message:
        'Categories permanently deleted successfully',
      data: result,
    };
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Categories listed' })
  async list(@Query() query: ListCategoriesQueryDto) {
    const result = await this.listCategoriesHandler.execute(
      new ListCategoriesQuery(
        query.branchId,
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
      message: 'Categories fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCategoryHandler.execute(
      new GetCategoryQuery(id, true),
    );

    return {
      success: true,
      message: 'Category fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCategoryHandler.execute(
      new UpdateCategoryCommand(
        id,
        dto.name,
        dto.slug,
        dto.description,
        dto.thumbnailFileId,
        dto.displayOrder,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Category updated successfully',
      data: result,
    };
  }

  @Delete('bulk-delete')
  async bulkDelete(
    @Body() dto: BulkDeleteCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkDeleteCategoryHandler.execute(
      new BulkDeleteCategoryCommand(dto.ids, user?.sub),
    );

    return {
      success: true,
      message: 'Categories deleted successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.deleteCategoryHandler.execute(
      new DeleteCategoryCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Category deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.restoreCategoryHandler.execute(
      new RestoreCategoryCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Category restored successfully',
      data: result,
    };
  }

  @Patch('bulk/activate')
  async bulkActivate(
    @Body() dto: BulkActivateCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkActivateCategoryHandler.execute(
      new BulkActivateCategoryCommand(dto.ids, user?.sub),
    );

    return {
      success: true,
      message: 'Categories activated successfully',
      data: result,
    };
  }

  @Patch('bulk/deactivate')
  async bulkDeactivate(
    @Body() dto: BulkDeactivateCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkDeactivateCategoryHandler.execute(
      new BulkDeactivateCategoryCommand(dto.ids, user?.sub),
    );

    return {
      success: true,
      message: 'Categories deactivated successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.permanentDeleteCategoryHandler.execute(
      new PermanentDeleteCategoryCommand(id),
    );

    return {
      success: true,
      message: 'Category permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.updateCategoryStatusHandler.execute(
      new UpdateCategoryStatusCommand(id, true, user?.sub),
    );

    return {
      success: true,
      message: 'Category activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const result = await this.updateCategoryStatusHandler.execute(
      new UpdateCategoryStatusCommand(id, false, user?.sub),
    );

    return {
      success: true,
      message: 'Category deactivated successfully',
      data: result,
    };
  }
}
