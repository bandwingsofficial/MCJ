import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetCategoryHandler } from '../../application/get-category/get-category.handler';
import { GetCategoryQuery } from '../../application/get-category/get-category.query';
import { ListCategoriesHandler } from '../../application/list-categories/list-categories.handler';
import { ListCategoriesQuery } from '../../application/list-categories/list-categories.query';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly listCategoriesHandler: ListCategoriesHandler,
    private readonly getCategoryHandler: GetCategoryHandler,
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

    return {
      success: true,
      message: 'Categories fetched successfully',
      data: result,
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
