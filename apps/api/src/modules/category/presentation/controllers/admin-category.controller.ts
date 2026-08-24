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

import { BulkUpdateCategoryStatusCommand } from '../../application/bulk-update-category-status/bulk-update-category-status.command';
import { BulkUpdateCategoryStatusHandler } from '../../application/bulk-update-category-status/bulk-update-category-status.handler';

import { ReorderCategoriesCommand } from '../../application/reorder-categories/reorder-categories.command';
import { ReorderCategoriesHandler } from '../../application/reorder-categories/reorder-categories.handler';
import { GetCategoryDependenciesHandler } from '../../application/get-category-dependencies/get-category-dependencies.handler';

import { BulkCategoryIdsDto } from '../dtos/bulk-category-ids.dto';
import { BulkUpdateCategoryStatusDto } from '../dtos/bulk-update-category-status.dto';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { BulkDeleteCategoryDto } from '../dtos/bulk-delete-category.dto';
import { BulkPermanentDeleteCategoryDto } from '../dtos/bulk-permanent-delete-category.dto';
import { BulkRestoreCategoryDto } from '../dtos/bulk-restore-category.dto';
import { ReorderCategoriesDto } from '../dtos/reorder-categories.dto';
import { CheckCategoryAvailabilityHandler } from '../../application/check-category-availability/check-category-availability.handler';
import { CheckCategoryAvailabilityQuery } from '../../application/check-category-availability/check-category-availability.query';

function resolveCategoryIds(
  dto: { categoryIds?: string[]; ids?: string[] },
): string[] {
  return dto.categoryIds ?? dto.ids ?? [];
}

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
    private readonly bulkUpdateCategoryStatusHandler: BulkUpdateCategoryStatusHandler,
    private readonly bulkActivateCategoryHandler: BulkActivateCategoryHandler,
    private readonly bulkDeactivateCategoryHandler: BulkDeactivateCategoryHandler,
    private readonly bulkDeleteCategoryHandler: BulkDeleteCategoryHandler,
    private readonly bulkRestoreCategoryHandler: BulkRestoreCategoryHandler,
    private readonly bulkPermanentDeleteCategoryHandler: BulkPermanentDeleteCategoryHandler,
    private readonly reorderCategoriesHandler: ReorderCategoriesHandler,
    private readonly getCategoryDependenciesHandler: GetCategoryDependenciesHandler,
    private readonly checkCategoryAvailabilityHandler: CheckCategoryAvailabilityHandler,
  ) {}

  @Get('check-availability')
  @ApiResponse({
    status: 200,
    description: 'Category name/slug availability checked',
  })
  async checkAvailability(
    @Query('name') name?: string,
    @Query('slug') slug?: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const result =
      await this.checkCategoryAvailabilityHandler.execute(
        new CheckCategoryAvailabilityQuery(
          name,
          slug,
          excludeId,
        ),
      );

    return {
      success: true,
      message: 'Category availability checked successfully',
      data: result,
    };
  }

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
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Category created successfully',
      data: result,
    };
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Categories listed' })
  async list(@Query() query: ListCategoriesQueryDto) {
    const includeDeleted =
      query.includeDeleted ?? true;

    const result = await this.listCategoriesHandler.execute(
      new ListCategoriesQuery(
        query.branchId,
        query.status,
        query.search,
        includeDeleted,
        false,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Categories fetched successfully',
      data: result.items,
      meta: {
        total: result.total,
        skip: result.skip,
        take: result.take,
      },
    };
  }

  @Patch('reorder')
  @ApiResponse({ status: 200, description: 'Categories reordered' })
  async reorder(
    @Body() dto: ReorderCategoriesDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.reorderCategoriesHandler.execute(
      new ReorderCategoriesCommand(
        dto.categoryId,
        dto.newDisplayOrder,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Categories reordered successfully',
      data: result,
    };
  }

  @Patch('bulk/status')
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateCategoryStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result =
      await this.bulkUpdateCategoryStatusHandler.execute(
        new BulkUpdateCategoryStatusCommand(
          dto.categoryIds,
          dto.status,
          user?.sub,
        ),
      );

    return {
      success: true,
      message: 'Category statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/activate')
  async bulkActivate(
    @Body() dto: BulkCategoryIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkActivateCategoryHandler.execute(
      new BulkActivateCategoryCommand(
        dto.categoryIds,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Categories activated successfully',
      data: result,
    };
  }

  @Patch('bulk/deactivate')
  async bulkDeactivate(
    @Body() dto: BulkCategoryIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result =
      await this.bulkDeactivateCategoryHandler.execute(
        new BulkDeactivateCategoryCommand(
          dto.categoryIds,
          user?.sub,
        ),
      );

    return {
      success: true,
      message: 'Categories deactivated successfully',
      data: result,
    };
  }

  @Patch('bulk/restore')
  async bulkRestore(
    @Body() dto: BulkCategoryIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkRestoreCategoryHandler.execute(
      new BulkRestoreCategoryCommand(
        dto.categoryIds,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Categories restored successfully',
      data: result,
    };
  }

  @Delete('bulk')
  async bulkDelete(
    @Body() dto: BulkCategoryIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkDeleteCategoryHandler.execute(
      new BulkDeleteCategoryCommand(
        dto.categoryIds,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Categories deleted successfully',
      data: result,
    };
  }

  @Delete('bulk/permanent')
  async bulkPermanentDelete(
    @Body() dto: BulkCategoryIdsDto,
  ) {
    const result =
      await this.bulkPermanentDeleteCategoryHandler.execute(
        new BulkPermanentDeleteCategoryCommand(
          dto.categoryIds,
        ),
      );

    return {
      success: true,
      message: 'Categories permanently deleted successfully',
      data: result,
    };
  }

  @Patch('bulk-restore')
  async bulkRestoreLegacy(
    @Body() dto: BulkRestoreCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkRestoreCategoryHandler.execute(
      new BulkRestoreCategoryCommand(
        resolveCategoryIds(dto),
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Categories restored successfully',
      data: result,
    };
  }

  @Delete('bulk-permanent-delete')
  async bulkPermanentDeleteLegacy(
    @Body() dto: BulkPermanentDeleteCategoryDto,
  ) {
    const result =
      await this.bulkPermanentDeleteCategoryHandler.execute(
        new BulkPermanentDeleteCategoryCommand(
          resolveCategoryIds(dto),
        ),
      );

    return {
      success: true,
      message: 'Categories permanently deleted successfully',
      data: result,
    };
  }

  @Delete('bulk-delete')
  async bulkDeleteLegacy(
    @Body() dto: BulkDeleteCategoryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkDeleteCategoryHandler.execute(
      new BulkDeleteCategoryCommand(
        resolveCategoryIds(dto),
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Categories deleted successfully',
      data: result,
    };
  }

  @Get(':id/dependencies')
  @ApiResponse({
    status: 200,
    description: 'Category dependency counts',
  })
  async getDependencies(@Param('id') id: string) {
    const result =
      await this.getCategoryDependenciesHandler.execute(id);

    return {
      success: true,
      message: 'Category dependencies retrieved',
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
