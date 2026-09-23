import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, TrainerStatus } from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import {
  BRANCH_MANAGER_CREATABLE_ROLES,
  canBranchManagerCreateRole,
  getDefaultPermissionsForRole,
} from '@modules/branch-user/domain/role-permissions';
import { CreateBranchUserCommand } from '@modules/branch-user/application/create-branch-user/create-branch-user.command';
import { CreateBranchUserHandler } from '@modules/branch-user/application/create-branch-user/create-branch-user.handler';
import { DeleteBranchUserCommand } from '@modules/branch-user/application/delete-branch-user/delete-branch-user.command';
import { DeleteBranchUserHandler } from '@modules/branch-user/application/delete-branch-user/delete-branch-user.handler';
import { ResetBranchUserPasswordCommand } from '@modules/branch-user/application/reset-branch-user-password/reset-branch-user-password.command';
import { ResetBranchUserPasswordHandler } from '@modules/branch-user/application/reset-branch-user-password/reset-branch-user-password.handler';
import { UpdateBranchUserCommand } from '@modules/branch-user/application/update-branch-user/update-branch-user.command';
import { UpdateBranchUserHandler } from '@modules/branch-user/application/update-branch-user/update-branch-user.handler';
import { UpdateBranchUserStatusCommand } from '@modules/branch-user/application/update-branch-user-status/update-branch-user-status.command';
import { UpdateBranchUserStatusHandler } from '@modules/branch-user/application/update-branch-user-status/update-branch-user-status.handler';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';

