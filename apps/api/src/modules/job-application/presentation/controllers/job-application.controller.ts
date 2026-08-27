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

import { CreateJobApplicationCommand } from '../../application/create-job-application/create-job-application.command';
import { CreateJobApplicationHandler } from '../../application/create-job-application/create-job-application.handler';
import { DeleteJobApplicationCommand } from '../../application/delete-job-application/delete-job-application.command';
import { DeleteJobApplicationHandler } from '../../application/delete-job-application/delete-job-application.handler';
import { GetJobApplicationHandler } from '../../application/get-job-application/get-job-application.handler';
import { GetJobApplicationQuery } from '../../application/get-job-application/get-job-application.query';
import { ListJobApplicationsHandler } from '../../application/list-job-applications/list-job-applications.handler';
import { ListJobApplicationsQuery } from '../../application/list-job-applications/list-job-applications.query';
import { RestoreJobApplicationCommand } from '../../application/restore-job-application/restore-job-application.command';
import { RestoreJobApplicationHandler } from '../../application/restore-job-application/restore-job-application.handler';
import { PermanentDeleteJobApplicationCommand } from '../../application/permanent-delete-job-application/permanent-delete-job-application.command';
import { PermanentDeleteJobApplicationHandler } from '../../application/permanent-delete-job-application/permanent-delete-job-application.handler';
import { UpdateJobApplicationStatusCommand } from '../../application/update-job-application-status/update-job-application-status.command';
import { UpdateJobApplicationStatusHandler } from '../../application/update-job-application-status/update-job-application-status.handler';
import { CreateJobApplicationDto } from '../dtos/create-job-application.dto';
import { ListJobApplicationsQueryDto } from '../dtos/list-job-applications-query.dto';
import { UpdateJobApplicationStatusDto } from '../dtos/update-job-application-status.dto';

@ApiTags('Job Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class PublicJobApplicationController {
  constructor(
    private readonly createJobApplicationHandler: CreateJobApplicationHandler,
  ) {}

  @Post(':jobId/apply')
  @ApiResponse({ status: 201, description: 'Application submitted' })
  async apply(
    @Param('jobId') jobId: string,
    @Body() dto: CreateJobApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createJobApplicationHandler.execute(
      new CreateJobApplicationCommand(
        user.sub,
        jobId,
        dto.resumeFileId,
        dto.coverLetter,
        dto.currentLocation,
        dto.expectedSalary,
        dto.remarks,
      ),
    );

    return {
      success: true,
      message: 'Application submitted successfully',
      data: result,
    };
  }
}

@ApiTags('Admin Job Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/job-applications')
export class AdminJobApplicationController {
  constructor(
    private readonly listJobApplicationsHandler: ListJobApplicationsHandler,
    private readonly getJobApplicationHandler: GetJobApplicationHandler,
    private readonly updateJobApplicationStatusHandler: UpdateJobApplicationStatusHandler,
    private readonly deleteJobApplicationHandler: DeleteJobApplicationHandler,
    private readonly restoreJobApplicationHandler: RestoreJobApplicationHandler,
    private readonly permanentDeleteJobApplicationHandler: PermanentDeleteJobApplicationHandler,
  ) {}

  @Get()
  async list(@Query() query: ListJobApplicationsQueryDto) {
    const result = await this.listJobApplicationsHandler.execute(
      new ListJobApplicationsQuery(
        query.jobId,
        query.studentId,
        query.status,
        query.search,
        query.includeDeleted,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Job applications fetched successfully',
      data: result.items,
      meta: {
        total: result.total,
        skip: query.skip,
        take: query.take,
      },
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getJobApplicationHandler.execute(
      new GetJobApplicationQuery(id, true),
    );

    return {
      success: true,
      message: 'Job application fetched successfully',
      data: result,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateJobApplicationStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result =
      await this.updateJobApplicationStatusHandler.execute(
        new UpdateJobApplicationStatusCommand(
          id,
          dto.status,
          user?.sub,
        ),
      );

    return {
      success: true,
      message: 'Application status updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteJobApplicationHandler.execute(
      new DeleteJobApplicationCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Job application deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreJobApplicationHandler.execute(
      new RestoreJobApplicationCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Job application restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result =
      await this.permanentDeleteJobApplicationHandler.execute(
        new PermanentDeleteJobApplicationCommand(id),
      );

    return {
      success: true,
      message: 'Job application permanently deleted successfully',
      data: result,
    };
  }
}
