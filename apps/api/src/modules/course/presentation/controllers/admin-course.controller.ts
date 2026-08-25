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
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import type {
  CourseImageInput,
  CourseMaterialInput,
} from '../../application/create-course/create-course.command';
import { CreateCourseCommand } from '../../application/create-course/create-course.command';
import { CreateCourseHandler } from '../../application/create-course/create-course.handler';
import { BulkDeleteCoursesCommand } from '../../application/bulk-delete-courses/bulk-delete-courses.command';
import { BulkDeleteCoursesHandler } from '../../application/bulk-delete-courses/bulk-delete-courses.handler';
import { BulkPermanentDeleteCoursesCommand } from '../../application/bulk-permanent-delete-courses/bulk-permanent-delete-courses.command';
import { BulkPermanentDeleteCoursesHandler } from '../../application/bulk-permanent-delete-courses/bulk-permanent-delete-courses.handler';
import { BulkRestoreCoursesCommand } from '../../application/bulk-restore-courses/bulk-restore-courses.command';
import { BulkRestoreCoursesHandler } from '../../application/bulk-restore-courses/bulk-restore-courses.handler';
import { BulkUpdateCourseStatusCommand } from '../../application/bulk-update-course-status/bulk-update-course-status.command';
import { BulkUpdateCourseStatusHandler } from '../../application/bulk-update-course-status/bulk-update-course-status.handler';
import { DeleteCourseCommand } from '../../application/delete-course/delete-course.command';
import { DeleteCourseHandler } from '../../application/delete-course/delete-course.handler';
import { GetCourseHandler } from '../../application/get-course/get-course.handler';
import { GetCourseQuery } from '../../application/get-course/get-course.query';
import { GetCourseSummaryHandler } from '../../application/get-course-summary/get-course-summary.handler';
import { GetCourseSummaryQuery } from '../../application/get-course-summary/get-course-summary.query';
import { ListCoursesHandler } from '../../application/list-courses/list-courses.handler';
import { ListCoursesQuery } from '../../application/list-courses/list-courses.query';
import { PermanentDeleteCourseCommand } from '../../application/permanent-delete-course/permanent-delete-course.command';
import { PermanentDeleteCourseHandler } from '../../application/permanent-delete-course/permanent-delete-course.handler';
import { ReorderCoursesCommand } from '../../application/reorder-courses/reorder-courses.command';
import { ReorderCoursesHandler } from '../../application/reorder-courses/reorder-courses.handler';
import { RestoreCourseCommand } from '../../application/restore-course/restore-course.command';
import { RestoreCourseHandler } from '../../application/restore-course/restore-course.handler';
import { UpdateCourseCommand } from '../../application/update-course/update-course.command';
import { UpdateCourseHandler } from '../../application/update-course/update-course.handler';
import { UpdateCourseStatusCommand } from '../../application/update-course-status/update-course-status.command';
import { UpdateCourseStatusHandler } from '../../application/update-course-status/update-course-status.handler';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { BulkCourseIdsDto } from '../dtos/bulk-course-ids.dto';
import { BulkUpdateCourseStatusDto } from '../dtos/bulk-update-course-status.dto';
import { ListCoursesQueryDto } from '../dtos/list-courses-query.dto';
import { ReorderCoursesDto } from '../dtos/reorder-courses.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { SuggestCourseCodeHandler } from '../../application/suggest-course-code/suggest-course-code.handler';
import { SuggestCourseCodeQuery } from '../../application/suggest-course-code/suggest-course-code.query';

