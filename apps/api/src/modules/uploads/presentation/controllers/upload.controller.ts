import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { UploadFileCommand } from '../../application/upload-file/upload-file.command';
import { UploadFileHandler } from '../../application/upload-file/upload-file.handler';
import { ReplaceFileCommand } from '../../application/replace-file/replace-file.command';
import { ReplaceFileHandler } from '../../application/replace-file/replace-file.handler';
import { DeleteFileCommand } from '../../application/delete-file/delete-file.command';
import { DeleteFileHandler } from '../../application/delete-file/delete-file.handler';
import { DeleteFilesCommand } from '../../application/delete-files/delete-files.command';
import { DeleteFilesHandler } from '../../application/delete-files/delete-files.handler';
import { GetFileHandler } from '../../application/get-file/get-file.handler';
import { GetFileQuery } from '../../application/get-file/get-file.query';
import { GetSignedUrlHandler } from '../../application/get-signed-url/get-signed-url.handler';
import { GetSignedUrlQuery } from '../../application/get-signed-url/get-signed-url.query';
import { CopyFileCommand } from '../../application/copy-file/copy-file.command';
import { CopyFileHandler } from '../../application/copy-file/copy-file.handler';
import { MoveFileCommand } from '../../application/move-file/move-file.command';
import { MoveFileHandler } from '../../application/move-file/move-file.handler';
import { GetFileByUrlHandler } from '../../application/get-file-by-url/get-file-by-url.handler';
import { GetFileByUrlQuery } from '../../application/get-file-by-url/get-file-by-url.query';
import { GetFileByObjectKeyHandler } from '../../application/get-file-by-object-key/get-file-by-object-key.handler';
import { GetFileByObjectKeyQuery } from '../../application/get-file-by-object-key/get-file-by-object-key.query';
import { PermanentDeleteUploadCommand } from '../../application/permanent-delete-upload/permanent-delete-upload.command';
import { PermanentDeleteUploadHandler } from '../../application/permanent-delete-upload/permanent-delete-upload.handler';
import { RestoreUploadCommand } from '../../application/restore-upload/restore-upload.command';
import { RestoreUploadHandler } from '../../application/restore-upload/restore-upload.handler';
import { RestoreUploadsCommand } from '../../application/restore-uploads/restore-uploads.command';
import { RestoreUploadsHandler } from '../../application/restore-uploads/restore-uploads.handler';
import { UploadValidationService } from '../../domain/services/upload-validation.service';

import {
  CopyFileDto,
  DeleteFilesDto,
  GetFileByObjectKeyQueryDto,
  GetFileByUrlQueryDto,
  GetFileQueryDto,
  MoveFileDto,
  RestoreUploadsDto,
  UploadFileDto,
} from '../dtos/upload.dto';

