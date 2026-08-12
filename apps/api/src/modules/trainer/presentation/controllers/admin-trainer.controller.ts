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

import { AssignTrainerCoursesCommand } from '../../application/assign-trainer-courses/assign-trainer-courses.command';
import { AssignTrainerCoursesHandler } from '../../application/assign-trainer-courses/assign-trainer-courses.handler';
import { CreateTrainerCommand } from '../../application/create-trainer/create-trainer.command';
import { CreateTrainerHandler } from '../../application/create-trainer/create-trainer.handler';
import { DeleteTrainerCommand } from '../../application/delete-trainer/delete-trainer.command';
import { DeleteTrainerHandler } from '../../application/delete-trainer/delete-trainer.handler';
import { GetTrainerHandler } from '../../application/get-trainer/get-trainer.handler';
import { GetTrainerQuery } from '../../application/get-trainer/get-trainer.query';
import { ListTrainersHandler } from '../../application/list-trainers/list-trainers.handler';
import { ListTrainersQuery } from '../../application/list-trainers/list-trainers.query';
import { PermanentDeleteTrainerCommand } from '../../application/permanent-delete-trainer/permanent-delete-trainer.command';
import { PermanentDeleteTrainerHandler } from '../../application/permanent-delete-trainer/permanent-delete-trainer.handler';
import { RestoreTrainerCommand } from '../../application/restore-trainer/restore-trainer.command';
import { RestoreTrainerHandler } from '../../application/restore-trainer/restore-trainer.handler';
import { UpdateTrainerCommand } from '../../application/update-trainer/update-trainer.command';
import { UpdateTrainerHandler } from '../../application/update-trainer/update-trainer.handler';
import { UpdateTrainerStatusCommand } from '../../application/update-trainer-status/update-trainer-status.command';
import { UpdateTrainerStatusHandler } from '../../application/update-trainer-status/update-trainer-status.handler';
import { AssignTrainerCoursesDto } from '../dtos/assign-trainer-courses.dto';
import { CreateTrainerDto } from '../dtos/create-trainer.dto';
import { ListTrainersQueryDto } from '../dtos/list-trainers-query.dto';
import { UpdateTrainerDto } from '../dtos/update-trainer.dto';

@ApiTags('Admin Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/trainers')
export class AdminTrainerController {
  constructor(
    private readonly createTrainerHandler: CreateTrainerHandler,
    private readonly updateTrainerHandler: UpdateTrainerHandler,
    private readonly listTrainersHandler: ListTrainersHandler,
    private readonly getTrainerHandler: GetTrainerHandler,
    private readonly deleteTrainerHandler: DeleteTrainerHandler,
    private readonly restoreTrainerHandler: RestoreTrainerHandler,
    private readonly permanentDeleteTrainerHandler: PermanentDeleteTrainerHandler,
    private readonly updateTrainerStatusHandler: UpdateTrainerStatusHandler,
    private readonly assignTrainerCoursesHandler: AssignTrainerCoursesHandler,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Trainer created' })
  async create(
    @Body() dto: CreateTrainerDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createTrainerHandler.execute(
      new CreateTrainerCommand(
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.phone,
        dto.gender,
        dto.bio,
        dto.qualification,
        dto.experienceYears,
        dto.specialization,
        dto.skills ?? [],
        dto.profileImageFileId,
        dto.employeeCode,
        dto.trainerType,
        dto.linkedInUrl,
        dto.youtubeUrl,
        dto.instagramUrl,
        dto.branchId ?? undefined,
        dto.averageRating,
        dto.totalReviews,
        dto.isFeatured,
        dto.status,
        dto.joinedAt ? new Date(dto.joinedAt) : undefined,
        dto.courseIds ?? [],
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Trainer created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListTrainersQueryDto) {
    const result = await this.listTrainersHandler.execute(
      new ListTrainersQuery(
        query.branchId,
        query.status,
        query.trainerType,
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
      message: 'Trainers fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getTrainerHandler.execute(
      new GetTrainerQuery(id, true),
    );

    return {
      success: true,
      message: 'Trainer fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrainerDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateTrainerHandler.execute(
      new UpdateTrainerCommand(
        id,
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.phone,
        dto.gender,
        dto.bio,
        dto.qualification,
        dto.experienceYears,
        dto.specialization,
        dto.skills,
        dto.profileImageFileId,
        dto.employeeCode,
        dto.trainerType,
        dto.linkedInUrl,
        dto.youtubeUrl,
        dto.instagramUrl,
        dto.branchId,
        dto.averageRating,
        dto.totalReviews,
        dto.isFeatured,
        dto.joinedAt ? new Date(dto.joinedAt) : undefined,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Trainer updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteTrainerHandler.execute(
      new DeleteTrainerCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Trainer deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreTrainerHandler.execute(
      new RestoreTrainerCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Trainer restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result =
      await this.permanentDeleteTrainerHandler.execute(
        new PermanentDeleteTrainerCommand(id),
      );

    return {
      success: true,
      message: 'Trainer permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateTrainerStatusHandler.execute(
      new UpdateTrainerStatusCommand(id, true, user?.sub),
    );

    return {
      success: true,
      message: 'Trainer activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateTrainerStatusHandler.execute(
      new UpdateTrainerStatusCommand(id, false, user?.sub),
    );

    return {
      success: true,
      message: 'Trainer deactivated successfully',
      data: result,
    };
  }

  @Patch(':id/assign-courses')
  async assignCourses(
    @Param('id') id: string,
    @Body() dto: AssignTrainerCoursesDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result =
      await this.assignTrainerCoursesHandler.execute(
        new AssignTrainerCoursesCommand(
          id,
          dto.courseIds,
          user?.sub,
        ),
      );

    return {
      success: true,
      message: 'Trainer courses updated successfully',
      data: result,
    };
  }
}
