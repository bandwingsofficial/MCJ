import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

export type TrainerDependencySummary = {
  canDelete: boolean;
  canDeactivate: boolean;
  branchAssignmentCount: number;
  blockingBranchNames: string[];
};

export type TrainerDependencyApiData = {
  canDelete: boolean;
  canDeactivate: boolean;
  branchAssignmentCount: number;
  blockingBranchNames?: string[];
};

export function parseTrainerDependencySummary(
  data: TrainerDependencyApiData,
): TrainerDependencySummary {
  return {
    canDelete: data.canDelete,
    canDeactivate: data.canDeactivate,
    branchAssignmentCount: data.branchAssignmentCount,
    blockingBranchNames: data.blockingBranchNames ?? [],
  };
}

export function isTrainerDeactivateAllowed(
  summary: TrainerDependencySummary | null,
): boolean {
  return summary?.canDeactivate === true;
}

export function isTrainerDeleteAllowed(
  summary: TrainerDependencySummary | null,
): boolean {
  return summary?.canDelete === true;
}

function formatBranchList(branchNames: string[], branchCount: number): string {
  const names = branchNames.filter(Boolean);

  if (names.length > 0) {
    return names.map((name) => `- ${name}`).join("\n");
  }

  if (branchCount === 1) {
    return "- 1 branch";
  }

  return `- ${branchCount} branches`;
}

function formatSingleBranchBlockMessage(
  branchNames: string[],
  branchCount: number,
  action: "delete" | "deactivate",
): string {
  const lead =
    action === "delete"
      ? "This trainer cannot be deleted because they are assigned to the following branch(es):"
      : "This trainer cannot be deactivated because they are assigned to the following branch(es):";

  return [lead, "", formatBranchList(branchNames, branchCount)].join("\n");
}

export function buildTrainerDeactivateDescription(
  summary: TrainerDependencySummary | null,
): string {
  if (!summary) {
    return "Unable to verify branch assignments. Please try again.";
  }

  if (!summary.canDeactivate) {
    return formatSingleBranchBlockMessage(
      summary.blockingBranchNames,
      summary.branchAssignmentCount,
      "deactivate",
    );
  }

  return "This trainer will become inactive and hidden from active trainer lists.\n\nDo you want to continue?";
}

export function buildTrainerDeleteDescription(
  summary: TrainerDependencySummary | null,
): string {
  if (!summary) {
    return "Unable to verify branch assignments. Please try again.";
  }

  if (!summary.canDelete) {
    return formatSingleBranchBlockMessage(
      summary.blockingBranchNames,
      summary.branchAssignmentCount,
      "delete",
    );
  }

  return "Archive this trainer? They will be removed from the normal listing and can be restored later.";
}

export function buildTrainerPermanentDeleteDescription(): string {
  return "This action cannot be undone.\n\nAre you sure you want to permanently delete this trainer?";
}

export type BulkTrainerBranchBlock = {
  trainerName: string;
  branchNames: string[];
};

export type LoadTrainerDependencySummary = (
  trainerId: string,
) => Promise<TrainerDependencySummary>;

export async function collectBulkBranchBlocks(
  trainers: TrainerListItem[],
  trainerIds: string[],
  loadSummary: LoadTrainerDependencySummary,
  mode: "deactivate" | "delete",
): Promise<BulkTrainerBranchBlock[]> {
  const byId = new Map(trainers.map((trainer) => [trainer.id, trainer]));

  const blocks = (
    await Promise.all(
      trainerIds.map(async (trainerId) => {
        const summary = await loadSummary(trainerId);
        const allowed =
          mode === "deactivate"
            ? isTrainerDeactivateAllowed(summary)
            : isTrainerDeleteAllowed(summary);

        if (allowed) {
          return null;
        }

        const trainer = byId.get(trainerId);
        const trainerName = trainer
          ? [trainer.firstName, trainer.lastName].filter(Boolean).join(" ")
          : "Unknown trainer";
        const branchNames = summary.blockingBranchNames.filter(Boolean);

        return {
          trainerName: trainerName || "Unknown trainer",
          branchNames:
            branchNames.length > 0
              ? branchNames
              : summary.branchAssignmentCount > 0
                ? [`${summary.branchAssignmentCount} branch assignment(s)`]
                : [],
        } satisfies BulkTrainerBranchBlock;
      }),
    )
  ).filter((entry): entry is BulkTrainerBranchBlock => entry !== null);

  blocks.sort((left, right) =>
    left.trainerName.localeCompare(right.trainerName),
  );

  return blocks;
}

function formatBulkBranchBlockedBody(
  entries: BulkTrainerBranchBlock[],
  action: "deactivate" | "delete",
): string {
  const intro =
    action === "deactivate"
      ? "Cannot deactivate the selected trainers because they are assigned to branches:"
      : "Cannot delete the selected trainers because they are assigned to branches:";

  const lines = entries.flatMap((entry) => {
    const trainerLine = entry.trainerName;
    if (entry.branchNames.length === 0) {
      return [trainerLine];
    }

    return [
      trainerLine,
      ...entry.branchNames.map((branch) => `- ${branch}`),
      "",
    ];
  });

  return [intro, "", ...lines].join("\n").trimEnd();
}

export function buildBulkTrainerDeactivateBlockedDescription(
  entries: BulkTrainerBranchBlock[],
): string {
  return formatBulkBranchBlockedBody(entries, "deactivate");
}

export function buildBulkTrainerDeleteBlockedDescription(
  entries: BulkTrainerBranchBlock[],
): string {
  return formatBulkBranchBlockedBody(entries, "delete");
}

export function buildBulkTrainerDeactivateConfirmDescription(): string {
  return "Are you sure you want to deactivate the selected trainers?";
}

export function buildBulkTrainerDeleteConfirmDescription(): string {
  return "Are you sure you want to archive the selected trainers?";
}
