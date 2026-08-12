import {
  Body,
  Controller,
  Get,
  Post,
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
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreatePublicEnrollmentCommand } from '../../application/create-public-enrollment/create-public-enrollment.command';
import { CreatePublicEnrollmentHandler } from '../../application/create-public-enrollment/create-public-enrollment.handler';
import { GetMyEnrollmentHandler } from '../../application/get-my-enrollment/get-my-enrollment.handler';
import { GetMyEnrollmentQuery } from '../../application/get-my-enrollment/get-my-enrollment.query';
import { CreatePublicEnrollmentDto } from '../dtos/create-public-enrollment.dto';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class PublicEnrollmentController {
  constructor(
    private readonly createPublicEnrollmentHandler: CreatePublicEnrollmentHandler,
    private readonly getMyEnrollmentHandler: GetMyEnrollmentHandler,
  ) {}

  @Post()
  @ApiBody({ type: CreatePublicEnrollmentDto })
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePublicEnrollmentDto,
  ) {
    const result =
      await this.createPublicEnrollmentHandler.execute(
        new CreatePublicEnrollmentCommand(
          user.sub,
          dto.batchId,
          dto.remarks,
        ),
      );

    return {
      success: true,
      message: 'Enrollment created successfully',
      data: result,
    };
  }

  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Current user enrollments fetched',
  })
  async getMyEnrollments(@CurrentUser() user: AuthUser) {
    const result = await this.getMyEnrollmentHandler.execute(
      new GetMyEnrollmentQuery(user.sub),
    );

    return {
      success: true,
      message: 'Enrollments fetched successfully',
      data: result,
    };
  }
}
