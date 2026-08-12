import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { GetStudentPortalAccessHandler } from '../../application/get-student-portal-access/get-student-portal-access.handler';
import { GetStudentPortalAccessQuery } from '../../application/get-student-portal-access/get-student-portal-access.query';

@ApiTags('Student Portal')
@ApiBearerAuth()
@Controller('student-portal')
@UseGuards(JwtAuthGuard)
export class StudentPortalController {
  constructor(
    private readonly getStudentPortalAccessHandler: GetStudentPortalAccessHandler,
  ) {}

  @Get('access')
  @ApiResponse({
    status: 200,
    description: 'Student portal access resolved',
  })
  async getAccess(@CurrentUser() user: AuthUser) {
    const result =
      await this.getStudentPortalAccessHandler.execute(
        new GetStudentPortalAccessQuery(user.sub),
      );

    return {
      success: true,
      message: 'Student portal access granted',
      data: result,
    };
  }
}
