import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { AssignCategoriesToBranchCommand } from '../../application/assign-categories-to-branch/assign-categories-to-branch.command';
import { AssignCategoriesToBranchHandler } from '../../application/assign-categories-to-branch/assign-categories-to-branch.handler';
import { UnassignCategoryFromBranchCommand } from '../../application/unassign-category-from-branch/unassign-category-from-branch.command';
import { UnassignCategoryFromBranchHandler } from '../../application/unassign-category-from-branch/unassign-category-from-branch.handler';
import { AssignCategoriesToBranchDto } from '../dtos/assign-categories-to-branch.dto';

@ApiTags('Admin Branch Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/branches')
export class BranchCategoryController {
  constructor(
    private readonly assignCategoriesToBranchHandler: AssignCategoriesToBranchHandler,
    private readonly unassignCategoryFromBranchHandler: UnassignCategoryFromBranchHandler,
  ) {}

  @Post(':branchId/categories/assign')
  @ApiResponse({
    status: 200,
    description: 'Categories assigned to branch',
  })
  async assign(
    @Param('branchId') branchId: string,
    @Body() dto: AssignCategoriesToBranchDto,
  ) {
    const result =
      await this.assignCategoriesToBranchHandler.execute(
        new AssignCategoriesToBranchCommand(
          branchId,
          dto.categoryIds,
        ),
      );

    return {
      success: true,
      message: 'Categories assigned successfully',
      data: result,
    };
  }

  @Delete(':branchId/categories/:categoryId')
  @ApiResponse({
    status: 200,
    description: 'Category unassigned from branch',
  })
  async unassign(
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
  ) {
    const result =
      await this.unassignCategoryFromBranchHandler.execute(
        new UnassignCategoryFromBranchCommand(
          branchId,
          categoryId,
        ),
      );

    return {
      success: true,
      message: 'Category unassigned successfully',
      data: result,
    };
  }
}
