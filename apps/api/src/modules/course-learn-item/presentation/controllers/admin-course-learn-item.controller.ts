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

import { CreateCourseLearnItemCommand } from '../../application/create-course-learn-item/create-course-learn-item.command';
import { CreateCourseLearnItemHandler } from '../../application/create-course-learn-item/create-course-learn-item.handler';
import { DeleteCourseLearnItemCommand } from '../../application/delete-course-learn-item/delete-course-learn-item.command';
import { DeleteCourseLearnItemHandler } from '../../application/delete-course-learn-item/delete-course-learn-item.handler';
import { GetCourseLearnItemHandler } from '../../application/get-course-learn-item/get-course-learn-item.handler';
import { GetCourseLearnItemQuery } from '../../application/get-course-learn-item/get-course-learn-item.query';
import { ListCourseLearnItemsHandler } from '../../application/list-course-learn-items/list-course-learn-items.handler';
import { ListCourseLearnItemsQuery } from '../../application/list-course-learn-items/list-course-learn-items.query';
import { MoveCourseLearnItemCommand } from '../../application/move-course-learn-item/move-course-learn-item.command';
import { MoveCourseLearnItemHandler } from '../../application/move-course-learn-item/move-course-learn-item.handler';
import { UpdateCourseLearnItemCommand } from '../../application/update-course-learn-item/update-course-learn-item.command';
import { UpdateCourseLearnItemHandler } from '../../application/update-course-learn-item/update-course-learn-item.handler';
import { CreateCourseLearnItemDto } from '../dtos/create-course-learn-item.dto';
import { ListCourseLearnItemsQueryDto } from '../dtos/list-course-learn-items-query.dto';
import { MoveCourseLearnItemDto } from '../dtos/move-course-learn-item.dto';
import { UpdateCourseLearnItemDto } from '../dtos/update-course-learn-item.dto';

@ApiTags('Admin Course Learn Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/course-learn-items')
export class AdminCourseLearnItemController {
  constructor(
    private readonly createCourseLearnItemHandler: CreateCourseLearnItemHandler,
    private readonly updateCourseLearnItemHandler: UpdateCourseLearnItemHandler,
    private readonly listCourseLearnItemsHandler: ListCourseLearnItemsHandler,
    private readonly getCourseLearnItemHandler: GetCourseLearnItemHandler,
    private readonly deleteCourseLearnItemHandler: DeleteCourseLearnItemHandler,
    private readonly moveCourseLearnItemHandler: MoveCourseLearnItemHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCourseLearnItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createCourseLearnItemHandler.execute(
      new CreateCourseLearnItemCommand(
        dto.lessonId,
        dto.title,
        dto.explanation,
        dto.imageUrl,
        dto.keyLearningPoints,
        dto.finalThoughts,
        dto.summary,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course learn item created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListCourseLearnItemsQueryDto) {
    const result = await this.listCourseLearnItemsHandler.execute(
      new ListCourseLearnItemsQuery(
        query.lessonId,
        query.search,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Course learn items fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCourseLearnItemHandler.execute(
      new GetCourseLearnItemQuery(id),
    );

    return {
      success: true,
      message: 'Course learn item fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseLearnItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseLearnItemHandler.execute(
      new UpdateCourseLearnItemCommand(
        id,
        dto.title,
        dto.explanation,
        dto.imageUrl,
        dto.keyLearningPoints,
        dto.finalThoughts,
        dto.summary,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course learn item updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.deleteCourseLearnItemHandler.execute(
      new DeleteCourseLearnItemCommand(id),
    );

    return {
      success: true,
      message: 'Course learn item deleted successfully',
      data: result,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() dto: MoveCourseLearnItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.moveCourseLearnItemHandler.execute(
      new MoveCourseLearnItemCommand(id, dto.newPosition, user?.sub),
    );

    return {
      success: true,
      message: 'Course learn item moved successfully',
      data: result,
    };
  }
}
