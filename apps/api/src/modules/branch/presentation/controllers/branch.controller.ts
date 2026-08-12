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
import { GetBranchHandler } from '../../application/get-branch/get-branch.handler';
import { ListBranchesHandler } from '../../application/list-branches/list-branches.handler';
import { UpdateBranchHandler } from '../../application/update-branch/update-branch.handler';
import { UpdateBranchStatusHandler } from '../../application/update-branch-status/update-branch-status.handler';

import { CreateBranchCommand } from '../../application/create-branch/create-branch.command';
import { DeleteBranchCommand } from '../../application/delete-branch/delete-branch.command';
import { GetBranchQuery } from '../../application/get-branch/get-branch.query';
import { ListBranchesQuery } from '../../application/list-branches/list-branches.query';
import { UpdateBranchCommand } from '../../application/update-branch/update-branch.command';
import { UpdateBranchStatusCommand } from '../../application/update-branch-status/update-branch-status.command';

import { BranchStatus } from '../../domain/enums/branch-status.enum';

import { CreateBranchDto } from '../dtos/create-branch.dto';
import { ListBranchesQueryDto } from '../dtos/list-branches-query.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { UpdateBranchStatusDto } from '../dtos/update-branch-status.dto';
import { RestoreBranchCommand } from '../../application/restore-branch/restore-branch.command';
import { RestoreBranchHandler } from '../../application/restore-branch/restore-branch.handler';

@UseGuards(JwtAuthGuard)
@Controller('admin/branches')
export class BranchController {
  constructor(
    private readonly createBranchHandler: CreateBranchHandler,

    private readonly listBranchesHandler: ListBranchesHandler,

    private readonly getBranchHandler: GetBranchHandler,

    private readonly updateBranchHandler: UpdateBranchHandler,

    private readonly updateBranchStatusHandler: UpdateBranchStatusHandler,

    private readonly deleteBranchHandler: DeleteBranchHandler,

    private readonly restoreBranchHandler: RestoreBranchHandler,
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
          query.includeDeleted ?? false,
          query.skip ?? 0,
          query.take ?? 50,
        ),
      );

    return {
      message: 'Branches fetched successfully',
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
