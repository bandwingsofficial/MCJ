import type { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export type LinkedTrainerDisplayRow = {
  firstName: string;
  lastName: string | null;
  linkedTrainerId: string;
};

export async function loadLinkedTrainerDisplayByBranchUserIds(
  prisma: PrismaService,
  branchUserIds: string[],
): Promise<Map<string, LinkedTrainerDisplayRow>> {
  const uniqueIds = [...new Set(branchUserIds.filter(Boolean))];
  if (!uniqueIds.length) {
    return new Map();
  }

  const branchUsers = await prisma.branchUser.findMany({
    where: {
      id: { in: uniqueIds },
      linkedTrainerId: { not: null },
      isDeleted: false,
    },
    select: {
      id: true,
      linkedTrainerId: true,
    },
  });

  if (!branchUsers.length) {
    return new Map();
  }

  const trainerIds = [
    ...new Set(
      branchUsers
        .map((row) => row.linkedTrainerId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const trainers = await prisma.trainer.findMany({
    where: {
      id: { in: trainerIds },
      isDeleted: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  const trainerById = new Map(trainers.map((trainer) => [trainer.id, trainer]));
  const result = new Map<string, LinkedTrainerDisplayRow>();

  for (const row of branchUsers) {
    const linkedTrainerId = row.linkedTrainerId;
    if (!linkedTrainerId) continue;
    const trainer = trainerById.get(linkedTrainerId);
    if (!trainer) continue;

    result.set(row.id, {
      linkedTrainerId: trainer.id,
      firstName: trainer.firstName.trim(),
      lastName: trainer.lastName?.trim() || null,
    });
  }

  return result;
}

export function applyLinkedTrainerDisplay<T extends {
  id: string;
  firstName: string;
  lastName: string | null;
}>(
  item: T,
  linkedByBranchUserId: Map<string, LinkedTrainerDisplayRow>,
): T & { linkedTrainerId?: string | null } {
  const linked = linkedByBranchUserId.get(item.id);
  if (!linked) {
    return item;
  }

  return {
    ...item,
    linkedTrainerId: linked.linkedTrainerId,
    firstName: linked.firstName,
    lastName: linked.lastName,
  };
}

export async function syncLinkedBranchUserNamesFromTrainer(
  prisma: PrismaService,
  trainerId: string,
): Promise<void> {
  const trainer = await prisma.trainer.findFirst({
    where: { id: trainerId, isDeleted: false },
    select: { firstName: true, lastName: true },
  });

  if (!trainer) {
    return;
  }

  await prisma.branchUser.updateMany({
    where: {
      linkedTrainerId: trainerId,
      isDeleted: false,
    },
    data: {
      firstName: trainer.firstName.trim(),
      lastName: trainer.lastName?.trim() || null,
    },
  });
}

export async function reconcileBranchUserNamesWithLinkedTrainer(
  prisma: PrismaService,
  branchUserId: string,
): Promise<LinkedTrainerDisplayRow | null> {
  const branchUser = await prisma.branchUser.findFirst({
    where: { id: branchUserId, isDeleted: false },
    select: {
      id: true,
      linkedTrainerId: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!branchUser?.linkedTrainerId) {
    return null;
  }

  const map = await loadLinkedTrainerDisplayByBranchUserIds(prisma, [
    branchUser.id,
  ]);
  const linked = map.get(branchUser.id);
  if (!linked) {
    return null;
  }

  const storedFirst = branchUser.firstName.trim();
  const storedLast = (branchUser.lastName ?? '').trim() || null;
  const linkedLast = linked.lastName?.trim() || null;

  if (storedFirst !== linked.firstName || storedLast !== linkedLast) {
    await prisma.branchUser.update({
      where: { id: branchUser.id },
      data: {
        firstName: linked.firstName,
        lastName: linkedLast,
      },
    });
  }

  return linked;
}
