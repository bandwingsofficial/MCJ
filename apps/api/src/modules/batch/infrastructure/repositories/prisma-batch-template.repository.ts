import type { Prisma } from '@prisma/client';
import { CourseMode as PrismaCourseMode, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { getBatchLifecycleBlockReason } from '../../domain/utils/batch-template-lifecycle-block.util';
import { resolveBatchApiStatus } from '../../domain/utils/batch-lifecycle-status.util';
import type {
  BatchTemplateLifecycleBlockRecord,
  BatchTemplateLinkedBatchLifecycle,
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

    if (params?.linkedBatchLifecycle) {
      const templateIds = await this.findTemplateIdsByLinkedBatchLifecycle(
        params.linkedBatchLifecycle,
      );

      where.id = { in: templateIds.length ? templateIds : ['__none__'] };
    }
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

  async findLifecycleBlocksByTemplateIds(
    templateIds: string[],
  ): Promise<Record<string, BatchTemplateLifecycleBlockRecord[]>> {
    const result: Record<string, BatchTemplateLifecycleBlockRecord[]> =
      {};

    for (const id of templateIds) {
      result[id] = [];
    }

    if (!templateIds.length) {
      return result;
    }

    const batchSelect = {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      isDeleted: true,
      batchTemplateId: true,
    } as const;

    const [linkedBatches, linkedTimings] = await Promise.all([
      this.prisma.batch.findMany({
        where: {
          batchTemplateId: { in: templateIds },
          isDeleted: false,
        },
        select: batchSelect,
      }),
      this.prisma.batchTiming.findMany({
        where: {
          batchTemplateId: { in: templateIds },
          isDeleted: false,
          batch: { isDeleted: false },
        },
        select: {
          batchTemplateId: true,
          status: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          isDeleted: true,
          batch: { select: batchSelect },
        },
      }),
    ]);

    type BatchShape = {
      id: string;
      name: string;
      status: string;
      startDate: Date;
      endDate: Date | null;
      startTime: string;
      endTime: string;
      isDeleted: boolean;
    };

    const toBatchSource = (batch: BatchShape) => ({
      id: batch.id,
      name: batch.name,
      status: batch.status as BatchStatus,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      isDeleted: batch.isDeleted,
    });

    const appendBlock = (
      templateId: string | null | undefined,
      batch: BatchShape,
      lifecycleStatus: 'UPCOMING' | 'ONGOING' | null,
    ) => {
      if (!templateId || !result[templateId] || !lifecycleStatus) {
        return;
      }

      const blocks = result[templateId]!;
      const existing = blocks.find((entry) => entry.batchId === batch.id);

      if (existing) {
        if (lifecycleStatus === 'ONGOING') {
          existing.lifecycleStatus = 'ONGOING';
        }

        return;
      }

      blocks.push({
        batchId: batch.id,
        batchName: batch.name,
        lifecycleStatus,
      });
    };

    for (const batch of linkedBatches) {
      appendBlock(
        batch.batchTemplateId,
        batch,
        getBatchLifecycleBlockReason(toBatchSource(batch)),
      );
    }

    for (const timing of linkedTimings) {
      const parent = timing.batch;
      appendBlock(
        timing.batchTemplateId,
        parent,
        getBatchLifecycleBlockReason(toBatchSource(parent)),
      );
    }

    return result;
  }

  async findPrimaryLinkedBatchLifecycleByTemplateIds(
    templateIds: string[],
  ): Promise<Record<string, BatchTemplateLinkedBatchLifecycle | null>> {
    const result: Record<string, BatchTemplateLinkedBatchLifecycle | null> =
      {};

    for (const id of templateIds) {
      result[id] = null;
    }

    if (!templateIds.length) {
      return result;
    }

    const templateIdSet = new Set(templateIds);
    const links = await this.findTemplateBatchLinks();
    const now = new Date();
    const priority: Record<BatchTemplateLinkedBatchLifecycle, number> = {
      ONGOING: 3,
      UPCOMING: 2,
      EXPIRED: 1,
    };

    const toLifecycle = (
      resolved: BatchStatus,
    ): BatchTemplateLinkedBatchLifecycle | null => {
      if (
        resolved === BatchStatus.EXPIRED ||
        resolved === BatchStatus.CANCELLED
      ) {
        return 'EXPIRED';
      }

      if (resolved === BatchStatus.ONGOING) {
        return 'ONGOING';
      }

      if (resolved === BatchStatus.UPCOMING) {
        return 'UPCOMING';
      }

      return null;
    };

    for (const link of links) {
      if (!templateIdSet.has(link.templateId)) {
        continue;
      }

      const resolved = resolveBatchApiStatus({
        storedStatus: link.batch.status,
        isDeleted: link.batch.isDeleted,
        startDate: link.batch.startDate,
        startTime: link.batch.startTime,
        endDate: link.batch.endDate,
        endTime: link.batch.endTime,
        now,
      });
      const lifecycle = toLifecycle(resolved);

      if (!lifecycle) {
        continue;
      }

      const current = result[link.templateId];

      if (!current || priority[lifecycle] > priority[current]) {
        result[link.templateId] = lifecycle;
      }
    }

    return result;
  }

  async findTemplateIdsByLinkedBatchLifecycle(
    lifecycle: 'UPCOMING' | 'ONGOING' | 'EXPIRED',
  ): Promise<string[]> {
    const links = await this.findTemplateBatchLinks();
    const now = new Date();
    const matching = new Set<string>();

    for (const link of links) {
      const resolved = resolveBatchApiStatus({
        storedStatus: link.batch.status,
        isDeleted: link.batch.isDeleted,
        startDate: link.batch.startDate,
        startTime: link.batch.startTime,
        endDate: link.batch.endDate,
        endTime: link.batch.endTime,
        now,
      });

      const matchesTab =
        lifecycle === 'EXPIRED'
          ? resolved === BatchStatus.EXPIRED ||
            resolved === BatchStatus.CANCELLED
          : resolved === lifecycle;

      if (matchesTab) {
        matching.add(link.templateId);
      }
    }

    return [...matching];
  }

  private async findTemplateBatchLinks(): Promise<
    {
      templateId: string;
      batch: {
        id: string;
        status: BatchStatus;
        startDate: Date;
        endDate: Date | null;
        startTime: string;
        endTime: string;
        isDeleted: boolean;
      };
    }[]
  > {
    const batchSelect = {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      isDeleted: true,
    } as const;

    const [directLinks, timingLinks] = await Promise.all([
      this.prisma.batch.findMany({
        where: {
          isDeleted: false,
          batchTemplateId: { not: null },
        },
        select: {
          batchTemplateId: true,
          ...batchSelect,
        },
      }),
      this.prisma.batchTiming.findMany({
        where: {
          isDeleted: false,
          batchTemplateId: { not: null },
          batch: { isDeleted: false },
        },
        select: {
          batchTemplateId: true,
          batch: { select: batchSelect },
        },
      }),
    ]);

    const links: {
      templateId: string;
      batch: {
        id: string;
        status: BatchStatus;
        startDate: Date;
        endDate: Date | null;
        startTime: string;
        endTime: string;
        isDeleted: boolean;
      };
    }[] = [];

    for (const row of directLinks) {
      if (!row.batchTemplateId) {
        continue;
      }

      links.push({
        templateId: row.batchTemplateId,
        batch: {
          id: row.id,
          status: row.status as BatchStatus,
          startDate: row.startDate,
          endDate: row.endDate,
          startTime: row.startTime,
          endTime: row.endTime,
          isDeleted: row.isDeleted,
        },
      });
    }

    for (const row of timingLinks) {
      if (!row.batchTemplateId) {
        continue;
      }

      links.push({
        templateId: row.batchTemplateId,
        batch: {
          id: row.batch.id,
          status: row.batch.status as BatchStatus,
          startDate: row.batch.startDate,
          endDate: row.batch.endDate,
          startTime: row.batch.startTime,
          endTime: row.batch.endTime,
          isDeleted: row.batch.isDeleted,
        },
      });
    }

    return links;
  }
}
