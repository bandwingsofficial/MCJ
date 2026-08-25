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
import { Roles } from '@common/decorators/roles.decorator';
import { AdminOrBranchRoleGuard } from '@common/guards/admin-or-branch-role.guard';
import { BranchAccessGuard } from '@common/guards/branch-access.guard';
import { JwtOrBranchJwtAuthGuard } from '@common/guards/jwt-or-branch-jwt-auth.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

import { CreateStudentCommand } from '../../application/create-student/create-student.command';
import { CreateStudentHandler } from '../../application/create-student/create-student.handler';
import { CreateStudentDocumentCommand } from '../../application/create-student-document/create-student-document.command';
import { CreateStudentDocumentHandler } from '../../application/create-student-document/create-student-document.handler';
import { DeleteStudentCommand } from '../../application/delete-student/delete-student.command';
import { DeleteStudentHandler } from '../../application/delete-student/delete-student.handler';
import { DeleteStudentDocumentCommand } from '../../application/delete-student-document/delete-student-document.command';
import { DeleteStudentDocumentHandler } from '../../application/delete-student-document/delete-student-document.handler';
import { GetStudentHandler } from '../../application/get-student/get-student.handler';
import { GetStudentQuery } from '../../application/get-student/get-student.query';
import { ListStudentDocumentsHandler } from '../../application/list-student-documents/list-student-documents.handler';
import { ListStudentDocumentsQuery } from '../../application/list-student-documents/list-student-documents.query';
import { ListStudentsHandler } from '../../application/list-students/list-students.handler';
import { ListStudentsQuery } from '../../application/list-students/list-students.query';
import { PermanentDeleteStudentCommand } from '../../application/permanent-delete-student/permanent-delete-student.command';
import { PermanentDeleteStudentHandler } from '../../application/permanent-delete-student/permanent-delete-student.handler';
import { RestoreStudentCommand } from '../../application/restore-student/restore-student.command';
import { RestoreStudentHandler } from '../../application/restore-student/restore-student.handler';
import { UpdateStudentCommand } from '../../application/update-student/update-student.command';
import { UpdateStudentHandler } from '../../application/update-student/update-student.handler';
import { UpdateStudentDocumentCommand } from '../../application/update-student-document/update-student-document.command';
import { UpdateStudentDocumentHandler } from '../../application/update-student-document/update-student-document.handler';
import { UpdateStudentStatusCommand } from '../../application/update-student-status/update-student-status.command';
import { UpdateStudentStatusHandler } from '../../application/update-student-status/update-student-status.handler';
import { SuggestStudentCodeHandler } from '../../application/suggest-student-code/suggest-student-code.handler';
import { SuggestStudentCodeQuery } from '../../application/suggest-student-code/suggest-student-code.query';
import { BulkDeleteStudentsCommand } from '../../application/bulk-delete-students/bulk-delete-students.command';
import { BulkDeleteStudentsHandler } from '../../application/bulk-delete-students/bulk-delete-students.handler';
import { BulkPermanentDeleteStudentsCommand } from '../../application/bulk-permanent-delete-students/bulk-permanent-delete-students.command';
import { BulkPermanentDeleteStudentsHandler } from '../../application/bulk-permanent-delete-students/bulk-permanent-delete-students.handler';
import { BulkRestoreStudentsCommand } from '../../application/bulk-restore-students/bulk-restore-students.command';
import { BulkRestoreStudentsHandler } from '../../application/bulk-restore-students/bulk-restore-students.handler';
import { BulkUpdateStudentStatusCommand } from '../../application/bulk-update-student-status/bulk-update-student-status.command';
import { BulkUpdateStudentStatusHandler } from '../../application/bulk-update-student-status/bulk-update-student-status.handler';
import { BulkStudentIdsDto } from '../dtos/bulk-student-ids.dto';
import { BulkUpdateStudentStatusDto } from '../dtos/bulk-update-student-status.dto';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { CreateStudentDocumentDto } from '../dtos/create-student-document.dto';
import { ListStudentsQueryDto } from '../dtos/list-students-query.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { UpdateStudentDocumentDto } from '../dtos/update-student-document.dto';

type StudentAdminUser = AuthUser & {
  branchId?: string;
};

