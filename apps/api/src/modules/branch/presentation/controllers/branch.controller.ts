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

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';

import { CreateBranchHandler } from '../../application/create-branch/create-branch.handler';
import { DeleteBranchHandler } from '../../application/delete-branch/delete-branch.handler';
import { PermanentDeleteBranchHandler } from '../../application/permanent-delete-branch/permanent-delete-branch.handler';
import { GetBranchHandler } from '../../application/get-branch/get-branch.handler';
import { GetBranchSummaryHandler } from '../../application/get-branch-summary/get-branch-summary.handler';
import { ListBranchesHandler } from '../../application/list-branches/list-branches.handler';
import { UpdateBranchHandler } from '../../application/update-branch/update-branch.handler';
import { UpdateBranchStatusHandler } from '../../application/update-branch-status/update-branch-status.handler';
import { SuggestBranchCodeHandler } from '../../application/suggest-branch-code/suggest-branch-code.handler';
import { CheckBranchAvailabilityHandler } from '../../application/check-branch-availability/check-branch-availability.handler';
import { ReorderBranchesHandler } from '../../application/reorder-branches/reorder-branches.handler';

import { BulkUpdateBranchStatusHandler } from '../../application/bulk-update-branch-status/bulk-update-branch-status.handler';
import { BulkUpdateBranchStatusCommand } from '../../application/bulk-update-branch-status/bulk-update-branch-status.command';

import { BulkDeleteBranchesHandler } from '../../application/bulk-delete-branches/bulk-delete-branches.handler';
import { BulkDeleteBranchesCommand } from '../../application/bulk-delete-branches/bulk-delete-branches.command';

import { BulkRestoreBranchesHandler } from '../../application/bulk-restore-branches/bulk-restore-branches.handler';
import { BulkRestoreBranchesCommand } from '../../application/bulk-restore-branches/bulk-restore-branches.command';

import { BulkPermanentDeleteBranchesHandler } from '../../application/bulk-permanent-delete-branches/bulk-permanent-delete-branches.handler';
import { BulkPermanentDeleteBranchesCommand } from '../../application/bulk-permanent-delete-branches/bulk-permanent-delete-branches.command';

import { CreateBranchCommand } from '../../application/create-branch/create-branch.command';
import { DeleteBranchCommand } from '../../application/delete-branch/delete-branch.command';
import { PermanentDeleteBranchCommand } from '../../application/permanent-delete-branch/permanent-delete-branch.command';
import { GetBranchQuery } from '../../application/get-branch/get-branch.query';
import { GetBranchSummaryQuery } from '../../application/get-branch-summary/get-branch-summary.query';
import { ListBranchesQuery } from '../../application/list-branches/list-branches.query';
import { UpdateBranchCommand } from '../../application/update-branch/update-branch.command';
import { UpdateBranchStatusCommand } from '../../application/update-branch-status/update-branch-status.command';
import { SuggestBranchCodeQuery } from '../../application/suggest-branch-code/suggest-branch-code.query';
import { CheckBranchAvailabilityQuery } from '../../application/check-branch-availability/check-branch-availability.query';
import { ReorderBranchesCommand } from '../../application/reorder-branches/reorder-branches.command';

import { BranchStatus } from '../../domain/enums/branch-status.enum';
import { BulkBranchIdsDto } from '../dtos/bulk-branch-ids.dto';
import { BulkUpdateBranchStatusDto } from '../dtos/bulk-update-branch-status.dto';

import { CreateBranchDto } from '../dtos/create-branch.dto';
import { ListBranchesQueryDto } from '../dtos/list-branches-query.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { UpdateBranchStatusDto } from '../dtos/update-branch-status.dto';
import { ReorderBranchesDto } from '../dtos/reorder-branches.dto';
import { RestoreBranchCommand } from '../../application/restore-branch/restore-branch.command';
import { RestoreBranchHandler } from '../../application/restore-branch/restore-branch.handler';

@UseGuards(JwtAuthGuard)
@Controller('admin/branches')
export class BranchController {
  constructor(
    private readonly createBranchHandler: CreateBranchHandler,

    private readonly listBranchesHandler: ListBranchesHandler,

    private readonly getBranchHandler: GetBranchHandler,

    private readonly getBranchSummaryHandler: GetBranchSummaryHandler,

    private readonly updateBranchHandler: UpdateBranchHandler,

    private readonly updateBranchStatusHandler: UpdateBranchStatusHandler,

    private readonly deleteBranchHandler: DeleteBranchHandler,

    private readonly permanentDeleteBranchHandler: PermanentDeleteBranchHandler,

    private readonly restoreBranchHandler: RestoreBranchHandler,

    private readonly suggestBranchCodeHandler: SuggestBranchCodeHandler,

    private readonly checkBranchAvailabilityHandler: CheckBranchAvailabilityHandler,

    private readonly reorderBranchesHandler: ReorderBranchesHandler,

    private readonly bulkUpdateBranchStatusHandler: BulkUpdateBranchStatusHandler,

    private readonly bulkDeleteBranchesHandler: BulkDeleteBranchesHandler,

    private readonly bulkRestoreBranchesHandler: BulkRestoreBranchesHandler,

    private readonly bulkPermanentDeleteBranchesHandler: BulkPermanentDeleteBranchesHandler,
  ) {}

  @Post()
  async create(@Body() dto: CreateBranchDto) {
    const result =
      await this.createBranchHandler.execute(
        new CreateBranchCommand(
          dto.branchName,
          dto.branchCode,
          dto.email,
          dto.phone,
          dto.addressLine1,
          dto.addressLine2,
          dto.city,
          dto.state,
          dto.country,
          dto.postalCode,
          dto.latitude,
          dto.longitude,
          dto.status,
          dto.description,
        ),
      );

    return {
      message: 'Branch created successfully',
      data: result,
    };
  }

