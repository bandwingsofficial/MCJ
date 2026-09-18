import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { UploadFileCommand } from '@modules/uploads/application/upload-file/upload-file.command';
import { UploadFileHandler } from '@modules/uploads/application/upload-file/upload-file.handler';
import { UploadValidationService } from '@modules/uploads/domain/services/upload-validation.service';

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
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly uploadValidationService: UploadValidationService,
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
      new GetMyStudentQuery(user.sub, user.email),
    );

    return {
      success: true,
      message: result
        ? 'Student profile fetched successfully'
        : 'No student profile',
      data: result,
    };
  }

  @Post('me/uploads')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
        fileName: { type: 'string' },
        entityId: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Student profile image uploaded' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMyProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'File is required',
        400,
      );
    }

    this.uploadValidationService.validate(file);

    const result = await this.uploadFileHandler.execute(
      new UploadFileCommand(
        file,
        'students',
        file.originalname || 'profile',
        undefined,
        undefined,
        undefined,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'File uploaded successfully',
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
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.phone,
        dto.gender,
        dto.dateOfBirth === undefined
          ? undefined
          : dto.dateOfBirth
            ? new Date(dto.dateOfBirth)
            : null,
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
        dto.profileImageFileId,
      ),
    );

    return {
      success: true,
      message: 'Student profile updated successfully',
      data: result,
    };
  }
}
