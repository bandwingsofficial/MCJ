import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreatePublicJobApplicationCommand } from '../../application/create-public-job-application/create-public-job-application.command';
import { CreatePublicJobApplicationHandler } from '../../application/create-public-job-application/create-public-job-application.handler';
import { CreatePublicJobApplicationDto } from '../dtos/create-public-job-application.dto';

@ApiTags('Public Job Applications')
@Controller('jobs')
export class PublicGuestJobApplicationController {
  constructor(
    private readonly createPublicJobApplicationHandler: CreatePublicJobApplicationHandler,
  ) {}

  @Post(':slug/public-apply')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        applicantName: { type: 'string' },
        applicantEmail: { type: 'string' },
        applicantPhone: { type: 'string' },
        currentLocation: { type: 'string' },
        highestQualification: { type: 'string' },
        yearsOfExperience: { type: 'number' },
        coverLetter: { type: 'string' },
        remarks: { type: 'string' },
        resume: { type: 'string', format: 'binary' },
      },
      required: [
        'applicantName',
        'applicantEmail',
        'applicantPhone',
        'resume',
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Public application submitted' })
  @UseInterceptors(
    FileInterceptor('resume', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async apply(
    @Param('slug') slug: string,
    @Body() dto: CreatePublicJobApplicationDto,
    @UploadedFile() resume?: Express.Multer.File,
  ) {
    const result = await this.createPublicJobApplicationHandler.execute(
      new CreatePublicJobApplicationCommand(
        slug,
        dto.applicantName,
        dto.applicantEmail,
        dto.applicantPhone,
        dto.currentLocation,
        dto.highestQualification,
        dto.yearsOfExperience,
        dto.coverLetter,
        dto.remarks,
        resume ?? null,
      ),
    );

    return {
      success: true,
      message: 'Application submitted successfully',
      data: result,
    };
  }
}
