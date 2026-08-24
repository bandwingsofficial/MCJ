import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CourseFaqService } from '../../infrastructure/services/course-faq.service';
import { CreateCourseFaqDto } from '../dtos/create-course-faq.dto';
import { ReorderCourseFaqsDto } from '../dtos/reorder-course-faqs.dto';
import { UpdateCourseFaqDto } from '../dtos/update-course-faq.dto';

@ApiTags('Admin Course FAQs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/courses/:courseId/faqs')
export class AdminCourseFaqController {
  constructor(private readonly courseFaqService: CourseFaqService) {}

  @Get()
  async list(@Param('courseId') courseId: string) {
    const data = await this.courseFaqService.listByCourseId(courseId);

    return {
      success: true,
      message: 'Course FAQs fetched successfully',
      data,
    };
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseFaqDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.courseFaqService.create(
      courseId,
      dto.question,
      dto.answer,
      user?.sub,
    );

    return {
      success: true,
      message: 'Course FAQ created successfully',
      data,
    };
  }

  @Patch('reorder')
  async reorder(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderCourseFaqsDto,
  ) {
    const data = await this.courseFaqService.reorder(
      courseId,
      dto.orderedIds,
    );

    return {
      success: true,
      message: 'Course FAQs reordered successfully',
      data,
    };
  }

  @Patch(':faqId')
  async update(
    @Param('courseId') courseId: string,
    @Param('faqId') faqId: string,
    @Body() dto: UpdateCourseFaqDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.courseFaqService.update(
      courseId,
      faqId,
      dto.question,
      dto.answer,
      user?.sub,
    );

    return {
      success: true,
      message: 'Course FAQ updated successfully',
      data,
    };
  }

  @Delete(':faqId')
  async permanentDelete(
    @Param('courseId') courseId: string,
    @Param('faqId') faqId: string,
  ) {
    await this.courseFaqService.permanentDelete(courseId, faqId);

    return {
      success: true,
      message: 'Course FAQ permanently deleted successfully',
      data: { id: faqId, permanentlyDeleted: true },
    };
  }
}
