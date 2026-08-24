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

import { CreateCourseLessonCommand } from '../../application/create-course-lesson/create-course-lesson.command';
import { CreateCourseLessonHandler } from '../../application/create-course-lesson/create-course-lesson.handler';
import { DeleteCourseLessonCommand } from '../../application/delete-course-lesson/delete-course-lesson.command';
import { DeleteCourseLessonHandler } from '../../application/delete-course-lesson/delete-course-lesson.handler';
import { GetCourseLessonHandler } from '../../application/get-course-lesson/get-course-lesson.handler';
import { GetCourseLessonQuery } from '../../application/get-course-lesson/get-course-lesson.query';
import { ListCourseLessonsHandler } from '../../application/list-course-lessons/list-course-lessons.handler';
import { ListCourseLessonsQuery } from '../../application/list-course-lessons/list-course-lessons.query';
import { MoveCourseLessonCommand } from '../../application/move-course-lesson/move-course-lesson.command';
import { MoveCourseLessonHandler } from '../../application/move-course-lesson/move-course-lesson.handler';
import { PermanentDeleteCourseLessonCommand } from '../../application/permanent-delete-course-lesson/permanent-delete-course-lesson.command';
import { PermanentDeleteCourseLessonHandler } from '../../application/permanent-delete-course-lesson/permanent-delete-course-lesson.handler';
import { RestoreCourseLessonCommand } from '../../application/restore-course-lesson/restore-course-lesson.command';
import { RestoreCourseLessonHandler } from '../../application/restore-course-lesson/restore-course-lesson.handler';
import { DeactivateCourseLessonCommand } from '../../application/deactivate-course-lesson/deactivate-course-lesson.command';
import { DeactivateCourseLessonHandler } from '../../application/deactivate-course-lesson/deactivate-course-lesson.handler';
import { ActivateCourseLessonCommand } from '../../application/activate-course-lesson/activate-course-lesson.command';
import { ActivateCourseLessonHandler } from '../../application/activate-course-lesson/activate-course-lesson.handler';
import { UpdateCourseLessonCommand } from '../../application/update-course-lesson/update-course-lesson.command';
import { UpdateCourseLessonHandler } from '../../application/update-course-lesson/update-course-lesson.handler';
import { SetLessonPreviewCommand } from '../../application/set-lesson-preview/set-lesson-preview.command';
import { SetLessonPreviewHandler } from '../../application/set-lesson-preview/set-lesson-preview.handler';
import { CreateCourseLessonDto } from '../dtos/create-course-lesson.dto';
import { ListCourseLessonsQueryDto } from '../dtos/list-course-lessons-query.dto';
import { MoveCourseLessonDto } from '../dtos/move-course-lesson.dto';
import { SetLessonPreviewDto } from '../dtos/set-lesson-preview.dto';
import { UpdateCourseLessonDto } from '../dtos/update-course-lesson.dto';

@ApiTags('Admin Course Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/course-lessons')
export class AdminCourseLessonController {
  constructor(
    private readonly createCourseLessonHandler: CreateCourseLessonHandler,
    private readonly updateCourseLessonHandler: UpdateCourseLessonHandler,
    private readonly listCourseLessonsHandler: ListCourseLessonsHandler,
    private readonly getCourseLessonHandler: GetCourseLessonHandler,
    private readonly deleteCourseLessonHandler: DeleteCourseLessonHandler,
    private readonly permanentDeleteCourseLessonHandler: PermanentDeleteCourseLessonHandler,
    private readonly restoreCourseLessonHandler: RestoreCourseLessonHandler,
    private readonly deactivateCourseLessonHandler: DeactivateCourseLessonHandler,
    private readonly activateCourseLessonHandler: ActivateCourseLessonHandler,
    private readonly moveCourseLessonHandler: MoveCourseLessonHandler,
    private readonly setLessonPreviewHandler: SetLessonPreviewHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCourseLessonDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createCourseLessonHandler.execute(
      new CreateCourseLessonCommand(
        dto.moduleId,
        dto.title,
        dto.description,
        dto.videoUrl,
        dto.duration,
        dto.contentType,
        dto.parentLessonId ?? null,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course lesson created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListCourseLessonsQueryDto) {
    const parentLessonId = query.parentLessonScope === 'root'
      ? null
      : query.parentLessonId;

    const result = await this.listCourseLessonsHandler.execute(
      new ListCourseLessonsQuery(
        query.moduleId,
        parentLessonId,
        query.contentType,
        query.search,
        query.includeDeleted,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Course lessons fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCourseLessonHandler.execute(
      new GetCourseLessonQuery(id, true),
    );

    return {
      success: true,
      message: 'Course lesson fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseLessonDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseLessonHandler.execute(
      new UpdateCourseLessonCommand(
        id,
        dto.title,
        dto.description,
        dto.videoUrl,
        dto.duration,
        dto.contentType,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course lesson updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteCourseLessonHandler.execute(
      new DeleteCourseLessonCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course lesson deleted successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result =
      await this.permanentDeleteCourseLessonHandler.execute(
        new PermanentDeleteCourseLessonCommand(id),
      );

    return {
      success: true,
      message: 'Course lesson permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deactivateCourseLessonHandler.execute(
      new DeactivateCourseLessonCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course lesson deactivated successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.activateCourseLessonHandler.execute(
      new ActivateCourseLessonCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course lesson activated successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreCourseLessonHandler.execute(
      new RestoreCourseLessonCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course lesson restored successfully',
      data: result,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() dto: MoveCourseLessonDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.moveCourseLessonHandler.execute(
      new MoveCourseLessonCommand(id, dto.newPosition, user?.sub),
    );

    return {
      success: true,
      message: 'Course lesson moved successfully',
      data: result,
    };
  }

  @Patch(':id/preview')
  async setPreview(
    @Param('id') id: string,
    @Body() dto: SetLessonPreviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.setLessonPreviewHandler.execute(
      new SetLessonPreviewCommand(id, dto.isPreview, user?.sub),
    );

    return {
      success: true,
      message: dto.isPreview
        ? 'Lesson unlocked for free preview'
        : 'Lesson locked from free preview',
      data: result,
    };
  }
}
