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

import { AssignCoursesToBranchCommand } from '../../application/assign-courses-to-branch/assign-courses-to-branch.command';
import { AssignCoursesToBranchHandler } from '../../application/assign-courses-to-branch/assign-courses-to-branch.handler';
import { UnassignCourseFromBranchCommand } from '../../application/unassign-course-from-branch/unassign-course-from-branch.command';
import { UnassignCourseFromBranchHandler } from '../../application/unassign-course-from-branch/unassign-course-from-branch.handler';
import { AssignCoursesToBranchDto } from '../dtos/assign-courses-to-branch.dto';

@ApiTags('Admin Branch Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/branches')
export class BranchCourseController {
  constructor(
    private readonly assignCoursesToBranchHandler: AssignCoursesToBranchHandler,
    private readonly unassignCourseFromBranchHandler: UnassignCourseFromBranchHandler,
  ) {}

  @Post(':branchId/courses/assign')
  @ApiResponse({
    status: 200,
    description: 'Courses assigned to branch',
  })
  async assign(
    @Param('branchId') branchId: string,
    @Body() dto: AssignCoursesToBranchDto,
  ) {
    const result = await this.assignCoursesToBranchHandler.execute(
      new AssignCoursesToBranchCommand(branchId, dto.courseIds),
    );

    return {
      success: true,
      message: 'Courses assigned successfully',
      data: result,
    };
  }

  @Delete(':branchId/courses/:courseId')
  @ApiResponse({
    status: 200,
    description: 'Course unassigned from branch',
  })
  async unassign(
    @Param('branchId') branchId: string,
    @Param('courseId') courseId: string,
  ) {
    const result = await this.unassignCourseFromBranchHandler.execute(
      new UnassignCourseFromBranchCommand(branchId, courseId),
    );

    return {
      success: true,
      message: 'Course unassigned successfully',
      data: result,
    };
  }
}
