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

import { AssignBatchesToBranchCommand } from '../../application/assign-batches-to-branch/assign-batches-to-branch.command';
import { AssignBatchesToBranchHandler } from '../../application/assign-batches-to-branch/assign-batches-to-branch.handler';
import { UnassignBatchFromBranchCommand } from '../../application/unassign-batch-from-branch/unassign-batch-from-branch.command';
import { UnassignBatchFromBranchHandler } from '../../application/unassign-batch-from-branch/unassign-batch-from-branch.handler';
import { AssignBatchesToBranchDto } from '../dtos/assign-batches-to-branch.dto';

@ApiTags('Admin Branch Batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/branches')
export class BranchBatchController {
  constructor(
    private readonly assignBatchesToBranchHandler: AssignBatchesToBranchHandler,
    private readonly unassignBatchFromBranchHandler: UnassignBatchFromBranchHandler,
  ) {}

  @Post(':branchId/batches/assign')
  @ApiResponse({
    status: 200,
    description: 'Batches assigned to branch',
  })
  async assign(
    @Param('branchId') branchId: string,
    @Body() dto: AssignBatchesToBranchDto,
  ) {
    const result = await this.assignBatchesToBranchHandler.execute(
      new AssignBatchesToBranchCommand(branchId, dto.batchIds),
    );

    return {
      success: true,
      message: 'Batches assigned successfully',
      data: result,
    };
  }

  @Delete(':branchId/batches/:batchId')
  @ApiResponse({
    status: 200,
    description: 'Batch unassigned from branch',
  })
  async unassign(
    @Param('branchId') branchId: string,
    @Param('batchId') batchId: string,
  ) {
    const result = await this.unassignBatchFromBranchHandler.execute(
      new UnassignBatchFromBranchCommand(branchId, batchId),
    );

    return {
      success: true,
      message: 'Batch unassigned successfully',
      data: result,
    };
  }
}
