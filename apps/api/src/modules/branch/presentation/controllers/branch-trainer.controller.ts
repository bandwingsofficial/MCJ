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

import { AssignTrainersToBranchCommand } from '../../application/assign-trainers-to-branch/assign-trainers-to-branch.command';
import { AssignTrainersToBranchHandler } from '../../application/assign-trainers-to-branch/assign-trainers-to-branch.handler';
import { UnassignTrainerFromBranchCommand } from '../../application/unassign-trainer-from-branch/unassign-trainer-from-branch.command';
import { UnassignTrainerFromBranchHandler } from '../../application/unassign-trainer-from-branch/unassign-trainer-from-branch.handler';
import { AssignTrainersToBranchDto } from '../dtos/assign-trainers-to-branch.dto';

@ApiTags('Admin Branch Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/branches')
export class BranchTrainerController {
  constructor(
    private readonly assignTrainersToBranchHandler: AssignTrainersToBranchHandler,
    private readonly unassignTrainerFromBranchHandler: UnassignTrainerFromBranchHandler,
  ) {}

  @Post(':branchId/trainers/assign')
  @ApiResponse({
    status: 200,
    description: 'Trainers assigned to branch',
  })
  async assign(
    @Param('branchId') branchId: string,
    @Body() dto: AssignTrainersToBranchDto,
  ) {
    const result = await this.assignTrainersToBranchHandler.execute(
      new AssignTrainersToBranchCommand(branchId, dto.trainerIds),
    );

    return {
      success: true,
      message: 'Trainers assigned successfully',
      data: result,
    };
  }

  @Delete(':branchId/trainers/:trainerId')
  @ApiResponse({
    status: 200,
    description: 'Trainer unassigned from branch',
  })
  async unassign(
    @Param('branchId') branchId: string,
    @Param('trainerId') trainerId: string,
  ) {
    const result = await this.unassignTrainerFromBranchHandler.execute(
      new UnassignTrainerFromBranchCommand(branchId, trainerId),
    );

    return {
      success: true,
      message: 'Trainer unassigned successfully',
      data: result,
    };
  }
}
