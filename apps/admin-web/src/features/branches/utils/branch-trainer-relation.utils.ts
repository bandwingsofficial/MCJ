import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

export async function loadBranchAssignedTrainers(
  branchId: string,
): Promise<TrainerListItem[]> {
  if (!branchId) {
    return [];
  }

  const trainerMap = new Map<string, TrainerListItem>();
  let page = 1;

  while (true) {
    const response = await trainerService.getTrainers({
      branchId,
      status: "ACTIVE",
      isDeleted: false,
      includeDeleted: false,
      page,
      pageSize: 100,
    });

    const items = response.data.items ?? [];
    items.forEach((trainer) => {
      trainerMap.set(trainer.id, trainer);
    });

    if (items.length < 100) {
      break;
    }

    page += 1;
  }

  return Array.from(trainerMap.values());
}

export async function loadBranchAssignedTrainerIds(
  branchId: string,
): Promise<string[]> {
  const trainers = await loadBranchAssignedTrainers(branchId);
  return trainers.map((trainer) => trainer.id);
}

export function formatTrainerDisplayName(
  trainer: Pick<
    { firstName?: string | null; lastName?: string | null },
    "firstName" | "lastName"
  >,
): string {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim();
}

export function filterAssignedBranchTrainers(
  trainers: TrainerListItem[],
  search: string,
): TrainerListItem[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return trainers;
  }

  return trainers.filter((trainer) => {
    const haystack = [
      formatTrainerDisplayName(trainer),
      trainer.qualification ?? "",
      trainer.specialization ?? "",
      trainer.employeeCode ?? "",
      trainer.email ?? "",
      trainer.status,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
