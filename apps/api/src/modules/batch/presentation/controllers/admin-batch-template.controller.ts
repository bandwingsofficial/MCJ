import {
  Body,
  Controller,
  Delete,
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

import {
  PermanentDeleteBatchTemplateHandler,
  RestoreBatchTemplateHandler,
  SoftDeleteBatchTemplateHandler,
} from '../../application/batch-templates/archive-batch-template.handlers';
import {
  BulkArchiveBatchTemplatesHandler,
  BulkPermanentDeleteBatchTemplatesHandler,
  BulkRestoreBatchTemplatesHandler,
  BulkSetBatchTemplateActiveHandler,
} from '../../application/batch-templates/bulk-batch-template.handlers';
import { CreateBatchTemplateCommand } from '../../application/batch-templates/create-batch-template.command';
import { CreateBatchTemplateHandler } from '../../application/batch-templates/create-batch-template.handler';
import { GetBatchTemplateHandler } from '../../application/batch-templates/get-batch-template.handler';
import { ListBatchTemplatesHandler } from '../../application/batch-templates/list-batch-templates.handler';
import { SetBatchTemplateActiveHandler } from '../../application/batch-templates/set-batch-template-active.handler';
import { UpdateBatchTemplateCommand } from '../../application/batch-templates/update-batch-template.command';
import { UpdateBatchTemplateHandler } from '../../application/batch-templates/update-batch-template.handler';

import { CreateBatchTemplateDto } from '../dtos/create-batch-template.dto';
import {
  BulkBatchTemplateIdsDto,
  ListBatchTemplatesQueryDto,
} from '../dtos/list-batch-templates-query.dto';
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
    private readonly softDeleteHandler: SoftDeleteBatchTemplateHandler,
    private readonly restoreHandler: RestoreBatchTemplateHandler,
    private readonly permanentDeleteHandler: PermanentDeleteBatchTemplateHandler,
    private readonly bulkSetActiveHandler: BulkSetBatchTemplateActiveHandler,
    private readonly bulkArchiveHandler: BulkArchiveBatchTemplatesHandler,
    private readonly bulkRestoreHandler: BulkRestoreBatchTemplatesHandler,
    private readonly bulkPermanentDeleteHandler: BulkPermanentDeleteBatchTemplatesHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List batch templates' })
  async list(@Query() query: ListBatchTemplatesQueryDto) {
    const result = await this.listHandler.execute({
      search: query.search,
      mode: query.mode,
      isActive: query.isActive,
      isDeleted: query.isDeleted,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    });

    return {
      success: true,
      message: 'Batch timings retrieved successfully',
      data: result.items,
      meta: {
        total: result.total,
        catalogTotal: result.catalogTotal,
        skip: query.skip ?? 0,
        take: query.take,
      },
    };
  }

  @Post()
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
      message: 'Batch timing created successfully',
      data,
    };
  }

  @Post('bulk/activate')
  async bulkActivate(@Body() dto: BulkBatchTemplateIdsDto) {
    const data = await this.bulkSetActiveHandler.execute({
      ids: dto.ids,
      isActive: true,
    });
    return {
      success: true,
      message: `${data.succeeded} batch timing(s) activated`,
      data,
    };
  }

  @Post('bulk/deactivate')
  async bulkDeactivate(@Body() dto: BulkBatchTemplateIdsDto) {
    const data = await this.bulkSetActiveHandler.execute({
      ids: dto.ids,
      isActive: false,
    });
    return {
      success: true,
      message: `${data.succeeded} batch timing(s) deactivated`,
      data,
    };
  }

  @Post('bulk/archive')
  async bulkArchive(
    @Body() dto: BulkBatchTemplateIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.bulkArchiveHandler.execute({
      ids: dto.ids,
      deletedBy: user?.sub,
    });
    return {
      success: true,
      message: `${data.succeeded} batch timing(s) archived`,
      data,
    };
  }

  @Post('bulk/restore')
  async bulkRestore(
    @Body() dto: BulkBatchTemplateIdsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.bulkRestoreHandler.execute({
      ids: dto.ids,
      updatedBy: user?.sub,
    });
    return {
      success: true,
      message: `${data.succeeded} batch timing(s) restored`,
      data,
    };
  }

  @Post('bulk/permanent-delete')
  async bulkPermanentDelete(@Body() dto: BulkBatchTemplateIdsDto) {
    const data = await this.bulkPermanentDeleteHandler.execute(dto.ids);
    return {
      success: true,
      message: `${data.succeeded} batch timing(s) permanently deleted`,
      data,
    };
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.getHandler.execute(id);
    return {
      success: true,
      message: 'Batch timing retrieved successfully',
      data,
    };
  }

  @Patch(':id')
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
      message: 'Batch timing updated successfully',
      data,
    };
  }

  @Post(':id/enable')
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
      message: 'Batch timing activated successfully',
      data,
    };
  }

  @Post(':id/disable')
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
      message: 'Batch timing deactivated successfully',
      data,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.restoreHandler.execute({
      id,
      updatedBy: user?.sub,
    });
    return {
      success: true,
      message: 'Batch timing restored successfully',
      data,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.permanentDeleteHandler.execute(id);
    return {
      success: true,
      message: 'Batch timing permanently deleted',
    };
  }

  @Delete(':id')
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.softDeleteHandler.execute({
      id,
      deletedBy: user?.sub,
    });
    return {
      success: true,
      message: 'Batch timing archived successfully',
      data,
    };
  }
}
