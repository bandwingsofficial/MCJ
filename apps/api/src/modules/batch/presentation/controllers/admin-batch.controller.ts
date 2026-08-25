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

import { AssignBatchCourseHandler } from '../../application/batch-courses/assign-batch-course.handler';
import { ListBatchCoursesHandler } from '../../application/batch-courses/list-batch-courses.handler';
import { RemoveBatchCourseHandler } from '../../application/batch-courses/remove-batch-course.handler';
import { AssignBatchTrainersCommand } from '../../application/assign-batch-trainers/assign-batch-trainers.command';
import { AssignBatchTrainersHandler } from '../../application/assign-batch-trainers/assign-batch-trainers.handler';
import { BulkDeleteBatchesCommand } from '../../application/bulk-delete-batches/bulk-delete-batches.command';
import { BulkDeleteBatchesHandler } from '../../application/bulk-delete-batches/bulk-delete-batches.handler';
import { BulkPermanentDeleteBatchesCommand } from '../../application/bulk-permanent-delete-batches/bulk-permanent-delete-batches.command';
import { BulkPermanentDeleteBatchesHandler } from '../../application/bulk-permanent-delete-batches/bulk-permanent-delete-batches.handler';
import { BulkRestoreBatchesCommand } from '../../application/bulk-restore-batches/bulk-restore-batches.command';
import { BulkRestoreBatchesHandler } from '../../application/bulk-restore-batches/bulk-restore-batches.handler';
import { BulkUpdateBatchStatusCommand } from '../../application/bulk-update-batch-status/bulk-update-batch-status.command';
import { BulkUpdateBatchStatusHandler } from '../../application/bulk-update-batch-status/bulk-update-batch-status.handler';
import { CreateBatchCommand } from '../../application/create-batch/create-batch.command';
import { CreateBatchHandler } from '../../application/create-batch/create-batch.handler';
import { DeleteBatchCommand } from '../../application/delete-batch/delete-batch.command';
import { DeleteBatchHandler } from '../../application/delete-batch/delete-batch.handler';
import { GetBatchHandler } from '../../application/get-batch/get-batch.handler';
import { GetBatchQuery } from '../../application/get-batch/get-batch.query';
import { GetBatchSummaryHandler } from '../../application/get-batch-summary/get-batch-summary.handler';
import { GetBatchSummaryQuery } from '../../application/get-batch-summary/get-batch-summary.query';
import { ListBatchesHandler } from '../../application/list-batches/list-batches.handler';
import { ListBatchesQuery } from '../../application/list-batches/list-batches.query';
import { PermanentDeleteBatchCommand } from '../../application/permanent-delete-batch/permanent-delete-batch.command';
import { PermanentDeleteBatchHandler } from '../../application/permanent-delete-batch/permanent-delete-batch.handler';
import { ReorderBatchesCommand } from '../../application/reorder-batches/reorder-batches.command';
import { ReorderBatchesHandler } from '../../application/reorder-batches/reorder-batches.handler';
import { RestoreBatchCommand } from '../../application/restore-batch/restore-batch.command';
import { RestoreBatchHandler } from '../../application/restore-batch/restore-batch.handler';
import { SuggestBatchCodeHandler } from '../../application/suggest-batch-code/suggest-batch-code.handler';
import { SuggestBatchCodeQuery } from '../../application/suggest-batch-code/suggest-batch-code.query';
import { UpdateBatchCommand } from '../../application/update-batch/update-batch.command';
import { UpdateBatchHandler } from '../../application/update-batch/update-batch.handler';
import { UpdateBatchStatusCommand } from '../../application/update-batch-status/update-batch-status.command';
import { UpdateBatchStatusHandler } from '../../application/update-batch-status/update-batch-status.handler';
import { AssignBatchCourseDto } from '../dtos/assign-batch-course.dto';
import { AssignBatchTrainersDto } from '../dtos/assign-batch-trainers.dto';
import { BulkBatchIdsDto } from '../dtos/bulk-batch-ids.dto';
import { BulkUpdateBatchStatusDto } from '../dtos/bulk-update-batch-status.dto';
import { CreateBatchDto } from '../dtos/create-batch.dto';
import { ListBatchesQueryDto } from '../dtos/list-batches-query.dto';
import { ReorderBatchesDto } from '../dtos/reorder-batches.dto';
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
    private readonly getBatchSummaryHandler: GetBatchSummaryHandler,
    private readonly deleteBatchHandler: DeleteBatchHandler,
    private readonly restoreBatchHandler: RestoreBatchHandler,
    private readonly permanentDeleteBatchHandler: PermanentDeleteBatchHandler,
    private readonly updateBatchStatusHandler: UpdateBatchStatusHandler,
    private readonly assignBatchTrainersHandler: AssignBatchTrainersHandler,
    private readonly suggestBatchCodeHandler: SuggestBatchCodeHandler,
    private readonly reorderBatchesHandler: ReorderBatchesHandler,
    private readonly bulkUpdateBatchStatusHandler: BulkUpdateBatchStatusHandler,
    private readonly bulkDeleteBatchesHandler: BulkDeleteBatchesHandler,
    private readonly bulkRestoreBatchesHandler: BulkRestoreBatchesHandler,
    private readonly bulkPermanentDeleteBatchesHandler: BulkPermanentDeleteBatchesHandler,
    private readonly listBatchCoursesHandler: ListBatchCoursesHandler,
    private readonly assignBatchCourseHandler: AssignBatchCourseHandler,
    private readonly removeBatchCourseHandler: RemoveBatchCourseHandler,
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
        dto.categoryId,
        dto.courseId,
        dto.startDate ? new Date(dto.startDate) : new Date(),
        dto.daysOfWeek,
        dto.capacity,
        dto.code,
        dto.slug,
        dto.description,
        dto.branchId,
        dto.endDate ? new Date(dto.endDate) : undefined,
        dto.startTime,
        dto.endTime,
        dto.enrolledCount,
        dto.mode,
        dto.classroom,
        dto.meetingLink,
        dto.isFeatured,
        dto.status,
        undefined,
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
        query.trainerId,
        query.mode,
        query.status,
        query.search,
        query.isFeatured,
        query.includeDeleted,
        false,
        query.isDeleted,
        query.isActive,
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

  @Get('suggest-code')
  async suggestCode(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const result = await this.suggestBatchCodeHandler.execute(
      new SuggestBatchCodeQuery(startTime, endTime),
    );

    return {
      success: true,
      message: 'Batch code suggested successfully',
      data: result,
    };
  }

  @Patch('reorder')
  async reorder(@Body() dto: ReorderBatchesDto) {
    const result = await this.reorderBatchesHandler.execute(
      new ReorderBatchesCommand(
        dto.batchId,
        dto.newDisplayOrder,
      ),
    );

    return {
      success: true,
      message: 'Batches reordered successfully',
      data: result,
    };
  }

  @Patch('bulk/status')
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateBatchStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkUpdateBatchStatusHandler.execute(
      new BulkUpdateBatchStatusCommand(
        dto.batchIds,
        dto.isActive,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/activate')
  async bulkActivate(
    @Body() dto: BulkBatchIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkUpdateBatchStatusHandler.execute(
      new BulkUpdateBatchStatusCommand(
        dto.batchIds,
        true,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/deactivate')
  async bulkDeactivate(
    @Body() dto: BulkBatchIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkUpdateBatchStatusHandler.execute(
      new BulkUpdateBatchStatusCommand(
        dto.batchIds,
        false,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/restore')
  async bulkRestore(
    @Body() dto: BulkBatchIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkRestoreBatchesHandler.execute(
      new BulkRestoreBatchesCommand(dto.batchIds, user?.sub),
    );

    return {
      success: true,
      message: 'Batches restored successfully',
      data: result,
    };
  }

  @Delete('bulk')
  async bulkDelete(
    @Body() dto: BulkBatchIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bulkDeleteBatchesHandler.execute(
      new BulkDeleteBatchesCommand(dto.batchIds, user?.sub),
    );

    return {
      success: true,
      message: 'Batches archived successfully',
      data: result,
    };
  }

  @Delete('bulk/permanent')
  async bulkPermanentDelete(@Body() dto: BulkBatchIdsDto) {
    const result =
      await this.bulkPermanentDeleteBatchesHandler.execute(
        new BulkPermanentDeleteBatchesCommand(dto.batchIds),
      );

    return {
      success: true,
      message: 'Batches permanently deleted successfully',
      data: result,
    };
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string) {
    const result = await this.getBatchSummaryHandler.execute(
      new GetBatchSummaryQuery(id),
    );

    return {
      success: true,
      message: 'Batch summary fetched successfully',
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
        dto.categoryId,
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

  @Get(':id/courses')
  async listCourses(@Param('id') id: string) {
    const result = await this.listBatchCoursesHandler.execute(id);

    return {
      success: true,
      message: 'Batch courses fetched successfully',
      data: result,
    };
  }

  @Post(':id/courses')
  @ApiBody({ type: AssignBatchCourseDto })
  async assignCourse(
    @Param('id') id: string,
    @Body() dto: AssignBatchCourseDto,
  ) {
    const result = await this.assignBatchCourseHandler.execute({
      batchId: id,
      courseId: dto.courseId,
      trainerId: dto.trainerId,
    });

    return {
      success: true,
      message: 'Course assigned to batch successfully',
      data: result,
    };
  }

  @Delete(':id/courses/:assignmentId')
  async removeCourse(
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    await this.removeBatchCourseHandler.execute({
      batchId: id,
      assignmentId,
    });

    return {
      success: true,
      message: 'Course removed from batch successfully',
      data: null,
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
