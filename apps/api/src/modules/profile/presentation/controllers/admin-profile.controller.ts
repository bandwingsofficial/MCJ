// src/modules/profile/presentation/controllers/admin-profile.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';

import {
  CurrentUser,
  type AuthUser,
} from '../../../../common/decorators/current-user.decorator';

// 🔥 later add AdminGuard
// import { AdminGuard } from '../guards/admin.guard';

// =====================
// HANDLERS
// =====================

import { CreateProfileHandler } from '../../application/create-profile/create-profile.handler';

import { GetProfileHandler } from '../../application/get-profile/get-profile.handler';

import { UpdateProfileHandler } from '../../application/update-profile/update-profile.handler';

import { DeleteProfileHandler } from '../../application/delete-profile/delete-profile.handler';

// =====================
// COMMANDS
// =====================

import { CreateProfileCommand } from '../../application/create-profile/create-profile.command';

import { GetProfileCommand } from '../../application/get-profile/get-profile.command';

import { UpdateProfileCommand } from '../../application/update-profile/update-profile.command';

import { DeleteProfileCommand } from '../../application/delete-profile/delete-profile.command';

// =====================
// DTOs
// =====================

import { CreateProfileDto } from '../dtos/create-profile.dto';

import { UpdateProfileDto } from '../dtos/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/profile')
export class AdminProfileController {
  constructor(
    private readonly createProfileHandler: CreateProfileHandler,

    private readonly getProfileHandler: GetProfileHandler,

    private readonly updateProfileHandler: UpdateProfileHandler,

    private readonly deleteProfileHandler: DeleteProfileHandler,
  ) {}

  // =====================
  // 🟢 CREATE ADMIN PROFILE
  // =====================

  @Post()
  async create(
    @CurrentUser()
    user: AuthUser,

    @Body()
    dto: CreateProfileDto,
  ) {
    const result =
      await this.createProfileHandler.execute(
        new CreateProfileCommand(
          user.sub,

          dto.firstName,
          dto.lastName,

          dto.email,
          dto.phone,

          dto.gender,

          dto.dob
    ? new Date(dto.dob)
    : undefined,

          dto.profileImage,

          dto.addressLine1,
          dto.addressLine2,

          dto.city,
          dto.state,
          dto.country,

          dto.postalCode,

          dto.bio,
        ),
      );

    return {
      message: 'Admin profile created successfully',

      data: result,
    };
  }

  // =====================
  // 👤 GET MY ADMIN PROFILE
  // =====================

  @Get()
  async getMyProfile(
    @CurrentUser()
    user: AuthUser,
  ) {
    const result =
      await this.getProfileHandler.execute(
        new GetProfileCommand(user.sub),
      );

    return {
      message: 'Admin profile fetched successfully',

      data: result,
    };
  }

  // =====================
  // ✏️ UPDATE ADMIN PROFILE
  // =====================

  @Patch()
  async update(
    @CurrentUser()
    user: AuthUser,

    @Body()
    dto: UpdateProfileDto,
  ) {
    const result =
      await this.updateProfileHandler.execute(
        new UpdateProfileCommand(
          user.sub,

          dto.firstName,
          dto.lastName,

          dto.email,
          dto.phone,

          dto.gender,

          dto.dob !== undefined && dto.dob !== null
            ? new Date(dto.dob)
            : dto.dob,

          dto.profileImage,

          dto.addressLine1,
          dto.addressLine2,

          dto.city,
          dto.state,
          dto.country,

          dto.postalCode,

          dto.bio,
        ),
      );

    return {
      message: 'Admin profile updated successfully',

      data: result,
    };
  }

  // =====================
  // 🗑️ DELETE ADMIN PROFILE
  // =====================

@Delete()
async delete(
  @CurrentUser()
  user: AuthUser,
) {
  const result =
    await this.deleteProfileHandler.execute(
      new DeleteProfileCommand(user.sub),
    );

  return {
    message: result.message,
  };
}}