  @Get()
  async list(
    @Query()
    query: ListBranchesQueryDto,
  ) {
    const result =
      await this.listBranchesHandler.execute(
        new ListBranchesQuery(
          query.status,
          query.search,
          query.city,
          query.state,
          query.country,
          query.includeDeleted ?? true,
          query.skip ?? 0,
          query.take ?? 50,
        ),
      );

    return {
      message: 'Branches fetched successfully',
      data: result,
    };
  }

  @Get('suggest-code')
  async suggestCode(
    @Query('branchName') branchName?: string,
  ) {
    const result =
      await this.suggestBranchCodeHandler.execute(
        new SuggestBranchCodeQuery(branchName ?? ''),
      );

    return {
      message: 'Branch code suggested successfully',
      data: result,
    };
  }

  @Get('check-availability')
  async checkAvailability(
    @Query('branchCode') branchCode?: string,
    @Query('branchName') branchName?: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const result =
      await this.checkBranchAvailabilityHandler.execute(
        new CheckBranchAvailabilityQuery(
          branchCode,
          branchName,
          excludeId,
        ),
      );

    return {
      message: 'Branch availability checked successfully',
      data: result,
    };
  }

  @Patch('reorder')
  async reorder(@Body() dto: ReorderBranchesDto) {
    const result =
      await this.reorderBranchesHandler.execute(
        new ReorderBranchesCommand(
          dto.branchId,
          dto.newDisplayOrder,
        ),
      );

    return {
      message: 'Branches reordered successfully',
      data: result,
    };
  }
  @Patch('bulk/status')
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateBranchStatusDto,
  ) {
    const result =
      await this.bulkUpdateBranchStatusHandler.execute(
        new BulkUpdateBranchStatusCommand(
          dto.branchIds,
          dto.status,
        ),
      );

    return {
      message: 'Branch statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/activate')
  async bulkActivate(@Body() dto: BulkBranchIdsDto) {
    const result =
      await this.bulkUpdateBranchStatusHandler.execute(
        new BulkUpdateBranchStatusCommand(
          dto.branchIds,
          BranchStatus.ACTIVE,
        ),
      );

    return {
      message: 'Branch statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/deactivate')
  async bulkDeactivate(@Body() dto: BulkBranchIdsDto) {
    const result =
      await this.bulkUpdateBranchStatusHandler.execute(
        new BulkUpdateBranchStatusCommand(
          dto.branchIds,
          BranchStatus.INACTIVE,
        ),
      );

    return {
      message: 'Branch statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/restore')
  async bulkRestore(@Body() dto: BulkBranchIdsDto) {
    const result =
      await this.bulkRestoreBranchesHandler.execute(
        new BulkRestoreBranchesCommand(dto.branchIds),
      );

    return {
      message: 'Branches restored successfully',
      data: result,
    };
  }

  @Delete('bulk')
  async bulkDelete(@Body() dto: BulkBranchIdsDto) {
    const result =
      await this.bulkDeleteBranchesHandler.execute(
        new BulkDeleteBranchesCommand(dto.branchIds),
      );

    return {
      message: 'Branches deleted successfully',
      data: result,
    };
  }

  @Delete('bulk/permanent')
  async bulkPermanentDelete(@Body() dto: BulkBranchIdsDto) {
    const result =
      await this.bulkPermanentDeleteBranchesHandler.execute(
        new BulkPermanentDeleteBranchesCommand(
          dto.branchIds,
        ),
      );

    return {
      message: 'Branches permanently deleted successfully',
      data: result,
    };
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string) {
    const result =
      await this.getBranchSummaryHandler.execute(
        new GetBranchSummaryQuery(id),
      );

    return {
      message: 'Branch summary fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result =
      await this.getBranchHandler.execute(
        new GetBranchQuery(id),
      );

    return {
      message: 'Branch fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,

    @Body()
    dto: UpdateBranchDto,
  ) {
    const result =
      await this.updateBranchHandler.execute(
        new UpdateBranchCommand(
          id,
          dto.branchName,
          dto.branchCode,
          dto.email,
          dto.phone,
          dto.addressLine1,
          dto.addressLine2,
          dto.city,
          dto.state,
          dto.country,
          dto.postalCode,
          dto.latitude,
          dto.longitude,
          dto.status,
          dto.description,
        ),
      );

    return {
      message: 'Branch updated successfully',
      data: result,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,

    @Body()
    dto: UpdateBranchStatusDto,
  ) {
    const result =
      await this.updateBranchStatusHandler.execute(
        new UpdateBranchStatusCommand(
          id,
          dto.status,
        ),
      );

    return {
      message: 'Branch status updated successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const result =
      await this.updateBranchStatusHandler.execute(
        new UpdateBranchStatusCommand(
          id,
          BranchStatus.ACTIVE,
        ),
      );

    return {
      message: 'Branch activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const result =
      await this.updateBranchStatusHandler.execute(
        new UpdateBranchStatusCommand(
          id,
          BranchStatus.INACTIVE,
        ),
      );

    return {
      message: 'Branch deactivated successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
async restore(
  @Param('id') id: string,
) {
  const result =
    await this.restoreBranchHandler.execute(
      new RestoreBranchCommand(id),
    );

  return {
    message: 'Branch restored successfully',
    data: result,
  };
}

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result =
      await this.permanentDeleteBranchHandler.execute(
        new PermanentDeleteBranchCommand(id),
      );

    return {
      message: 'Branch permanently deleted successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result =
      await this.deleteBranchHandler.execute(
        new DeleteBranchCommand(id),
      );

    return {
      message: result.message,
    };
  }
}