@Injectable()
export class BranchStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
    private readonly createHandler: CreateBranchUserHandler,
    private readonly updateHandler: UpdateBranchUserHandler,
    private readonly statusHandler: UpdateBranchUserStatusHandler,
    private readonly deleteHandler: DeleteBranchUserHandler,
    private readonly resetPasswordHandler: ResetBranchUserPasswordHandler,
  ) {}

  async list(
    user: BranchAuthUser,
    query: {
      role?: BranchUserRole;
      search?: string;
      status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
      skip?: number;
      take?: number;
    },
  ) {
    this.assertManager(user);

    if (query.role) {
      this.assertCreatableRole(query.role);
    }

    const skip = query.skip ?? 0;
    const take = Math.min(query.take ?? 10, 100);
    const search = query.search?.trim();

    const where: Prisma.BranchUserWhereInput = {
      branchId: user.branchId,
      isDeleted: false,
      role: query.role
        ? query.role
        : { in: BRANCH_MANAGER_CREATABLE_ROLES },
    };

    if (query.status === 'ACTIVE') {
      where.isActive = true;
    } else if (query.status === 'INACTIVE') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, count] = await Promise.all([
      this.prisma.branchUser.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          branchId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.branchUser.count({ where }),
    ]);

    return { items, count, skip, take };
  }

  async listTrainerAccountOptions(user: BranchAuthUser) {
    this.assertManager(user);

    const assignmentRows = await this.prisma.branchTrainer.findMany({
      where: { branchId: user.branchId },
      select: { trainerId: true },
      distinct: ['trainerId'],
    });

    const trainerIds = assignmentRows.map((row) => row.trainerId);
    if (!trainerIds.length) {
      return [];
    }

    const [trainers, branchUsers] = await Promise.all([
      this.prisma.trainer.findMany({
        where: {
          id: { in: trainerIds },
          isDeleted: false,
          status: TrainerStatus.ACTIVE,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          employeeCode: true,
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      this.prisma.branchUser.findMany({
        where: {
          branchId: user.branchId,
          isDeleted: false,
          role: { in: BRANCH_MANAGER_CREATABLE_ROLES },
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      }),
    ]);

    return trainers.map((trainer) => {
      const linkedBranchUser = this.findLinkedBranchUser(trainer, branchUsers);
      return {
        trainerId: trainer.id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        email: trainer.email,
        phone: trainer.phone,
        employeeCode: trainer.employeeCode,
        hasAccount: Boolean(linkedBranchUser),
        linkedBranchUserId: linkedBranchUser?.id ?? null,
        linkedBranchUserIsActive: linkedBranchUser?.isActive ?? null,
      };
    });
  }

  async create(
    user: BranchAuthUser,
    input: {
      trainerId?: string;
      firstName?: string;
      lastName?: string;
      email: string;
      phone?: string;
      password: string;
      role: string;
      confirmRestore?: boolean;
    },
  ) {
    this.assertManager(user);
    const role = this.assertCreatableRole(input.role);

    const identity = await this.resolveCreateIdentityFromTrainer(
      user.branchId,
      input,
    );

    const created = await this.createHandler.execute(
      new CreateBranchUserCommand(
        identity.firstName,
        identity.lastName,
        input.email,
        identity.phone,
        input.password,
        role,
        getDefaultPermissionsForRole(role),
        user.branchId,
        user.sub,
        input.confirmRestore ?? false,
        {
          requireSameBranchId: user.branchId,
          allowedExistingRoles: BRANCH_MANAGER_CREATABLE_ROLES,
        },
      ),
    );

    await this.access.log({
      user,
      action: created.restored
        ? 'BRANCH_USER_RESTORED_ON_CREATE'
        : 'BRANCH_USER_CREATED',
      resourceType: 'BranchUser',
      resourceId: created.id,
      metadata: { role },
    });

    return created;
  }

  async update(
    user: BranchAuthUser,
    id: string,
    input: {
      trainerId?: string;
      firstName?: string;
      lastName?: string | null;
      email?: string;
      phone?: string | null;
      role?: string;
    },
  ) {
    this.assertManager(user);
    await this.assertManagedStaff(user, id);

    const nextRole = input.role
      ? this.assertCreatableRole(input.role)
      : undefined;

    let firstName = input.firstName;
    let lastName = input.lastName;
    let phone = input.phone;

    if (input.trainerId) {
      const identity = await this.resolveUpdateIdentityFromTrainer(
        user.branchId,
        id,
        input.trainerId,
        input.phone ?? undefined,
      );
      firstName = identity.firstName;
      lastName = identity.lastName;
      phone = identity.phone;
    }

    return this.updateHandler.execute(
      new UpdateBranchUserCommand(
        id,
        firstName,
        lastName,
        input.email,
        phone,
        nextRole,
        nextRole
          ? getDefaultPermissionsForRole(nextRole)
          : undefined,
        user.branchId,
        user.sub,
      ),
    );
  }

  async resetPassword(user: BranchAuthUser, id: string, newPassword: string) {
    this.assertManager(user);
    await this.assertManagedStaff(user, id);

    const result = await this.resetPasswordHandler.execute(
      new ResetBranchUserPasswordCommand(id, newPassword, user.sub),
    );

    await this.access.log({
      user,
      action: 'BRANCH_USER_PASSWORD_RESET',
      resourceType: 'BranchUser',
      resourceId: id,
    });

    return result;
  }

  async setActive(user: BranchAuthUser, id: string, isActive: boolean) {
    this.assertManager(user);
    const target = await this.assertManagedStaff(user, id);

    if (target.isActive === isActive) {
      return target;
    }

    return this.statusHandler.execute(
      new UpdateBranchUserStatusCommand(id, isActive, user.sub),
    );
  }

  async remove(user: BranchAuthUser, id: string) {
    this.assertManager(user);
    await this.assertManagedStaff(user, id);

    const result = await this.deleteHandler.execute(
      new DeleteBranchUserCommand(id, user.sub),
    );

    await this.access.log({
      user,
      action: 'BRANCH_USER_SOFT_DELETED',
      resourceType: 'BranchUser',
      resourceId: id,
    });

    return result;
  }

  async rejectPermanentDelete() {
    throw new BaseException(
      ERROR_CODES.PERMISSION_DENIED,
      'You do not have permission to permanently delete this user.',
      403,
    );
  }

  private async assertManagedStaff(user: BranchAuthUser, id: string) {
    const target = await this.prisma.branchUser.findFirst({
      where: { id, isDeleted: false },
    });

    if (!target) {
      throw new BaseException(
        ERROR_CODES.BRANCH_USER_NOT_FOUND,
        'User not found.',
        404,
      );
    }

    if (target.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    this.assertCreatableRole(target.role);

    if (target.id === user.sub) {
      throw new ForbiddenException('You cannot modify your own account here');
    }

    return target;
  }

  private assertManager(user: BranchAuthUser) {
    if (!this.access.isManager(user)) {
      throw new ForbiddenException('Role access denied');
    }
  }

  private assertCreatableRole(role: string): BranchUserRole {
    if (!canBranchManagerCreateRole(role)) {
      throw new BaseException(
        ERROR_CODES.ROLE_ASSIGNMENT_DENIED,
        'You are not authorized to create or assign this role.',
        403,
      );
    }

    return role;
  }

  private findLinkedBranchUser<
    T extends {
      email: string;
      phone: string | null;
    },
  >(
    trainer: { email: string | null; phone: string | null },
    branchUsers: T[],
  ): T | null {
    const normalizedTrainerEmail = trainer.email?.trim().toLowerCase();

    for (const branchUser of branchUsers) {
      if (
        normalizedTrainerEmail &&
        branchUser.email.trim().toLowerCase() === normalizedTrainerEmail
      ) {
        return branchUser;
      }

      if (trainer.phone && branchUser.phone === trainer.phone) {
        return branchUser;
      }
    }

    return null;
  }

  private async resolveCreateIdentityFromTrainer(
    branchId: string,
    input: {
      trainerId?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ): Promise<{ firstName: string; lastName: string; phone: string }> {
    if (!input.trainerId) {
      if (!input.firstName?.trim() || !input.lastName?.trim() || !input.phone) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'First name, last name, and phone are required.',
          400,
        );
      }

      return {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
      };
    }

    const assigned = await this.prisma.branchTrainer.findFirst({
      where: { branchId, trainerId: input.trainerId },
      select: { trainerId: true },
    });

    if (!assigned) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Selected trainer is not assigned to this branch.',
        400,
        { field: 'trainerId' },
      );
    }

    const trainer = await this.prisma.trainer.findFirst({
      where: {
        id: input.trainerId,
        isDeleted: false,
        status: TrainerStatus.ACTIVE,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!trainer) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Selected trainer is not available.',
        400,
        { field: 'trainerId' },
      );
    }

    const branchUsers = await this.prisma.branchUser.findMany({
      where: {
        branchId,
        isDeleted: false,
        role: { in: BRANCH_MANAGER_CREATABLE_ROLES },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    const linked = this.findLinkedBranchUser(trainer, branchUsers);
    if (linked) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'This trainer already has a branch user account. Edit the existing user instead.',
        409,
        {
          field: 'trainerId',
          linkedBranchUserId: linked.id,
        },
      );
    }

    const phone = trainer.phone?.trim() || input.phone?.trim();
    if (!phone) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Trainer phone is required to create a user account.',
        400,
        { field: 'phone' },
      );
    }

    return {
      firstName: trainer.firstName.trim(),
      lastName: (trainer.lastName ?? '').trim() || 'Trainer',
      phone,
    };
  }

  private async resolveUpdateIdentityFromTrainer(
    branchId: string,
    branchUserId: string,
    trainerId: string,
    phoneInput?: string,
  ): Promise<{ firstName: string; lastName: string; phone: string }> {
    const assigned = await this.prisma.branchTrainer.findFirst({
      where: { branchId, trainerId },
      select: { trainerId: true },
    });

    if (!assigned) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Selected trainer is not assigned to this branch.',
        400,
        { field: 'trainerId' },
      );
    }

    const trainer = await this.prisma.trainer.findFirst({
      where: {
        id: trainerId,
        isDeleted: false,
        status: TrainerStatus.ACTIVE,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!trainer) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Selected trainer is not available.',
        400,
        { field: 'trainerId' },
      );
    }

    const branchUsers = await this.prisma.branchUser.findMany({
      where: {
        branchId,
        isDeleted: false,
        role: { in: BRANCH_MANAGER_CREATABLE_ROLES },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    const linked = this.findLinkedBranchUser(trainer, branchUsers);
    if (linked && linked.id !== branchUserId) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'This trainer already has a branch user account. Edit the existing user instead.',
        409,
        {
          field: 'trainerId',
          linkedBranchUserId: linked.id,
        },
      );
    }

    const phone = trainer.phone?.trim() || phoneInput?.trim();
    if (!phone) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Trainer phone is required to link this user account.',
        400,
        { field: 'phone' },
      );
    }

    return {
      firstName: trainer.firstName.trim(),
      lastName: (trainer.lastName ?? '').trim() || 'Trainer',
      phone,
    };
  }
}
