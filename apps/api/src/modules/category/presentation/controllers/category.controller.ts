import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetCategoryHandler } from '../../application/get-category/get-category.handler';
import { GetCategoryQuery } from '../../application/get-category/get-category.query';
import { ListCategoriesHandler } from '../../application/list-categories/list-categories.handler';
import { ListCategoriesQuery } from '../../application/list-categories/list-categories.query';
import { CATEGORY_TOKENS } from '../../category.tokens';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly listCategoriesHandler: ListCategoriesHandler,
    private readonly getCategoryHandler: GetCategoryHandler,
    @Inject(CATEGORY_TOKENS.CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Active categories listed',
  })
  async list(@Query() query: ListCategoriesQueryDto) {
    const result = await this.listCategoriesHandler.execute(
      new ListCategoriesQuery(
        query.branchId,
        undefined,
        query.search,
        false,
        true,
        query.skip,
        query.take,
      ),
    );

    const courseCounts =
      await this.categoryRepo.countActiveCoursesByCategoryIds(
        result.items.map((item) => item.id),
      );

    return {
      success: true,
      message: 'Categories fetched successfully',
      data: result.items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        thumbnailFileId: item.thumbnailFileId,
        thumbnailUrl: item.thumbnailUrl,
        status: item.status,
        displayOrder: item.displayOrder,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy,
        isDeleted: item.isDeleted,
        deletedAt: item.deletedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        courseCount: courseCounts[item.id] ?? 0,
      })),
      meta: {
        total: result.total,
        skip: result.skip,
        take: result.take,
      },
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCategoryHandler.execute(
      new GetCategoryQuery(id, false, true),
    );

    return {
      success: true,
      message: 'Category fetched successfully',
      data: result,
    };
  }
}
