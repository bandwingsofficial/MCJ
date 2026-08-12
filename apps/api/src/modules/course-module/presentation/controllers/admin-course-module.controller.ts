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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreateCourseModuleCommand } from '../../application/create-course-module/create-course-module.command';
import { CreateCourseModuleHandler } from '../../application/create-course-module/create-course-module.handler';
import { DeleteCourseModuleCommand } from '../../application/delete-course-module/delete-course-module.command';
import { DeleteCourseModuleHandler } from '../../application/delete-course-module/delete-course-module.handler';
import { GetCourseModuleHandler } from '../../application/get-course-module/get-course-module.handler';
import { GetCourseModuleQuery } from '../../application/get-course-module/get-course-module.query';
import { ListCourseModulesHandler } from '../../application/list-course-modules/list-course-modules.handler';
import { ListCourseModulesQuery } from '../../application/list-course-modules/list-course-modules.query';
import { MoveCourseModuleCommand } from '../../application/move-course-module/move-course-module.command';
import { MoveCourseModuleHandler } from '../../application/move-course-module/move-course-module.handler';
import { RestoreCourseModuleCommand } from '../../application/restore-course-module/restore-course-module.command';
import { RestoreCourseModuleHandler } from '../../application/restore-course-module/restore-course-module.handler';
import { UpdateCourseModuleCommand } from '../../application/update-course-module/update-course-module.command';
import { UpdateCourseModuleHandler } from '../../application/update-course-module/update-course-module.handler';
import { CreateCourseModuleDto } from '../dtos/create-course-module.dto';
import { ListCourseModulesQueryDto } from '../dtos/list-course-modules-query.dto';
import { MoveCourseModuleDto } from '../dtos/move-course-module.dto';
import { UpdateCourseModuleDto } from '../dtos/update-course-module.dto';

@ApiTags('Admin Course Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/course-modules')
export class AdminCourseModuleController {
  constructor(
    private readonly createCourseModuleHandler: CreateCourseModuleHandler,
    private readonly updateCourseModuleHandler: UpdateCourseModuleHandler,
    private readonly listCourseModulesHandler: ListCourseModulesHandler,
    private readonly getCourseModuleHandler: GetCourseModuleHandler,
    private readonly deleteCourseModuleHandler: DeleteCourseModuleHandler,
    private readonly restoreCourseModuleHandler: RestoreCourseModuleHandler,
    private readonly moveCourseModuleHandler: MoveCourseModuleHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCourseModuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createCourseModuleHandler.execute(
      new CreateCourseModuleCommand(
        dto.courseId,
        dto.title,
        dto.description,
        dto.keySkills,
        dto.thumbnailUrl,
        dto.duration,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course module created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListCourseModulesQueryDto) {
    const result = await this.listCourseModulesHandler.execute(
      new ListCourseModulesQuery(
        query.courseId,
        query.search,
        query.includeDeleted,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Course modules fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCourseModuleHandler.execute(
      new GetCourseModuleQuery(id, true),
    );

    return {
      success: true,
      message: 'Course module fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseModuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseModuleHandler.execute(
      new UpdateCourseModuleCommand(
        id,
        dto.title,
        dto.description,
        dto.keySkills,
        dto.thumbnailUrl,
        dto.duration,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course module updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteCourseModuleHandler.execute(
      new DeleteCourseModuleCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course module deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreCourseModuleHandler.execute(
      new RestoreCourseModuleCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course module restored successfully',
      data: result,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() dto: MoveCourseModuleDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.moveCourseModuleHandler.execute(
      new MoveCourseModuleCommand(id, dto.newPosition, user?.sub),
    );

    return {
      success: true,
      message: 'Course module moved successfully',
      data: result,
    };
  }
}
