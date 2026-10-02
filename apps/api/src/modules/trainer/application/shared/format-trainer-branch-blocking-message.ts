export function formatTrainerBranchBlockingMessage(
  branchNames: string[],
  branchCount: number,
  action: 'delete' | 'deactivate',
): string {
  const verb =
    action === 'delete' ? 'deleting' : 'deactivating';

  const names = branchNames.filter(Boolean);

  if (names.length > 0) {
    return [
      'This trainer is currently assigned to:',
      ...names.map((name) => `• ${name}`),
      `Remove the trainer from these branches before ${verb}.`,
    ].join('\n');
  }

  return `This trainer is assigned to ${branchCount} branch${branchCount === 1 ? '' : 'es'}. Remove the trainer from those branches before ${verb}.`;
}
