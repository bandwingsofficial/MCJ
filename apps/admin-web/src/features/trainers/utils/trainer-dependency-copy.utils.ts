export type TrainerDependencySummary = {
  canDelete: boolean;
  canDeactivate: boolean;
  branchAssignmentCount: number;
  blockingBranchNames: string[];
};

function formatBranchBlockMessage(
  branchNames: string[],
  branchCount: number,
  action: "delete" | "deactivate",
): string {
  const verb = action === "delete" ? "deleting" : "deactivating";
  const names = branchNames.filter(Boolean);

  if (names.length > 0) {
    return [
      "This trainer is currently assigned to:",
      ...names.map((name) => `• ${name}`),
      `Remove the trainer from these branches before ${verb}.`,
    ].join("\n");
  }

  return `This trainer is assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}. Remove the trainer from those branches before ${verb}.`;
}

export function buildTrainerDeactivateDescription(
  summary: TrainerDependencySummary | null,
  loading: boolean,
): string {
  if (loading) {
    return "Checking branch assignments...";
  }

  if (!summary) {
    return "Unable to verify branch assignments. Please try again.";
  }

  if (!summary.canDeactivate) {
    return formatBranchBlockMessage(
      summary.blockingBranchNames,
      summary.branchAssignmentCount,
      "deactivate",
    );
  }

  return "This trainer will become inactive and hidden from active trainer lists.\n\nDo you want to continue?";
}

export function buildTrainerDeleteDescription(
  summary: TrainerDependencySummary | null,
  loading: boolean,
): string {
  if (loading) {
    return "Checking branch assignments...";
  }

  if (!summary) {
    return "Unable to verify branch assignments. Please try again.";
  }

  if (!summary.canDelete) {
    return formatBranchBlockMessage(
      summary.blockingBranchNames,
      summary.branchAssignmentCount,
      "delete",
    );
  }

  return "Archive this trainer? They will be removed from the normal listing and can be restored later.";
}

export function buildTrainerPermanentDeleteDescription(
  summary: TrainerDependencySummary | null,
  loading: boolean,
): string {
  if (loading) {
    return "Checking branch assignments...";
  }

  if (!summary) {
    return "Unable to verify branch assignments. Please try again.";
  }

  if (!summary.canDelete) {
    return formatBranchBlockMessage(
      summary.blockingBranchNames,
      summary.branchAssignmentCount,
      "delete",
    );
  }

  return "This action cannot be undone.\n\nAre you sure you want to permanently delete this trainer?";
}
