import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetCourseModuleHandler } from '../../application/get-course-module/get-course-module.handler';
import { GetCourseModuleQuery } from '../../application/get-course-module/get-course-module.query';
import { ListCourseModulesHandler } from '../../application/list-course-modules/list-course-modules.handler';
import { ListCourseModulesQuery } from '../../application/list-course-modules/list-course-modules.query';
import { ListCourseModulesQueryDto } from '../dtos/list-course-modules-query.dto';

@ApiTags('Course Modules')
@Controller('course-modules')
export class CourseModuleController {
  constructor(
    private readonly listCourseModulesHandler: ListCourseModulesHandler,
    private readonly getCourseModuleHandler: GetCourseModuleHandler,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Course modules listed',
  })
  async list(@Query() query: ListCourseModulesQueryDto) {
    const result = await this.listCourseModulesHandler.execute(
      new ListCourseModulesQuery(
        query.courseId,
        query.search,
        false,
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
      new GetCourseModuleQuery(id, false),
    );

    return {
      success: true,
      message: 'Course module fetched successfully',
      data: result,
    };
  }
}
