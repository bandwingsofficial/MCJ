import { BranchUserRole } from '../domain/enums/branch-user-role.enum';
import type { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export const INTERVIEWER_ROLE_REQUIRED_MESSAGE =
  'Selected user must have the INTERVIEWER role.';

export function eligibleBranchInterviewerWhere(branchId: string) {
  return {
    branchId,
    isDeleted: false,
    isActive: true,
    role: BranchUserRole.INTERVIEWER,
  } as const;
}

export async function countEligibleBranchInterviewersForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<number> {
  return prisma.branchUser.count({
    where: eligibleBranchInterviewerWhere(branchId),
  });
}

export async function findEligibleBranchInterviewerForBranch(
  prisma: PrismaService,
  branchId: string,
  interviewerId: string,
) {
  return prisma.branchUser.findFirst({
    where: {
      id: interviewerId,
      ...eligibleBranchInterviewerWhere(branchId),
    },
  });
}

export async function findBranchUserForInterviewerRoleValidation(
  prisma: PrismaService,
  branchId: string,
  interviewerId: string,
) {
  return prisma.branchUser.findFirst({
    where: {
      id: interviewerId,
      branchId,
      isDeleted: false,
      isActive: true,
    },
    select: { id: true, role: true },
  });
}