@ApiTags('Admin Students')
@ApiBearerAuth()
@Controller('admin/students')
export class AdminStudentController {
  constructor(
    private readonly createStudentHandler: CreateStudentHandler,
    private readonly updateStudentHandler: UpdateStudentHandler,
    private readonly listStudentsHandler: ListStudentsHandler,
    private readonly getStudentHandler: GetStudentHandler,
    private readonly deleteStudentHandler: DeleteStudentHandler,
    private readonly restoreStudentHandler: RestoreStudentHandler,
    private readonly permanentDeleteStudentHandler: PermanentDeleteStudentHandler,
    private readonly updateStudentStatusHandler: UpdateStudentStatusHandler,
    private readonly suggestStudentCodeHandler: SuggestStudentCodeHandler,
    private readonly bulkUpdateStudentStatusHandler: BulkUpdateStudentStatusHandler,
    private readonly bulkDeleteStudentsHandler: BulkDeleteStudentsHandler,
    private readonly bulkRestoreStudentsHandler: BulkRestoreStudentsHandler,
    private readonly bulkPermanentDeleteStudentsHandler: BulkPermanentDeleteStudentsHandler,
    private readonly listStudentDocumentsHandler: ListStudentDocumentsHandler,
    private readonly createStudentDocumentHandler: CreateStudentDocumentHandler,
    private readonly updateStudentDocumentHandler: UpdateStudentDocumentHandler,
    private readonly deleteStudentDocumentHandler: DeleteStudentDocumentHandler,
  ) {}

  @Post()
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  @ApiResponse({ status: 201, description: 'Student created' })
  async create(
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.createStudentHandler.execute(
      new CreateStudentCommand(
        dto.firstName,
        dto.branchId,
        dto.lastName,
        dto.email,
        dto.phone,
        dto.gender,
        dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        dto.addressLine1,
        dto.addressLine2,
        dto.city,
        dto.state,
        dto.country,
        dto.postalCode,
        dto.profileImageFileId,
        dto.qualification,
        dto.collegeName,
        dto.specialization,
        dto.passingYear,
        dto.parentName,
        dto.parentPhone,
        dto.emergencyContactName,
        dto.emergencyContactPhone,
        dto.admissionDate ? new Date(dto.admissionDate) : undefined,
        dto.notes,
        dto.status,
        user.sub,
      ),
    );

    return {
      success: true,
      message: 'Student created successfully',
      data: result,
    };
  }

  @Get()
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async list(
    @Query() query: ListStudentsQueryDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.listStudentsHandler.execute(
      new ListStudentsQuery(
        this.resolveBranchId(query.branchId, user),
        query.status,
        query.search,
        query.includeDeleted,
        query.onlyActive === true,
        query.skip,
        query.take,
      ),
    );

    return {
      success: true,
      message: 'Students fetched successfully',
      data: {
        items: result.items,
        count: result.count,
      },
    };
  }

  @Get('suggest-code')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async suggestCode() {
    const result = await this.suggestStudentCodeHandler.execute(
      new SuggestStudentCodeQuery(),
    );

    return {
      success: true,
      message: 'Student code suggested successfully',
      data: result,
    };
  }

  @Patch('bulk/status')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateStudentStatusDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.bulkUpdateStudentStatusHandler.execute(
      new BulkUpdateStudentStatusCommand(
        dto.studentIds,
        dto.isActive,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student statuses updated successfully',
      data: result.summary,
    };
  }