@ApiTags('Admin Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/courses')
export class AdminCourseController {
  constructor(
    private readonly createCourseHandler: CreateCourseHandler,
    private readonly updateCourseHandler: UpdateCourseHandler,
    private readonly listCoursesHandler: ListCoursesHandler,
    private readonly getCourseHandler: GetCourseHandler,
    private readonly deleteCourseHandler: DeleteCourseHandler,
    private readonly restoreCourseHandler: RestoreCourseHandler,
    private readonly permanentDeleteCourseHandler: PermanentDeleteCourseHandler,
    private readonly updateCourseStatusHandler: UpdateCourseStatusHandler,
    private readonly reorderCoursesHandler: ReorderCoursesHandler,
    private readonly bulkUpdateCourseStatusHandler: BulkUpdateCourseStatusHandler,
    private readonly bulkDeleteCoursesHandler: BulkDeleteCoursesHandler,
    private readonly bulkRestoreCoursesHandler: BulkRestoreCoursesHandler,
    private readonly bulkPermanentDeleteCoursesHandler: BulkPermanentDeleteCoursesHandler,
    private readonly getCourseSummaryHandler: GetCourseSummaryHandler,
    private readonly suggestCourseCodeHandler: SuggestCourseCodeHandler,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Course created' })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createCourseHandler.execute(
      new CreateCourseCommand(
        dto.title,
        dto.categoryId,
        dto.slug,
        dto.tagline,
        dto.shortDescription,
        dto.description,
        dto.thumbnailFileId,
        dto.originalPrice,
        dto.discountAmount,
        dto.discountedPrice,
        dto.currency,
        dto.isFree,
        dto.duration,
        dto.durationType,
        dto.level,
        dto.minimumQualifications,
        dto.language,
        dto.averageRating,
        dto.totalReviews,
        dto.isFeatured,
        dto.isPopular,
        dto.displayOrder,
        dto.metaTitle,
        dto.metaDescription,
        dto.metaKeywords,
        dto.branchIds,
        dto.status,
        this.mapImageUploadIds(dto.imageUploadIds),
        this.mapMaterialUploads(dto.materialUploadIds),
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListCoursesQueryDto) {
    const result = await this.listCoursesHandler.execute(
      new ListCoursesQuery(
        query.categoryId,
        query.branchId,
        query.status,
        query.search,
        query.isFeatured,
        query.isPopular,
        query.includeDeleted,
        false,
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

  @Patch('reorder')
  async reorder(@Body() dto: ReorderCoursesDto) {
    const result = await this.reorderCoursesHandler.execute(
      new ReorderCoursesCommand(
        dto.courseId,
        dto.newDisplayOrder,
      ),
    );

    return {
      success: true,
      message: 'Courses reordered successfully',
      data: result,
    };
  }

  @Patch('bulk/status')
  async bulkUpdateStatus(@Body() dto: BulkUpdateCourseStatusDto) {
    const result = await this.bulkUpdateCourseStatusHandler.execute(
      new BulkUpdateCourseStatusCommand(
        dto.courseIds,
        dto.status,
      ),
    );

    return {
      success: true,
      message: 'Course statuses updated successfully',
      data: result,
    };
  }

  @Patch('bulk/restore')
  async bulkRestore(@Body() dto: BulkCourseIdsDto) {
    const result = await this.bulkRestoreCoursesHandler.execute(
      new BulkRestoreCoursesCommand(dto.courseIds),
    );

    return {
      success: true,
      message: 'Courses restored successfully',
      data: result,
    };
  }

  @Delete('bulk')
  async bulkDelete(@Body() dto: BulkCourseIdsDto) {
    const result = await this.bulkDeleteCoursesHandler.execute(
      new BulkDeleteCoursesCommand(dto.courseIds),
    );

    return {
      success: true,
      message: 'Courses deleted successfully',
      data: result,
    };
  }

  @Delete('bulk/permanent')
  async bulkPermanentDelete(@Body() dto: BulkCourseIdsDto) {
    const result =
      await this.bulkPermanentDeleteCoursesHandler.execute(
        new BulkPermanentDeleteCoursesCommand(dto.courseIds),
      );

    return {
      success: true,
      message: 'Courses permanently deleted successfully',
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

  @Get('suggest-code')
  async suggestCode() {
    const result = await this.suggestCourseCodeHandler.execute(
      new SuggestCourseCodeQuery(),
    );

    return {
      success: true,
      message: 'Course code suggested successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getCourseHandler.execute(
      new GetCourseQuery(id, true, false, undefined, true),
    );

    return {
      success: true,
      message: 'Course fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseHandler.execute(
      new UpdateCourseCommand(
        id,
        dto.title,
        dto.categoryId,
        dto.slug,
        dto.tagline,
        dto.shortDescription,
        dto.description,
        dto.thumbnailFileId,
        dto.originalPrice,
        dto.discountAmount,
        dto.discountedPrice,
        dto.currency,
        dto.isFree,
        dto.duration,
        dto.durationType,
        dto.level,
        dto.minimumQualifications,
        dto.language,
        dto.averageRating,
        dto.totalReviews,
        dto.isFeatured,
        dto.isPopular,
        dto.displayOrder,
        dto.metaTitle,
        dto.metaDescription,
        dto.metaKeywords,
        dto.branchIds,
        dto.imageUploadIds
          ? this.mapImageUploadIds(dto.imageUploadIds)
          : undefined,
        dto.materialUploadIds
          ? this.mapMaterialUploads(dto.materialUploadIds)
          : undefined,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.deleteCourseHandler.execute(
      new DeleteCourseCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.restoreCourseHandler.execute(
      new RestoreCourseCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.permanentDeleteCourseHandler.execute(
      new PermanentDeleteCourseCommand(id),
    );

    return {
      success: true,
      message: 'Course permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseStatusHandler.execute(
      new UpdateCourseStatusCommand(id, true, user?.sub),
    );

    return {
      success: true,
      message: 'Course activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateCourseStatusHandler.execute(
      new UpdateCourseStatusCommand(id, false, user?.sub),
    );

    return {
      success: true,
      message: 'Course deactivated successfully',
      data: result,
    };
  }

  private mapImageUploadIds(
    imageUploadIds?: string[],
  ): CourseImageInput[] {
    return (imageUploadIds ?? []).map((fileId, index) => ({
      fileId,
      displayOrder: index,
    }));
  }

  private mapMaterialUploads(
    materials?: CreateCourseDto['materialUploadIds'],
  ): CourseMaterialInput[] {
    return (materials ?? []).map((material, index) => ({
      title: material.title,
      type: material.type,
      fileId: material.uploadId ?? null,
      externalUrl: material.externalUrl ?? null,
      displayOrder: material.displayOrder ?? index,
    }));
  }
}
