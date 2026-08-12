import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetCourseResourceHandler } from '../../application/get-course-resource/get-course-resource.handler';
import { GetCourseResourceQuery } from '../../application/get-course-resource/get-course-resource.query';
import { ListCourseResourcesHandler } from '../../application/list-course-resources/list-course-resources.handler';
import { ListCourseResourcesQuery } from '../../application/list-course-resources/list-course-resources.query';
import { ListCourseResourcesQueryDto } from '../dtos/list-course-resources-query.dto';

@ApiTags('Course Resources')
@Controller('course-resources')
export class CourseResourceController {
  constructor(
    private readonly listCourseResourcesHandler: ListCourseResourcesHandler,
    private readonly getCourseResourceHandler: GetCourseResourceHandler,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Course resources listed',
  })
  async list(@Query() query: ListCourseResourcesQueryDto) {
    const result = await this.listCourseResourcesHandler.execute(
      new ListCourseResourcesQuery(
        query.lessonId,
        query.type,
        query.search,
        false,
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
      new GetCourseResourceQuery(id, false),
    );

    return {
      success: true,
      message: 'Course resource fetched successfully',
      data: result,
    };
  }
}
