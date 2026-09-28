import type { QueryClient } from "@tanstack/react-query";
import type { RealtimeDomainMutationPayload } from "@mcj/shared-constants";

import {
  emitRealtimeTopic,
  type RealtimeBusTopic,
} from "@/src/core/realtime/realtime-bus";

function topicsForPayload(
  payload: RealtimeDomainMutationPayload,
): RealtimeBusTopic[] {
  const topics = new Set<RealtimeBusTopic>();

  topics.add(payload.domain);

  if (payload.domain === "enrollment") {
    topics.add("student");
    topics.add("batch");
  }

  if (payload.domain === "batch") {
    topics.add("enrollment");
  }

  if (payload.domain === "course") {
    topics.add("batch");
  }

  return Array.from(topics);
}

export function handleDomainMutation(
  queryClient: QueryClient,
  payload: RealtimeDomainMutationPayload,
): void {
  if (
    payload.domain === "batch" ||
    payload.domain === "enrollment" ||
    payload.domain === "course"
  ) {
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  if (payload.domain === "course") {
    void queryClient.invalidateQueries({ queryKey: ["courses"] });
  }

  for (const topic of topicsForPayload(payload)) {
    emitRealtimeTopic(topic);
  }
}
