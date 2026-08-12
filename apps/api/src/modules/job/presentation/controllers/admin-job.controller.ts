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

import { CreateJobCommand } from '../../application/create-job/create-job.command';
import { CreateJobHandler } from '../../application/create-job/create-job.handler';
import { DeleteJobCommand } from '../../application/delete-job/delete-job.command';
import { DeleteJobHandler } from '../../application/delete-job/delete-job.handler';
import { GetJobHandler } from '../../application/get-job/get-job.handler';
import { GetJobQuery } from '../../application/get-job/get-job.query';
import { ListJobsHandler } from '../../application/list-jobs/list-jobs.handler';
import { ListJobsQuery } from '../../application/list-jobs/list-jobs.query';
import { PermanentDeleteJobCommand } from '../../application/permanent-delete-job/permanent-delete-job.command';
import { PermanentDeleteJobHandler } from '../../application/permanent-delete-job/permanent-delete-job.handler';
import { RestoreJobCommand } from '../../application/restore-job/restore-job.command';
import { RestoreJobHandler } from '../../application/restore-job/restore-job.handler';
import { UpdateJobActivationCommand } from '../../application/update-job-activation/update-job-activation.command';
import { UpdateJobActivationHandler } from '../../application/update-job-activation/update-job-activation.handler';
import { UpdateJobCommand } from '../../application/update-job/update-job.command';
import { UpdateJobHandler } from '../../application/update-job/update-job.handler';
import { CreateJobDto } from '../dtos/create-job.dto';
import { ListJobsQueryDto } from '../dtos/list-jobs-query.dto';
import { UpdateJobDto } from '../dtos/update-job.dto';

@ApiTags('Admin Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/jobs')
export class AdminJobController {
  constructor(
    private readonly createJobHandler: CreateJobHandler,
    private readonly updateJobHandler: UpdateJobHandler,
    private readonly listJobsHandler: ListJobsHandler,
    private readonly getJobHandler: GetJobHandler,
    private readonly deleteJobHandler: DeleteJobHandler,
    private readonly restoreJobHandler: RestoreJobHandler,
    private readonly permanentDeleteJobHandler: PermanentDeleteJobHandler,
    private readonly updateJobActivationHandler: UpdateJobActivationHandler,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Job created' })
  async create(
    @Body() dto: CreateJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createJobHandler.execute(
      new CreateJobCommand(
        dto.title,
        dto.companyName,
        dto.employmentType,
        dto.workingDays,
        dto.slug,
        dto.companyLogo,
        dto.companyWebsite,
        dto.companyDescription,
        dto.description,
        dto.shortDescription,
        dto.location,
        dto.city,
        dto.state,
        dto.country,
        dto.isRemote,
        dto.minExperience,
        dto.maxExperience,
        dto.minSalary,
        dto.maxSalary,
        dto.salaryCurrency,
        dto.vacancies,
        dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
        dto.responsibilities,
        dto.skills,
        dto.eligibilityTitle,
        dto.interviewProcess,
        dto.status,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Job created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListJobsQueryDto) {
    const result = await this.listJobsHandler.execute(
      new ListJobsQuery(
        query.status,
        query.employmentType,
        query.search,
        query.includeDeleted,
        false,
        false,
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

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getJobHandler.execute(
      new GetJobQuery(id, true),
    );

    return {
      success: true,
      message: 'Job fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateJobHandler.execute(
      new UpdateJobCommand(
        id,
        dto.title,
        dto.slug,
        dto.companyName,
        dto.companyLogo,
        dto.companyWebsite,
        dto.companyDescription,
        dto.description,
        dto.shortDescription,
        dto.location,
        dto.city,
        dto.state,
        dto.country,
        dto.isRemote,
        dto.employmentType,
        dto.workingDays,
        dto.minExperience,
        dto.maxExperience,
        dto.minSalary,
        dto.maxSalary,
        dto.salaryCurrency,
        dto.vacancies,
        dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
        dto.responsibilities,
        dto.skills,
        dto.eligibilityTitle,
        dto.interviewProcess,
        dto.status,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Job updated successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateJobActivationHandler.execute(
      new UpdateJobActivationCommand(id, true, user?.sub),
    );

    return {
      success: true,
      message: 'Job activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateJobActivationHandler.execute(
      new UpdateJobActivationCommand(id, false, user?.sub),
    );

    return {
      success: true,
      message: 'Job deactivated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteJobHandler.execute(
      new DeleteJobCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Job deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreJobHandler.execute(
      new RestoreJobCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Job restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.permanentDeleteJobHandler.execute(
      new PermanentDeleteJobCommand(id),
    );

    return {
      success: true,
      message: 'Job permanently deleted successfully',
      data: result,
    };
  }
}
