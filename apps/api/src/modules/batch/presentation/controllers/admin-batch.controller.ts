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
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { AssignBatchTrainersCommand } from '../../application/assign-batch-trainers/assign-batch-trainers.command';
import { AssignBatchTrainersHandler } from '../../application/assign-batch-trainers/assign-batch-trainers.handler';
import { CreateBatchCommand } from '../../application/create-batch/create-batch.command';
import { CreateBatchHandler } from '../../application/create-batch/create-batch.handler';
import { DeleteBatchCommand } from '../../application/delete-batch/delete-batch.command';
import { DeleteBatchHandler } from '../../application/delete-batch/delete-batch.handler';
import { GetBatchHandler } from '../../application/get-batch/get-batch.handler';
import { GetBatchQuery } from '../../application/get-batch/get-batch.query';
import { ListBatchesHandler } from '../../application/list-batches/list-batches.handler';
import { ListBatchesQuery } from '../../application/list-batches/list-batches.query';
import { PermanentDeleteBatchCommand } from '../../application/permanent-delete-batch/permanent-delete-batch.command';
import { PermanentDeleteBatchHandler } from '../../application/permanent-delete-batch/permanent-delete-batch.handler';
import { RestoreBatchCommand } from '../../application/restore-batch/restore-batch.command';
import { RestoreBatchHandler } from '../../application/restore-batch/restore-batch.handler';
import { UpdateBatchCommand } from '../../application/update-batch/update-batch.command';
import { UpdateBatchHandler } from '../../application/update-batch/update-batch.handler';
import { UpdateBatchStatusCommand } from '../../application/update-batch-status/update-batch-status.command';
import { UpdateBatchStatusHandler } from '../../application/update-batch-status/update-batch-status.handler';
import { AssignBatchTrainersDto } from '../dtos/assign-batch-trainers.dto';
import { CreateBatchDto } from '../dtos/create-batch.dto';
import { ListBatchesQueryDto } from '../dtos/list-batches-query.dto';
import { UpdateBatchDto } from '../dtos/update-batch.dto';

@ApiTags('Admin Batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/batches')
export class AdminBatchController {
  constructor(
    private readonly createBatchHandler: CreateBatchHandler,
    private readonly updateBatchHandler: UpdateBatchHandler,
    private readonly listBatchesHandler: ListBatchesHandler,
    private readonly getBatchHandler: GetBatchHandler,
    private readonly deleteBatchHandler: DeleteBatchHandler,
    private readonly restoreBatchHandler: RestoreBatchHandler,
    private readonly permanentDeleteBatchHandler: PermanentDeleteBatchHandler,
    private readonly updateBatchStatusHandler: UpdateBatchStatusHandler,
    private readonly assignBatchTrainersHandler: AssignBatchTrainersHandler,
  ) {}

  @Post()
  @ApiBody({ type: CreateBatchDto })
  @ApiResponse({ status: 201, description: 'Batch created' })
  async create(
    @Body() dto: CreateBatchDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createBatchHandler.execute(
      new CreateBatchCommand(
        dto.name,
        dto.code,
        dto.courseId,
        new Date(dto.startDate),
        dto.startTime,
        dto.endTime,
        dto.daysOfWeek,
        dto.capacity,
        dto.slug,
        dto.description,
        dto.branchId,
        dto.endDate ? new Date(dto.endDate) : undefined,
        dto.enrolledCount,
        dto.mode,
        dto.classroom,
        dto.meetingLink,
        dto.isFeatured,
        dto.status,
        dto.trainerIds ?? [],
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListBatchesQueryDto) {
    const result = await this.listBatchesHandler.execute(
      new ListBatchesQuery(
        query.courseId,
        query.branchId,
        query.status,
        query.search,
        query.isFeatured,
        query.includeDeleted,
        false,
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
  async get(@Param('id') id: string) {
    const result = await this.getBatchHandler.execute(
      new GetBatchQuery(id, true),
    );

    return {
      success: true,
      message: 'Batch fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiBody({ type: UpdateBatchDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBatchDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateBatchHandler.execute(
      new UpdateBatchCommand(
        id,
        dto.name,
        dto.code,
        dto.slug,
        dto.description,
        dto.courseId,
        dto.branchId,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.endDate ? new Date(dto.endDate) : undefined,
        dto.startTime,
        dto.endTime,
        dto.daysOfWeek,
        dto.capacity,
        dto.enrolledCount,
        dto.mode,
        dto.classroom,
        dto.meetingLink,
        dto.isFeatured,
        dto.status,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteBatchHandler.execute(
      new DeleteBatchCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Batch deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreBatchHandler.execute(
      new RestoreBatchCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Batch restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result =
      await this.permanentDeleteBatchHandler.execute(
        new PermanentDeleteBatchCommand(id),
      );

    return {
      success: true,
      message: 'Batch permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateBatchStatusHandler.execute(
      new UpdateBatchStatusCommand(id, true, user?.sub),
    );

    return {
      success: true,
      message: 'Batch activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateBatchStatusHandler.execute(
      new UpdateBatchStatusCommand(id, false, user?.sub),
    );

    return {
      success: true,
      message: 'Batch deactivated successfully',
      data: result,
    };
  }

  @Patch(':id/assign-trainers')
  @ApiBody({ type: AssignBatchTrainersDto })
  async assignTrainers(
    @Param('id') id: string,
    @Body() dto: AssignBatchTrainersDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result =
      await this.assignBatchTrainersHandler.execute(
        new AssignBatchTrainersCommand(
          id,
          dto.trainerIds,
          user?.sub,
        ),
      );

    return {
      success: true,
      message: 'Batch trainers updated successfully',
      data: result,
    };
  }
}
