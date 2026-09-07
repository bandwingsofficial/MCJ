import type { Prisma } from '@prisma/client';
import { CourseMode as PrismaCourseMode, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';
import type {
  BatchTemplateRecord,
  BatchTemplateRepository,
  CreateBatchTemplateInput,
  ListBatchTemplatesParams,
  ListBatchTemplatesResult,
  UpdateBatchTemplateInput,
} from '../../domain/repositories/batch-template.repository';

function mapRecord(row: {
  id: string;
  name: string;
  mode: PrismaCourseMode;
  daysOfWeek: PrismaDayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  hasFixedTime: boolean;
  capacity: number;
  isActive: boolean;
  displayOrder: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}): BatchTemplateRecord {
  return {
    id: row.id,
    name: row.name,
    mode: row.mode as CourseMode,
    daysOfWeek: row.daysOfWeek as DayOfWeek[],
    startTime: row.startTime,
    endTime: row.endTime,
    hasFixedTime: row.hasFixedTime,
    capacity: row.capacity,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    isDeleted: row.isDeleted,
    deletedAt: row.deletedAt,
    deletedBy: row.deletedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function buildWhere(
  params?: ListBatchTemplatesParams,
): Prisma.BatchTemplateWhereInput {
  const where: Prisma.BatchTemplateWhereInput = {};

  if (params?.isDeleted === true) {
    where.isDeleted = true;
  } else if (params?.includeDeleted) {
    // no isDeleted filter
  } else {
    where.isDeleted = false;
  }

  if (params?.isActive !== undefined && params?.isDeleted !== true) {
    where.isActive = params.isActive;
  }

  if (params?.mode) {
    where.mode = params.mode as PrismaCourseMode;
  }

  const search = params?.search?.trim();
  if (search) {
    const upper = search.toUpperCase();
    const modeMatches: PrismaCourseMode[] = [];
    if ('ONLINE'.includes(upper) || upper.includes('ONL')) {
      modeMatches.push('ONLINE');
    }
    if (
      'OFFLINE'.includes(upper) ||
      'CLASSROOM'.includes(upper) ||
      upper.includes('OFF')
    ) {
      modeMatches.push('OFFLINE');
    }
    if (
      'RECORDED'.includes(upper) ||
      upper.includes('SELF') ||
      upper.includes('PACED') ||
      upper.includes('PRE')
    ) {
      modeMatches.push('RECORDED');
    }

    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { startTime: { contains: search, mode: 'insensitive' } },
      { endTime: { contains: search, mode: 'insensitive' } },
      ...(modeMatches.length
        ? [{ mode: { in: [...new Set(modeMatches)] } }]
        : []),
    ];
  }

  return where;
}

export class PrismaBatchTemplateRepository
  implements BatchTemplateRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<BatchTemplateRecord | null> {
    const row = await this.prisma.batchTemplate.findUnique({
      where: { id },
    });
    return row ? mapRecord(row) : null;
  }

  async findByIds(ids: string[]): Promise<BatchTemplateRecord[]> {
    if (!ids.length) {
      return [];
    }

    const rows = await this.prisma.batchTemplate.findMany({
      where: { id: { in: ids } },
    });

    const byId = new Map(rows.map((row) => [row.id, mapRecord(row)]));
    return ids
      .map((id) => byId.get(id))
      .filter((row): row is BatchTemplateRecord => Boolean(row));
  }

  async list(
    params?: ListBatchTemplatesParams,
  ): Promise<ListBatchTemplatesResult> {
    const where = buildWhere(params);
    const skip = params?.skip ?? 0;
    const take = params?.take;

    const [catalogTotal, total, rows] = await Promise.all([
      // Total Batch Timings includes archived (Categories-style catalog count)
      this.prisma.batchTemplate.count(),
      this.prisma.batchTemplate.count({ where }),
      this.prisma.batchTemplate.findMany({
        where,
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'asc' },
        ],
        skip,
        ...(take !== undefined ? { take } : {}),
      }),
    ]);

    return {
      items: rows.map(mapRecord),
      total,
      catalogTotal,
    };
  }

  async create(
    input: CreateBatchTemplateInput,
  ): Promise<BatchTemplateRecord> {
    const maxOrder = await this.getMaxDisplayOrder();
    const row = await this.prisma.batchTemplate.create({
      data: {
        name: input.name.trim(),
        mode: input.mode as PrismaCourseMode,
        daysOfWeek: input.daysOfWeek as PrismaDayOfWeek[],
        startTime: input.startTime,
        endTime: input.endTime,
        hasFixedTime: input.hasFixedTime,
        capacity: input.capacity,
        isActive: input.isActive ?? true,
        displayOrder: maxOrder + 1,
        createdBy: input.createdBy ?? null,
      },
    });
    return mapRecord(row);
  }

  async update(
    id: string,
    input: UpdateBatchTemplateInput,
  ): Promise<BatchTemplateRecord> {
    const data: Prisma.BatchTemplateUpdateInput = {};

    if (input.name !== undefined) data.name = input.name.trim();
    if (input.mode !== undefined) data.mode = input.mode as PrismaCourseMode;
    if (input.daysOfWeek !== undefined) {
      data.daysOfWeek = input.daysOfWeek as PrismaDayOfWeek[];
    }
    if (input.startTime !== undefined) data.startTime = input.startTime;
    if (input.endTime !== undefined) data.endTime = input.endTime;
    if (input.hasFixedTime !== undefined) data.hasFixedTime = input.hasFixedTime;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.updatedBy !== undefined) data.updatedBy = input.updatedBy;

    const row = await this.prisma.batchTemplate.update({
      where: { id },
      data,
    });

    return mapRecord(row);
  }

  async softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<BatchTemplateRecord> {
    const row = await this.prisma.batchTemplate.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy ?? null,
      },
    });
    return mapRecord(row);
  }

  async restore(
    id: string,
    updatedBy?: string,
  ): Promise<BatchTemplateRecord> {
    const row = await this.prisma.batchTemplate.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        isActive: true,
        updatedBy: updatedBy ?? null,
      },
    });
    return mapRecord(row);
  }

  async permanentDelete(id: string): Promise<void> {
    await this.prisma.batchTemplate.delete({ where: { id } });
  }

  async softDeleteMany(ids: string[], deletedBy?: string): Promise<number> {
    if (!ids.length) return 0;
    const result = await this.prisma.batchTemplate.updateMany({
      where: { id: { in: ids }, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy ?? null,
      },
    });
    return result.count;
  }

  async restoreMany(ids: string[], updatedBy?: string): Promise<number> {
    if (!ids.length) return 0;
    const result = await this.prisma.batchTemplate.updateMany({
      where: { id: { in: ids }, isDeleted: true },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        isActive: true,
        updatedBy: updatedBy ?? null,
      },
    });
    return result.count;
  }

  async permanentDeleteMany(ids: string[]): Promise<number> {
    if (!ids.length) return 0;
    const result = await this.prisma.batchTemplate.deleteMany({
      where: { id: { in: ids }, isDeleted: true },
    });
    return result.count;
  }

  async setActiveMany(ids: string[], isActive: boolean): Promise<number> {
    if (!ids.length) return 0;
    const result = await this.prisma.batchTemplate.updateMany({
      where: { id: { in: ids }, isDeleted: false },
      data: { isActive },
    });
    return result.count;
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.batchTemplate.aggregate({
      _max: { displayOrder: true },
      where: { isDeleted: false },
    });
    return result._max.displayOrder ?? 0;
  }
}