@ApiTags('Admin Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/uploads')
export class UploadController {
  constructor(
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly replaceFileHandler: ReplaceFileHandler,
    private readonly deleteFileHandler: DeleteFileHandler,
    private readonly deleteFilesHandler: DeleteFilesHandler,
    private readonly getFileHandler: GetFileHandler,
    private readonly getSignedUrlHandler: GetSignedUrlHandler,
    private readonly copyFileHandler: CopyFileHandler,
    private readonly moveFileHandler: MoveFileHandler,
    private readonly getFileByUrlHandler: GetFileByUrlHandler,
    private readonly getFileByObjectKeyHandler: GetFileByObjectKeyHandler,
    private readonly permanentDeleteUploadHandler: PermanentDeleteUploadHandler,
    private readonly restoreUploadHandler: RestoreUploadHandler,
    private readonly restoreUploadsHandler: RestoreUploadsHandler,
    private readonly validationService: UploadValidationService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
        fileName: { type: 'string' },
        entityId: { type: 'string' },
      },
      required: ['file', 'folder', 'fileName'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureFile(file);
    this.validationService.validate(file);

    const result = await this.uploadFileHandler.execute(
      new UploadFileCommand(
        file,
        dto.folder,
        dto.fileName,
        dto.entityId,
        undefined,
        undefined,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Get('by-url')
  async getByUrl(@Query() query: GetFileByUrlQueryDto) {
    const result = await this.getFileByUrlHandler.execute(
      new GetFileByUrlQuery(query.url, query.includeDeleted),
    );

    return {
      success: true,
      message: 'Upload fetched successfully',
      data: result,
    };
  }

  @Get('by-object-key')
  async getByObjectKey(@Query() query: GetFileByObjectKeyQueryDto) {
    const result = await this.getFileByObjectKeyHandler.execute(
      new GetFileByObjectKeyQuery(
        query.objectKey,
        query.includeDeleted,
      ),
    );

    return {
      success: true,
      message: 'Upload fetched successfully',
      data: result,
    };
  }

  @Get()
  async getByQuery(@Query() query: GetFileQueryDto) {
    const result = await this.getFileHandler.execute(
      new GetFileQuery(
        query.id,
        query.objectKey,
        query.url,
        query.includeDeleted,
      ),
    );

    return {
      success: true,
      message: 'Upload fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getFileHandler.execute(
      new GetFileQuery(id),
    );

    return {
      success: true,
      message: 'Upload fetched successfully',
      data: result,
    };
  }

  @Get(':id/signed-url')
  async getSignedUrl(@Param('id') id: string) {
    const result = await this.getSignedUrlHandler.execute(
      new GetSignedUrlQuery(id),
    );

    return {
      success: true,
      message: 'Signed URL generated successfully',
      data: result,
    };
  }

  @Patch(':id/replace')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async replace(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureFile(file);
    this.validationService.validate(file);

    const result = await this.replaceFileHandler.execute(
      new ReplaceFileCommand(id, file, user?.sub),
    );

    return {
      success: true,
      message: 'File replaced successfully',
      data: result,
    };
  }

  @Post(':id/copy')
  async copy(
    @Param('id') id: string,
    @Body() dto: CopyFileDto,
  ) {
    const result = await this.copyFileHandler.execute(
      new CopyFileCommand(
        id,
        dto.folder,
        dto.entityId,
        dto.fileName,
      ),
    );

    return {
      success: true,
      message: 'File copied successfully',
      data: result,
    };
  }

  @Post(':id/move')
  async move(
    @Param('id') id: string,
    @Body() dto: MoveFileDto,
  ) {
    const result = await this.moveFileHandler.execute(
      new MoveFileCommand(
        id,
        dto.folder,
        dto.entityId,
        dto.fileName,
      ),
    );

    return {
      success: true,
      message: 'File moved successfully',
      data: result,
    };
  }

  @Delete('bulk')
  async deleteMany(@Body() dto: DeleteFilesDto) {
    const result = await this.deleteFilesHandler.execute(
      new DeleteFilesCommand(dto.ids),
    );

    return {
      success: true,
      message: 'Files deleted successfully',
      data: result,
    };
  }

  @Patch('bulk/restore')
  async restoreMany(@Body() dto: RestoreUploadsDto) {
    const result = await this.restoreUploadsHandler.execute(
      new RestoreUploadsCommand(dto.ids),
    );

    return {
      success: true,
      message: 'Files restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.permanentDeleteUploadHandler.execute(
      new PermanentDeleteUploadCommand(id),
    );

    return {
      success: true,
      message: 'Upload permanently deleted successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.deleteFileHandler.execute(
      new DeleteFileCommand(id),
    );

    return {
      success: true,
      message: 'File deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    const result = await this.restoreUploadHandler.execute(
      new RestoreUploadCommand(id),
    );

    return {
      success: true,
      message: 'File restored successfully',
      data: result,
    };
  }

  private ensureFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'File is required',
        400,
      );
    }
  }
}
