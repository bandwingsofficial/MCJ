import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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

import { CreateBatchTemplateCommand } from '../../application/batch-templates/create-batch-template.command';
import { CreateBatchTemplateHandler } from '../../application/batch-templates/create-batch-template.handler';
import { CreateBatchesFromTemplatesCommand } from '../../application/batch-templates/create-batches-from-templates.command';
import { CreateBatchesFromTemplatesHandler } from '../../application/batch-templates/create-batches-from-templates.handler';
import { GetBatchTemplateHandler } from '../../application/batch-templates/get-batch-template.handler';
import { ListBatchTemplatesHandler } from '../../application/batch-templates/list-batch-templates.handler';
import { SetBatchTemplateActiveHandler } from '../../application/batch-templates/set-batch-template-active.handler';
import { UpdateBatchTemplateCommand } from '../../application/batch-templates/update-batch-template.command';
import { UpdateBatchTemplateHandler } from '../../application/batch-templates/update-batch-template.handler';

import { CreateBatchTemplateDto } from '../dtos/create-batch-template.dto';
import { CreateBatchesFromTemplatesDto } from '../dtos/create-batches-from-templates.dto';
import { UpdateBatchTemplateDto } from '../dtos/update-batch-template.dto';

@ApiTags('Admin Batch Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/batch-templates')
export class AdminBatchTemplateController {
  constructor(
    private readonly createHandler: CreateBatchTemplateHandler,
    private readonly updateHandler: UpdateBatchTemplateHandler,
    private readonly listHandler: ListBatchTemplatesHandler,
    private readonly getHandler: GetBatchTemplateHandler,
    private readonly setActiveHandler: SetBatchTemplateActiveHandler,
    private readonly createFromTemplatesHandler: CreateBatchesFromTemplatesHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List batch templates' })
  async list(@Query('isActive') isActive?: string) {
    const parsed =
      isActive === undefined
        ? undefined
        : isActive === 'true'
          ? true
          : isActive === 'false'
            ? false
            : undefined;

    const data = await this.listHandler.execute(
      parsed === undefined ? undefined : { isActive: parsed },
    );

    return {
      success: true,
      message: 'Batch templates retrieved successfully',
      data,
    };
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create batch template' })
  async create(
    @Body() dto: CreateBatchTemplateDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.createHandler.execute(
      new CreateBatchTemplateCommand(
        dto.name,
        dto.mode,
        dto.daysOfWeek ?? [],
        dto.hasFixedTime ?? true,
        dto.startTime,
        dto.endTime,
        dto.isActive,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch template created successfully',
      data,
    };
  }

  @Post('create-batches')
  @ApiResponse({
    status: 201,
    description: 'Create batches from selected templates',
  })
  async createBatches(
    @Body() dto: CreateBatchesFromTemplatesDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.createFromTemplatesHandler.execute(
      new CreateBatchesFromTemplatesCommand(
        dto.courseId,
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.templateIds,
        dto.capacity,
        dto.durationValue,
        dto.durationType,
        user?.sub,
        dto.originalPrice,
        dto.discountAmount,
        dto.discountedPrice,
        dto.currency,
        dto.isFree,
      ),
    );

    const message =
      data.failedCount === 0
        ? `${data.createdCount} batch(es) created successfully`
        : data.createdCount === 0
          ? `Failed to create batches from templates`
          : `${data.createdCount} created, ${data.failedCount} failed`;

    return {
      success: data.failedCount === 0,
      message,
      data,
    };
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get batch template' })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.getHandler.execute(id);
    return {
      success: true,
      message: 'Batch template retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update batch template' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchTemplateDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.updateHandler.execute(
      new UpdateBatchTemplateCommand(
        id,
        dto.name,
        dto.mode,
        dto.daysOfWeek,
        dto.hasFixedTime,
        dto.startTime,
        dto.endTime,
        dto.isActive,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Batch template updated successfully',
      data,
    };
  }

  @Post(':id/enable')
  @ApiResponse({ status: 200, description: 'Enable batch template' })
  async enable(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.setActiveHandler.execute({
      id,
      isActive: true,
      updatedBy: user?.sub,
    });

    return {
      success: true,
      message: 'Batch template enabled successfully',
      data,
    };
  }

  @Post(':id/disable')
  @ApiResponse({ status: 200, description: 'Disable batch template' })
  async disable(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.setActiveHandler.execute({
      id,
      isActive: false,
      updatedBy: user?.sub,
    });

    return {
      success: true,
      message: 'Batch template disabled successfully',
      data,
    };
  }
}
