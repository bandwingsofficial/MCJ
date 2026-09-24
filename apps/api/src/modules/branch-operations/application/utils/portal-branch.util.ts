import type { Prisma } from '@prisma/client';

import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

export const PORTAL_BRANCH_SELECT = {
  id: true,
  branchName: true,
  branchCode: true,
  city: true,
  phone: true,
} satisfies Prisma.BranchSelect;

export type PortalBranchSnapshot = Prisma.BranchGetPayload<{
  select: typeof PORTAL_BRANCH_SELECT;
}>;

export async function findPortalBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<PortalBranchSnapshot | null> {
  return prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null },
    select: PORTAL_BRANCH_SELECT,
  });
}
