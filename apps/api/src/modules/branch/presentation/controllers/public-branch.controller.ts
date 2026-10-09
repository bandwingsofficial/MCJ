import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  BadRequestException,
  ServiceUnavailableException,
  Query,
} from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetBranchHandler } from '../../application/get-branch/get-branch.handler';
import { GetBranchQuery } from '../../application/get-branch/get-branch.query';
import { ListBranchesHandler } from '../../application/list-branches/list-branches.handler';
import { ListBranchesQuery } from '../../application/list-branches/list-branches.query';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BrevoEmailService } from '../../../../infrastructure/email/brevo-email.service';

function mapPublicBranch(branch: {
  id: string;
  branchName: string;
  branchCode: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  status: BranchStatus;
  thumbnailUrl?: string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    id: branch.id,
    branchName: branch.branchName,
    branchCode: branch.branchCode,
    slug: branch.slug,
    email: branch.email ?? null,
    phone: branch.phone ?? null,
    addressLine1: branch.addressLine1 ?? null,
    addressLine2: branch.addressLine2 ?? null,
    city: branch.city,
    state: branch.state,
    country: branch.country,
    postalCode: branch.postalCode ?? null,
    latitude: branch.latitude ?? null,
    longitude: branch.longitude ?? null,
    description: branch.description ?? null,
    status: branch.status,
    thumbnailUrl: branch.thumbnailUrl ?? null,
    updatedAt: branch.updatedAt
      ? branch.updatedAt instanceof Date
        ? branch.updatedAt.toISOString()
        : branch.updatedAt
      : null,
  };
}
class BranchEnquiryDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  studentName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  courseName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  batchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

class ContactEnquiryDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  message!: string;
}


@ApiTags('Branches')
@Controller('branches')
export class PublicBranchController {
  constructor(
    private readonly listBranchesHandler: ListBranchesHandler,
    private readonly getBranchHandler: GetBranchHandler,
    private readonly brevoEmailService: BrevoEmailService,
  ) {}
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Active branches listed',
  })
  async list(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const result = await this.listBranchesHandler.execute(
      new ListBranchesQuery(
        BranchStatus.ACTIVE,
        search,
        undefined,
        undefined,
        undefined,
        false,
        skip ?? 0,
        take ?? 100,
      ),
    );

    return {
      success: true,
      message: 'Branches fetched successfully',
      data: result.items.map((branch) => mapPublicBranch(branch)),
      meta: {
        total: result.count,
        skip: result.meta.skip,
        take: result.meta.take,
      },
    };
  }


  @Post('contact/enquiries')
  async submitContactEnquiry(@Body() body: ContactEnquiryDto) {
    if (
      !body.fullName?.trim() ||
      !body.email?.trim() ||
      !body.phone?.trim() ||
      !body.message?.trim()
    ) {
      throw new BadRequestException(
        'Name, email, phone, and message are required',
      );
    }

    try {
      await this.brevoEmailService.sendContactEnquiryEmail({
        fullName: body.fullName.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
        message: body.message.trim(),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Unable to send your message right now. Please try again later.',
      );
    }

    return {
      success: true,
      message: 'Your message has been sent successfully',
    };
  }

  @Post(':id/enquiries')
  async submitEnquiry(
    @Param('id') id: string,
    @Body() body: BranchEnquiryDto,
  ) {
    const result = await this.getBranchHandler.execute(
      new GetBranchQuery(id),
    );

    if (
      result.status !== BranchStatus.ACTIVE ||
      result.deletedAt !== null
    ) {
      throw new NotFoundException('Branch not found');
    }

    if (!body.studentName?.trim() || !body.phone?.trim()) {
      throw new BadRequestException(
        'Student name and phone number are required',
      );
    }

    if (!result.email?.trim()) {
      throw new BadRequestException(
        'This branch does not have an enquiry email configured',
      );
    }

    try {
      await this.brevoEmailService.sendBranchEnquiryEmail({
        branchName: result.branchName,
        branchEmail: result.email,
        studentName: body.studentName.trim(),
        phone: body.phone.trim(),
        courseName: body.courseName?.trim(),
        batchName: body.batchName?.trim(),
        notes: body.notes?.trim(),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Unable to send enquiry right now. Please try again later.',
      );
    }

    return {
      success: true,
      message: 'Your enquiry has been sent successfully',
    };
  }


  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getBranchHandler.execute(new GetBranchQuery(id));

    if (result.status !== BranchStatus.ACTIVE || result.deletedAt !== null) {
      throw new NotFoundException('Branch not found');
    }

    return {
      success: true,
      message: 'Branch fetched successfully',
      data: mapPublicBranch(result),
    };
  }
}
