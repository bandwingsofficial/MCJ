import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetTrainerHandler } from '../../application/get-trainer/get-trainer.handler';
import { GetTrainerQuery } from '../../application/get-trainer/get-trainer.query';
import { ListTrainersHandler } from '../../application/list-trainers/list-trainers.handler';
import { ListTrainersQuery } from '../../application/list-trainers/list-trainers.query';
import { ListTrainersQueryDto } from '../dtos/list-trainers-query.dto';

@ApiTags('Trainers')
@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly listTrainersHandler: ListTrainersHandler,
    private readonly getTrainerHandler: GetTrainerHandler,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Active trainers listed',
  })
  async list(@Query() query: ListTrainersQueryDto) {
    const result = await this.listTrainersHandler.execute(
      new ListTrainersQuery(
        query.branchId,
        undefined,
        query.trainerType,
        query.search,
        query.isFeatured,
        false,
        undefined,
        true,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Trainers fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getTrainerHandler.execute(
      new GetTrainerQuery(id, false, true),
    );

    return {
      success: true,
      message: 'Trainer fetched successfully',
      data: result,
    };
  }
}
