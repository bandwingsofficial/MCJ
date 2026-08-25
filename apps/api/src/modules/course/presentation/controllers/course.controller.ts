import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetCourseBySlugHandler } from '../../application/get-course-by-slug/get-course-by-slug.handler';
import { GetCourseBySlugQuery } from '../../application/get-course-by-slug/get-course-by-slug.query';
import { GetPublicCourseModulesHandler } from '../../application/get-public-course-modules/get-public-course-modules.handler';
import { GetPublicCourseModulesQuery } from '../../application/get-public-course-modules/get-public-course-modules.query';
import { GetCourseSummaryHandler } from '../../application/get-course-summary/get-course-summary.handler';
import { GetCourseSummaryQuery } from '../../application/get-course-summary/get-course-summary.query';
import { GetPreviewLessonHandler } from '../../application/get-preview-lesson/get-preview-lesson.handler';
import { GetPreviewLessonQuery } from '../../application/get-preview-lesson/get-preview-lesson.query';
import { GetCourseHandler } from '../../application/get-course/get-course.handler';
import { GetCourseQuery } from '../../application/get-course/get-course.query';
import { ListCoursesHandler } from '../../application/list-courses/list-courses.handler';
import { ListCoursesQuery } from '../../application/list-courses/list-courses.query';
import { ListCoursesQueryDto } from '../dtos/list-courses-query.dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(
    private readonly listCoursesHandler: ListCoursesHandler,
    private readonly getCourseHandler: GetCourseHandler,
    private readonly getCourseBySlugHandler: GetCourseBySlugHandler,
    private readonly getPublicCourseModulesHandler: GetPublicCourseModulesHandler,
    private readonly getPreviewLessonHandler: GetPreviewLessonHandler,
    private readonly getCourseSummaryHandler: GetCourseSummaryHandler,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Active courses listed',
  })
  async list(@Query() query: ListCoursesQueryDto) {
    const result = await this.listCoursesHandler.execute(
      new ListCoursesQuery(
        query.categoryId,
        query.branchId,
        undefined,
        query.search,
        query.isFeatured,
        query.isPopular,
        false,
        true,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Courses fetched successfully',
      data: result,
    };
  }

  @Get('slug/:slug')
async getBySlug(
  @Param('slug') slug: string,
) {
  const result = await this.getCourseBySlugHandler.execute(
    new GetCourseBySlugQuery(
      slug,
      false,
      true,
    ),
  );

  return {
    success: true,
    message: 'Course fetched successfully',
    data: result,
  };
}

  @Get(':id/modules')
  async getModules(@Param('id') id: string) {
    const result = await this.getPublicCourseModulesHandler.execute(
      new GetPublicCourseModulesQuery(id, true),
    );

    return {
      success: true,
      message: 'Course modules fetched successfully',
      data: result,
    };
  }

  @Get(':courseId/lessons/:lessonId/preview')
  async getPreviewLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const result = await this.getPreviewLessonHandler.execute(
      new GetPreviewLessonQuery(courseId, lessonId, true),
    );

    return {
      success: true,
      message: 'Preview lesson fetched successfully',
      data: result,
    };
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string) {
    const result = await this.getCourseSummaryHandler.execute(
      new GetCourseSummaryQuery(id),
    );

    return {
      success: true,
      message: 'Course summary fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCourseHandler.execute(
      new GetCourseQuery(id, false, true),
    );

    return {
      success: true,
      message: 'Course fetched successfully',
      data: result,
    };
  }
}
