import {
  Body,
  Controller,
  Get,
  Patch,
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

import { CreateStudentByPublicCommand } from '../../application/create-student-by-public/create-student-by-public.command';
import { CreateStudentByPublicHandler } from '../../application/create-student-by-public/create-student-by-public.handler';
import { GetMyStudentHandler } from '../../application/get-my-student/get-my-student.handler';
import { GetMyStudentQuery } from '../../application/get-my-student/get-my-student.query';
import { UpdateMyStudentCommand } from '../../application/update-my-student/update-my-student.command';
import { UpdateMyStudentHandler } from '../../application/update-my-student/update-my-student.handler';
import { CreatePublicStudentDto } from '../dtos/create-public-student.dto';
import { UpdatePublicStudentDto } from '../dtos/update-public-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard)
export class PublicStudentController {
  constructor(
    private readonly createStudentByPublicHandler: CreateStudentByPublicHandler,
    private readonly getMyStudentHandler: GetMyStudentHandler,
    private readonly updateMyStudentHandler: UpdateMyStudentHandler,
  ) {}

  @Post('profile')
  @ApiBody({ type: CreatePublicStudentDto })
  @ApiResponse({
    status: 201,
    description: 'Student profile created',
  })
  async createProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePublicStudentDto,
  ) {
    const { result, alreadyExists } =
      await this.createStudentByPublicHandler.execute(
        new CreateStudentByPublicCommand(
          user.sub,
          dto.firstName,
          dto.lastName,
          dto.email,
          dto.phone,
          dto.gender,
          dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          dto.addressLine1,
          dto.addressLine2,
          dto.city,
          dto.state,
          dto.country,
          dto.postalCode,
          dto.qualification,
          dto.collegeName,
          dto.specialization,
          dto.passingYear,
          dto.parentName,
          dto.parentPhone,
          dto.emergencyContactName,
          dto.emergencyContactPhone,
          dto.notes,
        ),
      );

    return {
      success: true,
      message: alreadyExists
        ? 'Student profile already exists'
        : 'Student profile created successfully',
      data: result,
    };
  }

  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Current student profile fetched',
  })
  async getMyProfile(@CurrentUser() user: AuthUser) {
    const result = await this.getMyStudentHandler.execute(
      new GetMyStudentQuery(user.sub),
    );

    return {
      success: true,
      message: 'Student profile fetched successfully',
      data: result,
    };
  }

  @Patch('me')
  @ApiBody({ type: UpdatePublicStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Current student profile updated',
  })
  async updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePublicStudentDto,
  ) {
    const result = await this.updateMyStudentHandler.execute(
      new UpdateMyStudentCommand(
        user.sub,
        dto.qualification,
        dto.collegeName,
        dto.specialization,
        dto.passingYear,
        dto.parentName,
        dto.parentPhone,
        dto.emergencyContactName,
        dto.emergencyContactPhone,
        dto.notes,
      ),
    );

    return {
      success: true,
      message: 'Student profile updated successfully',
      data: result,
    };
  }
}
