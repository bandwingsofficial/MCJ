export enum StudentStatus {
  LEAD = 'LEAD',
  ENROLLED = 'ENROLLED',
  JOINED = 'JOINED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PLACED = 'PLACED',
  /** @deprecated Use CANCELLED — kept for legacy rows until migrated */
  DROPPED = 'DROPPED',
}
