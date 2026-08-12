import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetCourseLessonHandler } from '../../application/get-course-lesson/get-course-lesson.handler';
import { GetCourseLessonQuery } from '../../application/get-course-lesson/get-course-lesson.query';
import { ListCourseLessonsHandler } from '../../application/list-course-lessons/list-course-lessons.handler';
import { ListCourseLessonsQuery } from '../../application/list-course-lessons/list-course-lessons.query';
import { ListCourseLessonsQueryDto } from '../dtos/list-course-lessons-query.dto';

@ApiTags('Course Lessons')
@Controller('course-lessons')
export class CourseLessonController {
  constructor(
    private readonly listCourseLessonsHandler: ListCourseLessonsHandler,
    private readonly getCourseLessonHandler: GetCourseLessonHandler,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Course lessons listed',
  })
  async list(@Query() query: ListCourseLessonsQueryDto) {
    const result = await this.listCourseLessonsHandler.execute(
      new ListCourseLessonsQuery(
        query.moduleId,
        query.search,
        false,
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
      new GetCourseLessonQuery(id, false),
    );

    return {
      success: true,
      message: 'Course lesson fetched successfully',
      data: result,
    };
  }
}
