import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InterviewRoundStatus, Prisma } from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';

@Injectable()
export class BranchInterviewRoundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  private assertManager(user: BranchAuthUser) {
    if (!this.access.isManager(user)) {
      throw new BadRequestException(
        'Only branch managers can manage interview rounds',
      );
    }
  }

  private toDto(item: {
    id: string;
    name: string;
    description: string | null;
    sortOrder: number;
    status: InterviewRoundStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      sortOrder: item.sortOrder,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async list(
    _user: BranchAuthUser,
    query: {
      search?: string;
      status?: InterviewRoundStatus | 'ALL';
      skip?: number;
      take?: number;
    },
  ) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 20;
    const where: Prisma.InterviewRoundWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.interviewRound.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.interviewRound.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDto(item)),
      total,
    };
  }

  /** Active rounds for schedule dropdowns (any interview role). */
  async listActive(_user: BranchAuthUser) {
    const items = await this.prisma.interviewRound.findMany({
      where: { status: InterviewRoundStatus.ACTIVE },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return items.map((item) => this.toDto(item));
  }

  async getById(_user: BranchAuthUser, id: string) {
    const item = await this.prisma.interviewRound.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Interview round not found');
    }

    return this.toDto(item);
  }

  async create(
    user: BranchAuthUser,
    input: {
      name: string;
      description?: string;
      sortOrder: number;
      status?: InterviewRoundStatus;
    },
  ) {
    this.assertManager(user);

    const name = input.name.trim();
    if (!name) {
      throw new BadRequestException('Round name is required');
    }

    if (!Number.isFinite(input.sortOrder) || input.sortOrder < 1) {
      throw new BadRequestException('Round order must be at least 1');
    }

    const existing = await this.prisma.interviewRound.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new BadRequestException('A round with this name already exists');
    }

    const created = await this.prisma.interviewRound.create({
      data: {
        name,
        description: input.description?.trim() || null,
        sortOrder: Math.trunc(input.sortOrder),
        status: input.status ?? InterviewRoundStatus.ACTIVE,
        createdBy: user.sub,
        updatedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'INTERVIEW_ROUND_CREATED',
      resourceType: 'InterviewRound',
      resourceId: created.id,
      metadata: { name: created.name, sortOrder: created.sortOrder },
    });

    return this.toDto(created);
  }

  async update(
    user: BranchAuthUser,
    id: string,
    input: {
      name?: string;
      description?: string | null;
      sortOrder?: number;
      status?: InterviewRoundStatus;
    },
  ) {
    this.assertManager(user);

    const existing = await this.prisma.interviewRound.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Interview round not found');
    }

    const name = input.name?.trim();
    if (name !== undefined && !name) {
      throw new BadRequestException('Round name is required');
    }

    if (
      input.sortOrder !== undefined &&
      (!Number.isFinite(input.sortOrder) || input.sortOrder < 1)
    ) {
      throw new BadRequestException('Round order must be at least 1');
    }

    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      const clash = await this.prisma.interviewRound.findFirst({
        where: {
          id: { not: id },
          name: { equals: name, mode: 'insensitive' },
        },
      });
      if (clash) {
        throw new BadRequestException('A round with this name already exists');
      }
    }

    const updated = await this.prisma.interviewRound.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: Math.trunc(input.sortOrder) }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'INTERVIEW_ROUND_UPDATED',
      resourceType: 'InterviewRound',
      resourceId: updated.id,
      metadata: { name: updated.name, sortOrder: updated.sortOrder },
    });

    return this.toDto(updated);
  }

  async remove(user: BranchAuthUser, id: string) {
    this.assertManager(user);

    const existing = await this.prisma.interviewRound.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Interview round not found');
    }

    const inUse = await this.prisma.interview.count({
      where: { roundId: id },
    });

    if (inUse > 0) {
      throw new BadRequestException(
        'Cannot delete a round that is used by existing interviews. Set it inactive instead.',
      );
    }

    await this.prisma.interviewRound.delete({ where: { id } });

    await this.access.log({
      user,
      action: 'INTERVIEW_ROUND_DELETED',
      resourceType: 'InterviewRound',
      resourceId: id,
      metadata: { name: existing.name },
    });

    return { id };
  }
}
