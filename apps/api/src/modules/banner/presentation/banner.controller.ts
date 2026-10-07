import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BannerService } from '../banner.service';

@ApiTags('Banners')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('active')
  async listActive() {
    const data = await this.bannerService.listActivePublic();

    return {
      success: true,
      message: 'Active banners fetched successfully',
      data,
    };
  }
}
