import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { GetMyJobApplicationHandler } from '../../application/get-my-job-application/get-my-job-application.handler';
import { GetMyJobApplicationQuery } from '../../application/get-my-job-application/get-my-job-application.query';
import { ListMyJobApplicationsHandler } from '../../application/list-my-job-applications/list-my-job-applications.handler';
import { ListMyJobApplicationsQuery } from '../../application/list-my-job-applications/list-my-job-applications.query';

@ApiTags('My Job Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('my-job-applications')
export class StudentJobApplicationController {
  constructor(
    private readonly listMyJobApplicationsHandler: ListMyJobApplicationsHandler,
    private readonly getMyJobApplicationHandler: GetMyJobApplicationHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'My applications listed' })
  async list(@CurrentUser() user: AuthUser) {
    const result = await this.listMyJobApplicationsHandler.execute(
      new ListMyJobApplicationsQuery(user.sub),
    );

    return {
      success: true,
      message: 'Job applications fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.getMyJobApplicationHandler.execute(
      new GetMyJobApplicationQuery(user.sub, id),
    );

    return {
      success: true,
      message: 'Job application fetched successfully',
      data: result,
    };
  }
}
