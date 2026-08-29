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

import { ApproveJobCommand, ApproveJobHandler } from '../../application/approve-job/approve-job.handler';
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
import { RejectJobCommand } from '../../application/reject-job/reject-job.handler';
import { RejectJobHandler } from '../../application/reject-job/reject-job.handler';
import { RestoreJobCommand } from '../../application/restore-job/restore-job.command';
import { RestoreJobHandler } from '../../application/restore-job/restore-job.handler';
import { UpdateJobActivationCommand } from '../../application/update-job-activation/update-job-activation.command';
import { UpdateJobActivationHandler } from '../../application/update-job-activation/update-job-activation.handler';
import { UpdateJobCommand } from '../../application/update-job/update-job.command';
import { UpdateJobHandler } from '../../application/update-job/update-job.handler';
import { JobSource } from '../../domain/enums/job-source.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { CreateJobDto } from '../dtos/create-job.dto';
import { ListJobsQueryDto } from '../dtos/list-jobs-query.dto';
import { RejectJobDto } from '../dtos/reject-job.dto';
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
    private readonly approveJobHandler: ApproveJobHandler,
    private readonly rejectJobHandler: RejectJobHandler,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Job created' })
  async create(
    @Body() dto: CreateJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createJobHandler.execute(
      new CreateJobCommand({
        title: dto.title,
        companyName: dto.companyName,
        employmentType: dto.employmentType,
        workingDays: dto.workingDays,
        slug: dto.slug,
        companyLogo: dto.companyLogo,
        companyWebsite: dto.companyWebsite,
        companyEmail: dto.companyEmail,
        companyPhone: dto.companyPhone,
        companyDescription: dto.companyDescription,
        description: dto.description,
        shortDescription: dto.shortDescription,
        location: dto.location,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        isRemote: dto.isRemote,
        workMode: dto.workMode,
        category: dto.category,
        department: dto.department,
        minExperience: dto.minExperience,
        maxExperience: dto.maxExperience,
        minSalary: dto.minSalary,
        maxSalary: dto.maxSalary,
        salaryCurrency: dto.salaryCurrency,
        vacancies: dto.vacancies,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
        responsibilities: dto.responsibilities,
        skills: dto.skills,
        preferredSkills: dto.preferredSkills,
        qualifications: dto.qualifications,
        benefits: dto.benefits,
        eligibilityTitle: dto.eligibilityTitle,
        interviewProcess: dto.interviewProcess,
        status: dto.status ?? JobStatus.ACTIVE,
        source: JobSource.ADMIN,
        createdBy: user?.sub,
      }),
    );

    return {
      success: true,
      message: 'Job created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListJobsQueryDto) {
    const onboardingStatuses =
      query.onboardingQueue && !query.status
        ? [JobStatus.PENDING_APPROVAL, JobStatus.REJECTED]
        : undefined;

    const result = await this.listJobsHandler.execute(
      new ListJobsQuery(
        query.status,
        query.employmentType,
        query.search,
        query.includeDeleted,
        false,
        false,
        query.isActive,
        query.onlyDeleted,
        query.skip,
        query.take,
        query.source,
        query.catalogOnly
          ? [JobStatus.PENDING_APPROVAL, JobStatus.REJECTED]
          : undefined,
        onboardingStatuses,
      ),
    );

    return {
      success: true,
      message: 'Jobs fetched successfully',
      data: result.items,
      meta: {
        total: result.total,
        skip: result.skip,
        take: result.take,
      },
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
      new UpdateJobCommand({
        id,
        title: dto.title,
        slug: dto.slug,
        companyName: dto.companyName,
        companyLogo: dto.companyLogo,
        companyWebsite: dto.companyWebsite,
        companyEmail: dto.companyEmail,
        companyPhone: dto.companyPhone,
        companyDescription: dto.companyDescription,
        description: dto.description,
        shortDescription: dto.shortDescription,
        location: dto.location,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        isRemote: dto.isRemote,
        workMode: dto.workMode,
        employmentType: dto.employmentType,
        workingDays: dto.workingDays,
        category: dto.category,
        department: dto.department,
        minExperience: dto.minExperience,
        maxExperience: dto.maxExperience,
        minSalary: dto.minSalary,
        maxSalary: dto.maxSalary,
        salaryCurrency: dto.salaryCurrency,
        vacancies: dto.vacancies,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : undefined,
        responsibilities: dto.responsibilities,
        skills: dto.skills,
        preferredSkills: dto.preferredSkills,
        qualifications: dto.qualifications,
        benefits: dto.benefits,
        eligibilityTitle: dto.eligibilityTitle,
        interviewProcess: dto.interviewProcess,
        status: dto.status,
        updatedBy: user?.sub,
      }),
    );

    return {
      success: true,
      message: 'Job updated successfully',
      data: result,
    };
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.approveJobHandler.execute(
      new ApproveJobCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Job approved successfully',
      data: result,
    };
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectJobDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.rejectJobHandler.execute(
      new RejectJobCommand(id, dto.reason, user?.sub),
    );

    return {
      success: true,
      message: 'Job submission rejected',
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
