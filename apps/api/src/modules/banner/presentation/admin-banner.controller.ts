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

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { BannerService } from '../banner.service';
import {
  ListBannersQueryDto,
  ReplaceBannerImageDto,
  UpdateBannerStatusDto,
  UpsertBannerDto,
} from './banner.dto';

@ApiTags('Admin Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/banners')
export class AdminBannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async list(@Query() query: ListBannersQueryDto) {
    const result = await this.bannerService.list(query);

    return {
      success: true,
      message: 'Banners fetched successfully',
      data: result.items,
      meta: {
        total: result.total,
        catalogTotal: result.catalogTotal,
        skip: result.skip,
        take: result.take,
      },
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.bannerService.getById(id);

    return {
      success: true,
      message: 'Banner fetched successfully',
      data,
    };
  }

  @Post()
  async create(@Body() dto: UpsertBannerDto) {
    const data = await this.bannerService.create(dto);

    return {
      success: true,
      message: 'Banner created successfully',
      data,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpsertBannerDto) {
    const data = await this.bannerService.update(id, dto);

    return {
      success: true,
      message: 'Banner updated successfully',
      data,
    };
  }

  @Patch(':id/images/:imageId')
  async replaceImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() dto: ReplaceBannerImageDto,
  ) {
    const data = await this.bannerService.replaceImage(
      id,
      imageId,
      dto.uploadId,
    );

    return {
      success: true,
      message: 'Banner image replaced successfully',
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBannerStatusDto,
  ) {
    const data = await this.bannerService.setStatus(id, dto.status);

    return {
      success: true,
      message:
        dto.status === 'ACTIVE'
          ? 'Banner activated successfully'
          : 'Banner deactivated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.bannerService.permanentDelete(id);

    return {
      success: true,
      message: 'Banner deleted successfully',
      data,
    };
  }
}
