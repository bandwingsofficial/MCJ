import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetFinancialArticleBySlugHandler } from '../../application/get-financial-article-by-slug/get-financial-article-by-slug.handler';
import { GetFinancialArticleBySlugQuery } from '../../application/get-financial-article-by-slug/get-financial-article-by-slug.query';
import { ListFinancialArticlesHandler } from '../../application/list-financial-articles/list-financial-articles.handler';
import { ListFinancialArticlesQuery } from '../../application/list-financial-articles/list-financial-articles.query';
import { ListFinancialArticlesQueryDto } from '../dtos/financial-article.dto';

@ApiTags('Financial Articles')
@Controller('financial-articles')
export class FinancialArticleController {
  constructor(
    private readonly listHandler: ListFinancialArticlesHandler,
    private readonly getBySlugHandler: GetFinancialArticleBySlugHandler,
  ) {}

  @Get()
  async list(@Query() query: ListFinancialArticlesQueryDto) {
    const result = await this.listHandler.execute(
      new ListFinancialArticlesQuery(
        query.categoryId,
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
      message: 'Financial articles fetched successfully',
      data: result,
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.getBySlugHandler.execute(
      new GetFinancialArticleBySlugQuery(slug, true),
    );

    return {
      success: true,
      message: 'Financial article fetched successfully',
      data: result,
    };
  }
}
