export interface ReorderDragResult<T> {
  nextItems: T[];
  newPosition: number;
}

/**
 * Reorder a list after drag-and-drop onto a target row.
 * Returns 1-based newPosition for the moved item.
 */
export function reorderByDrag<T extends { id: string }>(
  items: readonly T[],
  sourceId: string,
  targetId: string,
): ReorderDragResult<T> | null {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return null;
  }

  const nextItems = [...items];
  const [moved] = nextItems.splice(sourceIndex, 1);
  // Drop on target row: insert at the target's original index in the list
  // after the source row is removed (matches API rank reorder).
  const insertIndex = targetIndex;
  nextItems.splice(insertIndex, 0, moved);

  const finalIndex = nextItems.findIndex((item) => item.id === sourceId);
  if (finalIndex < 0) {
    return null;
  }

  return {
    nextItems,
    newPosition: finalIndex + 1,
  };
}

export function resolvePagedReorderPosition(
  newPositionInScope: number,
  orderOffset: number,
): number {
  return orderOffset + newPositionInScope;
}
