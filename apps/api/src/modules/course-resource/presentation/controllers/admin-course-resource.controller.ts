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

import { CreateCourseResourceCommand } from '../../application/create-course-resource/create-course-resource.command';
import { CreateCourseResourceHandler } from '../../application/create-course-resource/create-course-resource.handler';
import { DeleteCourseResourceCommand } from '../../application/delete-course-resource/delete-course-resource.command';
import { DeleteCourseResourceHandler } from '../../application/delete-course-resource/delete-course-resource.handler';
import { GetCourseResourceHandler } from '../../application/get-course-resource/get-course-resource.handler';
import { GetCourseResourceQuery } from '../../application/get-course-resource/get-course-resource.query';
import { ListCourseResourcesHandler } from '../../application/list-course-resources/list-course-resources.handler';
import { ListCourseResourcesQuery } from '../../application/list-course-resources/list-course-resources.query';
import { MoveCourseResourceCommand } from '../../application/move-course-resource/move-course-resource.command';
import { MoveCourseResourceHandler } from '../../application/move-course-resource/move-course-resource.handler';
import { PermanentDeleteCourseResourceCommand } from '../../application/permanent-delete-course-resource/permanent-delete-course-resource.command';
import { PermanentDeleteCourseResourceHandler } from '../../application/permanent-delete-course-resource/permanent-delete-course-resource.handler';
import { RestoreCourseResourceCommand } from '../../application/restore-course-resource/restore-course-resource.command';
import { RestoreCourseResourceHandler } from '../../application/restore-course-resource/restore-course-resource.handler';
import { UpdateCourseResourceCommand } from '../../application/update-course-resource/update-course-resource.command';
import { UpdateCourseResourceHandler } from '../../application/update-course-resource/update-course-resource.handler';
import { CreateCourseResourceDto } from '../dtos/create-course-resource.dto';
import { ListCourseResourcesQueryDto } from '../dtos/list-course-resources-query.dto';
import { MoveCourseResourceDto } from '../dtos/move-course-resource.dto';
import { UpdateCourseResourceDto } from '../dtos/update-course-resource.dto';

@ApiTags('Admin Course Resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/course-resources')
export class AdminCourseResourceController {
  constructor(
    private readonly createCourseResourceHandler: CreateCourseResourceHandler,
    private readonly updateCourseResourceHandler: UpdateCourseResourceHandler,
    private readonly listCourseResourcesHandler: ListCourseResourcesHandler,
    private readonly getCourseResourceHandler: GetCourseResourceHandler,
    private readonly deleteCourseResourceHandler: DeleteCourseResourceHandler,
    private readonly permanentDeleteCourseResourceHandler: PermanentDeleteCourseResourceHandler,
    private readonly restoreCourseResourceHandler: RestoreCourseResourceHandler,
    private readonly moveCourseResourceHandler: MoveCourseResourceHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCourseResourceDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createCourseResourceHandler.execute(
      new CreateCourseResourceCommand(
        dto.lessonId,
        dto.title,
        dto.type,
        dto.fileUrl,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course resource created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListCourseResourcesQueryDto) {
    const result = await this.listCourseResourcesHandler.execute(
      new ListCourseResourcesQuery(
        query.lessonId,
        query.type,
        query.search,
        query.includeDeleted,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Course resources fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCourseResourceHandler.execute(
      new GetCourseResourceQuery(id, true),
    );

    return {
      success: true,
      message: 'Course resource fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseResourceDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseResourceHandler.execute(
      new UpdateCourseResourceCommand(
        id,
        dto.title,
        dto.type,
        dto.fileUrl,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course resource updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteCourseResourceHandler.execute(
      new DeleteCourseResourceCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course resource deleted successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result =
      await this.permanentDeleteCourseResourceHandler.execute(
        new PermanentDeleteCourseResourceCommand(id),
      );

    return {
      success: true,
      message: 'Course resource permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreCourseResourceHandler.execute(
      new RestoreCourseResourceCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course resource restored successfully',
      data: result,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() dto: MoveCourseResourceDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.moveCourseResourceHandler.execute(
      new MoveCourseResourceCommand(id, dto.newPosition, user?.sub),
    );

    return {
      success: true,
      message: 'Course resource moved successfully',
      data: result,
    };
  }
}
