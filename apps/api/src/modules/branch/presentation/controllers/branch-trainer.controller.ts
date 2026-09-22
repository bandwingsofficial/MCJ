import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
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
import { ListBranchTrainerAssignmentsHandler } from '../../application/list-branch-trainer-assignments/list-branch-trainer-assignments.handler';
import { ListBranchTrainerAssignmentsQuery } from '../../application/list-branch-trainer-assignments/list-branch-trainer-assignments.query';
import { UnassignBranchTrainerAssignmentCommand } from '../../application/unassign-branch-trainer-assignment/unassign-branch-trainer-assignment.command';
import { UnassignBranchTrainerAssignmentHandler } from '../../application/unassign-branch-trainer-assignment/unassign-branch-trainer-assignment.handler';
import { UnassignTrainerFromBranchCommand } from '../../application/unassign-trainer-from-branch/unassign-trainer-from-branch.command';
import { UnassignTrainerFromBranchHandler } from '../../application/unassign-trainer-from-branch/unassign-trainer-from-branch.handler';
import {
  AssignBranchTrainerTypeDto,
  AssignTrainersToBranchDto,
} from '../dtos/assign-trainers-to-branch.dto';
import { BRANCH_TOKENS } from '../../branch.tokens';
import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { Inject } from '@nestjs/common';

@ApiTags('Admin Branch Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/branches')
export class BranchTrainerController {
  constructor(
    private readonly assignTrainersToBranchHandler: AssignTrainersToBranchHandler,
    private readonly unassignTrainerFromBranchHandler: UnassignTrainerFromBranchHandler,
    private readonly listBranchTrainerAssignmentsHandler: ListBranchTrainerAssignmentsHandler,
    private readonly unassignBranchTrainerAssignmentHandler: UnassignBranchTrainerAssignmentHandler,
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  @Get(':branchId/trainer-assignments')
  @ApiResponse({
    status: 200,
    description: 'Branch trainer assignments',
  })
  async listAssignments(@Param('branchId') branchId: string) {
    const result = await this.listBranchTrainerAssignmentsHandler.execute(
      new ListBranchTrainerAssignmentsQuery(branchId),
    );

    return {
      success: true,
      message: 'Branch trainer assignments loaded',
      data: result,
    };
  }

  @Get(':branchId/trainer-assignments/context')
  @ApiResponse({
    status: 200,
    description: 'Trainer IDs already assigned for course/batch context',
  })
  async listContextAssignments(
    @Param('branchId') branchId: string,
    @Query('courseId') courseId: string,
    @Query('batchId') batchId: string,
    @Query('mode') mode: string,
    @Query('batchTimingId') batchTimingId: string,
  ) {
    const trainerIds =
      await this.branchRepo.findAssignedTrainerIdsForCourseBatchContext(
        branchId,
        { courseId, batchId, mode, batchTimingId },
      );

    return {
      success: true,
      message: 'Context trainer assignments loaded',
      data: { branchId, trainerIds },
    };
  }

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
      new AssignTrainersToBranchCommand(
        branchId,
        dto.trainerIds,
        dto.assignmentType ?? AssignBranchTrainerTypeDto.BRANCH_ONLY,
        dto.courseId,
        dto.batchId,
        dto.mode,
        dto.batchTimingId,
      ),
    );

    return {
      success: true,
      message: 'Trainers assigned successfully',
      data: result,
    };
  }

  @Delete(':branchId/trainer-assignments/:assignmentId')
  @ApiResponse({
    status: 200,
    description: 'Trainer assignment removed',
  })
  async unassignAssignment(
    @Param('branchId') branchId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    const result = await this.unassignBranchTrainerAssignmentHandler.execute(
      new UnassignBranchTrainerAssignmentCommand(branchId, assignmentId),
    );

    return {
      success: true,
      message: 'Trainer unassigned successfully',
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
