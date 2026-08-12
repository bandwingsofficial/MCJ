import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetJobBySlugHandler } from '../../application/get-job-by-slug/get-job-by-slug.handler';
import { GetJobBySlugQuery } from '../../application/get-job-by-slug/get-job-by-slug.query';
import { GetJobHandler } from '../../application/get-job/get-job.handler';
import { GetJobQuery } from '../../application/get-job/get-job.query';
import { ListJobsHandler } from '../../application/list-jobs/list-jobs.handler';
import { ListJobsQuery } from '../../application/list-jobs/list-jobs.query';
import { ListJobsQueryDto } from '../dtos/list-jobs-query.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(
    private readonly listJobsHandler: ListJobsHandler,
    private readonly getJobHandler: GetJobHandler,
    private readonly getJobBySlugHandler: GetJobBySlugHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Active jobs listed' })
  async list(@Query() query: ListJobsQueryDto) {
    const result = await this.listJobsHandler.execute(
      new ListJobsQuery(
        undefined,
        query.employmentType,
        query.search,
        false,
        false,
        true,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Jobs fetched successfully',
      data: result,
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.getJobBySlugHandler.execute(
      new GetJobBySlugQuery(slug, true),
    );

    return {
      success: true,
      message: 'Job fetched successfully',
      data: result,
    };
  }
}
