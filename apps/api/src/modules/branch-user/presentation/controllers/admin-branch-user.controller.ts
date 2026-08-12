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
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';

import { CreateBranchUserDto } from '../dtos/create-branch-user.dto';
import { UpdateBranchUserDto } from '../dtos/update-branch-user.dto';
import { ListBranchUsersQueryDto } from '../dtos/list-branch-users-query.dto';
import { ResetBranchUserPasswordDto } from '../dtos/reset-branch-user-password.dto';

import { CreateBranchUserHandler } from '../../application/create-branch-user/create-branch-user.handler';
import { ListBranchUsersHandler } from '../../application/list-branch-users/list-branch-users.handler';
import { GetBranchUserHandler } from '../../application/get-branch-user/get-branch-user.handler';
import { UpdateBranchUserHandler } from '../../application/update-branch-user/update-branch-user.handler';
import { UpdateBranchUserStatusHandler } from '../../application/update-branch-user-status/update-branch-user-status.handler';
import { DeleteBranchUserHandler } from '../../application/delete-branch-user/delete-branch-user.handler';
import { ResetBranchUserPasswordHandler } from '../../application/reset-branch-user-password/reset-branch-user-password.handler';
import { RestoreBranchUserHandler } from '../../application/restore-branch-user/restore-branch-user.handler';

import { CreateBranchUserCommand } from '../../application/create-branch-user/create-branch-user.command';
import { ListBranchUsersQuery } from '../../application/list-branch-users/list-branch-users.query';
import { GetBranchUserQuery } from '../../application/get-branch-user/get-branch-user.query';
import { UpdateBranchUserCommand } from '../../application/update-branch-user/update-branch-user.command';
import { UpdateBranchUserStatusCommand } from '../../application/update-branch-user-status/update-branch-user-status.command';
import { DeleteBranchUserCommand } from '../../application/delete-branch-user/delete-branch-user.command';
import { ResetBranchUserPasswordCommand } from '../../application/reset-branch-user-password/reset-branch-user-password.command';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { RestoreBranchUserCommand } from '../../application/restore-branch-user/restore-branch-user.command';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/branch-users')
export class AdminBranchUserController {
  constructor(
    private readonly createBranchUserHandler: CreateBranchUserHandler,
    private readonly listBranchUsersHandler: ListBranchUsersHandler,
    private readonly getBranchUserHandler: GetBranchUserHandler,
    private readonly updateBranchUserHandler: UpdateBranchUserHandler,
    private readonly updateBranchUserStatusHandler: UpdateBranchUserStatusHandler,
    private readonly deleteBranchUserHandler: DeleteBranchUserHandler,
    private readonly resetBranchUserPasswordHandler: ResetBranchUserPasswordHandler,
    private readonly restoreBranchUserHandler: RestoreBranchUserHandler,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBranchUserDto,
  ) {
    const result =
      await this.createBranchUserHandler.execute(
        new CreateBranchUserCommand(
          dto.firstName,
          dto.lastName,
          dto.email,
          dto.phone,
          dto.password,
          dto.role,
          dto.permissions,
          dto.branchId,
          user.sub,
        ),
      );

    return {
      message: 'Branch user created successfully',
      data: result,
    };
  }

  @Get()
  async list(
    @Query() query: ListBranchUsersQueryDto,
  ) {
    const result =
      await this.listBranchUsersHandler.execute(
        new ListBranchUsersQuery(
          query.branchId,
          query.role,
          query.isActive,
          query.search,
          query.includeDeleted ?? false,
          query.skip ?? 0,
          query.take ?? 50,
        ),
      );

    return {
      message:
        'Branch users fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result =
      await this.getBranchUserHandler.execute(
        new GetBranchUserQuery(id),
      );

    return {
      message: 'Branch user fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateBranchUserDto,
  ) {
    const result =
      await this.updateBranchUserHandler.execute(
        new UpdateBranchUserCommand(
          id,
          dto.firstName,
          dto.lastName,
          dto.email,
          dto.phone,
          dto.role,
          dto.permissions,
          dto.branchId,
          user.sub,
        ),
      );

    return {
      message: 'Branch user updated successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const result =
      await this.updateBranchUserStatusHandler.execute(
        new UpdateBranchUserStatusCommand(
          id,
          true,
          user.sub,
        ),
      );

    return {
      message:
        'Branch user activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const result =
      await this.updateBranchUserStatusHandler.execute(
        new UpdateBranchUserStatusCommand(
          id,
          false,
          user.sub,
        ),
      );

    return {
      message:
        'Branch user deactivated successfully',
      data: result,
    };
  }

  @Patch(':id/reset-password')
  async resetPassword(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body()
    dto: ResetBranchUserPasswordDto,
  ) {
    const result =
      await this.resetBranchUserPasswordHandler.execute(
        new ResetBranchUserPasswordCommand(
          id,
          dto.newPassword,
          user.sub,
        ),
      );

    return {
      message: result.message,
    };
  }

  @Patch(':id/restore')
async restore(
  @Param('id') id: string,
) {
  const result =
    await this.restoreBranchUserHandler.execute(
      new RestoreBranchUserCommand(id),
    );

  return {
    success: true,
    message:
      'Branch user restored successfully',
    data: result,
  };
}

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const result =
      await this.deleteBranchUserHandler.execute(
        new DeleteBranchUserCommand(
          id,
          user.sub,
        ),
      );

    return {
      message: result.message,
    };
  }
}
