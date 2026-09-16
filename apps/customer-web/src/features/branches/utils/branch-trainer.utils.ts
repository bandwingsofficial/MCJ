import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { Trainer } from "@/src/features/trainers/types/trainer.types";

function isActiveTrainer(trainer: Trainer): boolean {
  return trainer.status === "ACTIVE" && !trainer.isDeleted;
}

export async function loadBranchAssignedTrainers(
  branchId: string,
): Promise<Trainer[]> {
  if (!branchId) {
    return [];
  }

  const trainerMap = new Map<string, Trainer>();
  let skip = 0;
  const take = 100;

  while (true) {
    const trainers = await trainerService.getTrainers({
      branchId,
      take,
      skip,
    });

    trainers.filter(isActiveTrainer).forEach((trainer) => {
      trainerMap.set(trainer.id, trainer);
    });

    if (trainers.length < take) {
      break;
    }

    skip += take;
  }

  return Array.from(trainerMap.values()).sort((left, right) =>
    `${left.firstName} ${left.lastName}`.localeCompare(
      `${right.firstName} ${right.lastName}`,
    ),
  );
}
