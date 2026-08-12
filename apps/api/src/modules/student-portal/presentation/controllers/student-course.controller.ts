import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { ListStudentCoursesHandler } from '../../application/list-student-courses/list-student-courses.handler';
import { ListStudentCoursesQuery } from '../../application/list-student-courses/list-student-courses.query';
import { GetStudentCourseHandler } from '../../application/get-student-course/get-student-course.handler';
import { GetStudentCourseQuery } from '../../application/get-student-course/get-student-course.query';
import {
  GetStudentCourseLessonHandler,
  GetStudentCourseModuleHandler,
} from '../../application/get-student-course/get-student-course.handler';
import {
  DownloadStudentResourceHandler,
  GetStudentCourseCompletionHandler,
  GetStudentCourseProgressHandler,
  UpdateLessonProgressHandler,
} from '../../application/student-course-progress/student-course-progress.handler';

@ApiTags('Student Courses')
@ApiBearerAuth()
@Controller('student/courses')
@UseGuards(JwtAuthGuard)
export class StudentCourseController {
  constructor(
    private readonly listStudentCoursesHandler: ListStudentCoursesHandler,
    private readonly getStudentCourseHandler: GetStudentCourseHandler,
    private readonly getStudentCourseModuleHandler: GetStudentCourseModuleHandler,
    private readonly getStudentCourseLessonHandler: GetStudentCourseLessonHandler,
    private readonly getStudentCourseProgressHandler: GetStudentCourseProgressHandler,
    private readonly updateLessonProgressHandler: UpdateLessonProgressHandler,
    private readonly getStudentCourseCompletionHandler: GetStudentCourseCompletionHandler,
    private readonly downloadStudentResourceHandler: DownloadStudentResourceHandler,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Admitted courses listed' })
  async list(@CurrentUser() user: AuthUser) {
    const result = await this.listStudentCoursesHandler.execute(
      new ListStudentCoursesQuery(user.sub),
    );

    return {
      success: true,
      message: 'Enrolled courses fetched successfully',
      data: result,
    };
  }

  @Get(':courseId')
  async getCourse(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
  ) {
    const result = await this.getStudentCourseHandler.execute(
      new GetStudentCourseQuery(user.sub, courseId),
    );

    return {
      success: true,
      message: 'Course fetched successfully',
      data: result,
    };
  }

  @Get(':courseId/modules/:moduleId')
  async getModule(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    const result = await this.getStudentCourseModuleHandler.execute({
      userId: user.sub,
      courseId,
      moduleId,
    });

    return {
      success: true,
      message: 'Course module fetched successfully',
      data: result,
    };
  }

  @Get(':courseId/lessons/:lessonId')
  async getLesson(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const result = await this.getStudentCourseLessonHandler.execute({
      userId: user.sub,
      courseId,
      lessonId,
    });

    return {
      success: true,
      message: 'Course lesson fetched successfully',
      data: result,
    };
  }

  @Get(':courseId/lessons/:lessonId/resources')
  async getLessonResources(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const result = await this.getStudentCourseLessonHandler.execute({
      userId: user.sub,
      courseId,
      lessonId,
    });

    return {
      success: true,
      message: 'Lesson resources fetched successfully',
      data: result.lesson.resources,
    };
  }

  @Get(':courseId/lessons/:lessonId/video')
  async getLessonVideo(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const result = await this.getStudentCourseLessonHandler.execute({
      userId: user.sub,
      courseId,
      lessonId,
    });

    return {
      success: true,
      message: 'Lesson video fetched successfully',
      data: {
        lessonId: result.lesson.id,
        videoUrl: result.lesson.videoUrl,
      },
    };
  }

  @Get(':courseId/progress')
  async getProgress(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
  ) {
    const result = await this.getStudentCourseProgressHandler.execute({
      userId: user.sub,
      courseId,
    });

    return {
      success: true,
      message: 'Course progress fetched successfully',
      data: result,
    };
  }

  @Patch(':courseId/lessons/:lessonId/progress')
  async updateProgress(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body()
    body: {
      isCompleted?: boolean;
      watchedSeconds?: number;
    },
  ) {
    const result = await this.updateLessonProgressHandler.execute({
      userId: user.sub,
      courseId,
      lessonId,
      isCompleted: body.isCompleted,
      watchedSeconds: body.watchedSeconds,
    });

    return {
      success: true,
      message: 'Lesson progress updated successfully',
      data: result,
    };
  }

  @Get(':courseId/completion')
  async getCompletion(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
  ) {
    const result = await this.getStudentCourseCompletionHandler.execute({
      userId: user.sub,
      courseId,
    });

    return {
      success: true,
      message: 'Course completion fetched successfully',
      data: result,
    };
  }
}

@ApiTags('Student Resources')
@ApiBearerAuth()
@Controller('student/resources')
@UseGuards(JwtAuthGuard)
export class StudentResourceController {
  constructor(
    private readonly downloadStudentResourceHandler: DownloadStudentResourceHandler,
  ) {}

  @Get(':resourceId/download')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('resourceId') resourceId: string,
    @Query('courseId') courseId: string,
  ) {
    const result = await this.downloadStudentResourceHandler.execute({
      userId: user.sub,
      courseId,
      resourceId,
    });

    return {
      success: true,
      message: 'Resource download URL generated successfully',
      data: result,
    };
  }
}
