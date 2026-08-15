import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetBatchHandler } from '../../application/get-batch/get-batch.handler';
import { GetBatchQuery } from '../../application/get-batch/get-batch.query';
import { ListBatchesHandler } from '../../application/list-batches/list-batches.handler';
import { ListBatchesQuery } from '../../application/list-batches/list-batches.query';
import { ListBatchesQueryDto } from '../dtos/list-batches-query.dto';

@ApiTags('Batches')
@Controller('batches')
export class BatchController {
  constructor(
    private readonly listBatchesHandler: ListBatchesHandler,
    private readonly getBatchHandler: GetBatchHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Active batches fetched' })
  async list(@Query() query: ListBatchesQueryDto) {
    const result = await this.listBatchesHandler.execute(
      new ListBatchesQuery(
        query.courseId,
        query.branchId,
        query.trainerId,
        query.mode,
        query.status,
        query.search,
        query.isFeatured,
        false,
        true,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Batches fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Active batch fetched' })
  async get(@Param('id') id: string) {
    const result = await this.getBatchHandler.execute(
      new GetBatchQuery(id, false, true),
    );

    return {
      success: true,
      message: 'Batch fetched successfully',
      data: result,
    };
  }
}
