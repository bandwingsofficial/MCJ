import {
  formatCountdownLeft,
  formatRelativePast,
  formatTodayCountdownLabel,
  parsePersistedScheduleMs,
  resolveScheduledInterviewLifecycle,
} from "@mcj/shared-constants";

import type { InterviewItem } from "@/src/features/branch-ops/types";
import { formatInterviewResult } from "@/src/features/interviews/utils/interview-display.utils";

export function resolveInterviewWorkflowStatusLabel(
  interview: Pick<
    InterviewItem,
    "status" | "result" | "scheduledAt" | "durationMinutes" | "scheduleLifecyclePhase"
  >,
  nowMs = Date.now(),
): string {
  const status = (interview.status ?? "").toUpperCase();
  const result = (interview.result ?? "").toUpperCase();
  const lifecycle =
    interview.scheduleLifecyclePhase ??
    resolveScheduledInterviewLifecycle({
      status: interview.status,
      result: interview.result,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      now: new Date(nowMs),
    }).phase;

  if (status === "CANCELLED") return "Cancelled";
  if (status === "NO_SHOW") return "No Show";

  if (status === "COMPLETED") {
    if (result === "SELECTED_FOR_NEXT_ROUND") return "Selected for Next Round";
    if (result === "ON_HOLD") return "On Hold";
    if (result === "NEED_FURTHER_REVIEW") return "Need Further Review";
    if (result === "REJECTED") return "Rejected";
    if (result === "PLACED") return "Placed";
    return "Completed";
  }

  if (status === "SCHEDULED") {
    if (lifecycle === "EXPIRED") return "Expired · Not Taken";
    if (lifecycle === "IN_PROGRESS") return "In Progress";
    if (lifecycle === "TODAY_UPCOMING") {
      const scheduledAtMs = parsePersistedScheduleMs(interview.scheduledAt);
      if (scheduledAtMs) {
        return formatTodayCountdownLabel(scheduledAtMs, nowMs) ?? "Today";
      }
      return "Today";
    }
    if (lifecycle === "UPCOMING") return "Upcoming";
  }

  if (status === "ASSIGNED") return "Not Scheduled";
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function getInterviewWhenLabel(
  interview: Pick<
    InterviewItem,
    "status" | "result" | "scheduledAt" | "durationMinutes" | "scheduleLifecyclePhase"
  >,
  nowMs = Date.now(),
): string {
  const status = (interview.status ?? "").toUpperCase();
  const lifecycle =
    interview.scheduleLifecyclePhase ??
    resolveScheduledInterviewLifecycle({
      status: interview.status,
      result: interview.result,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      now: new Date(nowMs),
    }).phase;
  const scheduledAtMs = parsePersistedScheduleMs(interview.scheduledAt);

  if (status === "COMPLETED" || status === "NO_SHOW") {
    return formatInterviewResult(interview.result);
  }

  if (status === "SCHEDULED" && scheduledAtMs) {
    if (lifecycle === "EXPIRED") {
      return `Expired · ${formatRelativePast(scheduledAtMs, nowMs)}`;
    }
    if (lifecycle === "IN_PROGRESS") {
      return "In progress now";
    }
    if (lifecycle === "TODAY_UPCOMING") {
      return formatTodayCountdownLabel(scheduledAtMs, nowMs) ?? "Today";
    }
    return formatCountdownLeft(scheduledAtMs, nowMs) ?? "—";
  }

  return "—";
}

export function getInterviewWorkflowStatusVariant(
  interview: Pick<
    InterviewItem,
    | "status"
    | "result"
    | "scheduledAt"
    | "durationMinutes"
    | "scheduleLifecyclePhase"
  >,
  nowMs = Date.now(),
): "success" | "warning" | "danger" | "info" | "default" {
  const label = resolveInterviewWorkflowStatusLabel(interview, nowMs);
  if (label === "Rejected") return "danger";
  if (label === "Placed" || label === "Selected for Next Round") return "success";
  if (label.startsWith("Expired")) return "warning";
  if (label === "In Progress" || label === "Upcoming" || label.startsWith("Today")) {
    return "info";
  }
  if (label === "On Hold" || label === "Need Further Review") return "warning";
  if (label === "Cancelled" || label === "No Show") return "danger";
  return "default";
}
