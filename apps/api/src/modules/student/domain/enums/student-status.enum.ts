export enum StudentStatus {
  LEAD = 'LEAD',
  ADVANCED = 'ADVANCED',
  ADMITTED = 'ADMITTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PLACED = 'PLACED',
  /** @deprecated Use CANCELLED — kept for legacy rows until migrated */
  DROPPED = 'DROPPED',
}