  @Patch('bulk/activate')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async bulkActivate(
    @Body() dto: BulkStudentIdsDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.bulkUpdateStudentStatusHandler.execute(
      new BulkUpdateStudentStatusCommand(
        dto.studentIds,
        true,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student statuses updated successfully',
      data: result.summary,
    };
  }

  @Patch('bulk/deactivate')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async bulkDeactivate(
    @Body() dto: BulkStudentIdsDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.bulkUpdateStudentStatusHandler.execute(
      new BulkUpdateStudentStatusCommand(
        dto.studentIds,
        false,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student statuses updated successfully',
      data: result.summary,
    };
  }

  @Patch('bulk/restore')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async bulkRestore(
    @Body() dto: BulkStudentIdsDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.bulkRestoreStudentsHandler.execute(
      new BulkRestoreStudentsCommand(
        dto.studentIds,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Students restored successfully',
      data: result.summary,
    };
  }

  @Delete('bulk')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async bulkDelete(
    @Body() dto: BulkStudentIdsDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.bulkDeleteStudentsHandler.execute(
      new BulkDeleteStudentsCommand(
        dto.studentIds,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Students archived successfully',
      data: result.summary,
    };
  }

  @Delete('bulk/permanent')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async bulkPermanentDelete(@Body() dto: BulkStudentIdsDto) {
    const result =
      await this.bulkPermanentDeleteStudentsHandler.execute(
        new BulkPermanentDeleteStudentsCommand(dto.studentIds),
      );

    return {
      success: true,
      message: 'Students permanently deleted successfully',
      data: result.summary,
    };
  }

  @Get(':id')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async get(
    @Param('id') id: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.getStudentHandler.execute(
      new GetStudentQuery(
        id,
        true,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student fetched successfully',
      data: result,
    };
  }

  @Get(':id/documents')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async listDocuments(
    @Param('id') id: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.listStudentDocumentsHandler.execute(
      new ListStudentDocumentsQuery(
        id,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student documents fetched successfully',
      data: result,
    };
  }

  @Post(':id/documents')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async createDocument(
    @Param('id') id: string,
    @Body() dto: CreateStudentDocumentDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.createStudentDocumentHandler.execute(
      new CreateStudentDocumentCommand(
        id,
        dto.name,
        dto.type,
        dto.fileId,
        dto.description,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student document uploaded successfully',
      data: result,
    };
  }

  @Patch(':id/documents/:documentId')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async updateDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateStudentDocumentDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.updateStudentDocumentHandler.execute(
      new UpdateStudentDocumentCommand(
        id,
        documentId,
        dto.name,
        dto.type,
        dto.fileId,
        dto.description,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student document updated successfully',
      data: result,
    };
  }

  @Delete(':id/documents/:documentId')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async deleteDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.deleteStudentDocumentHandler.execute(
      new DeleteStudentDocumentCommand(
        id,
        documentId,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student document deleted successfully',
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
    BranchAccessGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.updateStudentHandler.execute(
      new UpdateStudentCommand(
        id,
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.phone,
        dto.gender,
        dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        dto.addressLine1,
        dto.addressLine2,
        dto.city,
        dto.state,
        dto.country,
        dto.postalCode,
        dto.profileImageFileId,
        dto.qualification,
        dto.collegeName,
        dto.specialization,
        dto.passingYear,
        dto.parentName,
        dto.parentPhone,
        dto.emergencyContactName,
        dto.emergencyContactPhone,
        dto.studentCode,
        dto.admissionDate ? new Date(dto.admissionDate) : undefined,
        dto.branchId,
        dto.notes,
        dto.status,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.deleteStudentHandler.execute(
      new DeleteStudentCommand(
        id,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student deleted successfully',
      data: result,
    };
  }

  @Patch(':id/restore')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result = await this.restoreStudentHandler.execute(
      new RestoreStudentCommand(
        id,
        user.sub,
        this.resolveBranchId(undefined, user),
      ),
    );

    return {
      success: true,
      message: 'Student restored successfully',
      data: result,
    };
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async permanentDelete(
    @Param('id') id: string,
    @CurrentUser() _user: AuthUser,
  ) {
    const result =
      await this.permanentDeleteStudentHandler.execute(
        new PermanentDeleteStudentCommand(id),
      );

    return {
      success: true,
      message: 'Student permanently deleted successfully',
      data: result,
    };
  }

  @Patch(':id/activate')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result =
      await this.updateStudentStatusHandler.execute(
        new UpdateStudentStatusCommand(
          id,
          true,
          user.sub,
          this.resolveBranchId(undefined, user),
        ),
      );

    return {
      success: true,
      message: 'Student activated successfully',
      data: result,
    };
  }

  @Patch(':id/deactivate')
  @UseGuards(
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,
  )
  @Roles(BranchUserRole.BRANCH_MANAGER, BranchUserRole.STAFF)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: StudentAdminUser,
  ) {
    const result =
      await this.updateStudentStatusHandler.execute(
        new UpdateStudentStatusCommand(
          id,
          false,
          user.sub,
          this.resolveBranchId(undefined, user),
        ),
      );

    return {
      success: true,
      message: 'Student deactivated successfully',
      data: result,
    };
  }

  private resolveBranchId(
    requestedBranchId: string | undefined,
    user: StudentAdminUser,
  ): string | undefined {
    if (user.role === 'ADMIN') {
      return requestedBranchId;
    }

    return requestedBranchId ?? user.branchId;
  }
}
