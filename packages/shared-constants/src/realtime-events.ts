export const REALTIME_SOCKET_NAMESPACE = "/realtime";

export const REALTIME_EVENT = {
  DOMAIN_MUTATION: "domain.mutation",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENT)[keyof typeof REALTIME_EVENT];

export type RealtimeDomain = "batch" | "course" | "enrollment" | "student";

export type RealtimeDomainAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed";

export interface RealtimeDomainMutationPayload {
  domain: RealtimeDomain;
  action: RealtimeDomainAction;
  entityId: string;
  batchId?: string;
  courseId?: string;
  studentId?: string;
  branchId?: string;
}
