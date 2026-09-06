import type { Prisma } from '@prisma/client';
import { CourseMode as PrismaCourseMode, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';
import type {
  BatchTemplateRecord,
  BatchTemplateRepository,
  CreateBatchTemplateInput,
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
  isActive: boolean;
  displayOrder: number | null;
  createdBy: string | null;
  updatedBy: string | null;
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
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
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

  async list(params?: {
    isActive?: boolean;
  }): Promise<BatchTemplateRecord[]> {
    const where: Prisma.BatchTemplateWhereInput = {};
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const rows = await this.prisma.batchTemplate.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return rows.map(mapRecord);
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

    if (input.name !== undefined) {
      data.name = input.name.trim();
    }
    if (input.mode !== undefined) {
      data.mode = input.mode as PrismaCourseMode;
    }
    if (input.daysOfWeek !== undefined) {
      data.daysOfWeek = input.daysOfWeek as PrismaDayOfWeek[];
    }
    if (input.startTime !== undefined) {
      data.startTime = input.startTime;
    }
    if (input.endTime !== undefined) {
      data.endTime = input.endTime;
    }
    if (input.hasFixedTime !== undefined) {
      data.hasFixedTime = input.hasFixedTime;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }
    if (input.updatedBy !== undefined) {
      data.updatedBy = input.updatedBy;
    }

    const row = await this.prisma.batchTemplate.update({
      where: { id },
      data,
    });

    return mapRecord(row);
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.batchTemplate.aggregate({
      _max: { displayOrder: true },
    });
    return result._max.displayOrder ?? 0;
  }
}
