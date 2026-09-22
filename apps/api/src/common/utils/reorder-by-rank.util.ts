/**
 * Reorder siblings by 1-based rank and persist sequential displayOrder (1..N).
 */
export function reorderIdsByRank(
  orderedIds: string[],
  movedId: string,
  newPosition: number,
): string[] {
  const count = orderedIds.length;
  if (
    !Number.isInteger(newPosition) ||
    newPosition < 1 ||
    newPosition > count
  ) {
    throw new Error(
      `Position must be between 1 and ${count}`,
    );
  }

  const currentIndex = orderedIds.indexOf(movedId);
  if (currentIndex < 0) {
    throw new Error('Item is not in the reorder scope');
  }

  const currentPosition = currentIndex + 1;
  if (currentPosition === newPosition) {
    return orderedIds;
  }

  const next = [...orderedIds];
  next.splice(currentIndex, 1);
  next.splice(newPosition - 1, 0, movedId);
  return next;
}

export function validateReorderPosition(
  newPosition: number,
  siblingCount: number,
): void {
  if (
    !Number.isInteger(newPosition) ||
    newPosition < 1 ||
    newPosition > siblingCount
  ) {
    throw new Error(
      `Position must be between 1 and ${siblingCount}`,
    );
  }
}
