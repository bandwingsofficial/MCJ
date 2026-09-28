export type RealtimeBusTopic = "batch" | "course" | "enrollment" | "student";

type Listener = () => void;

const listeners = new Map<RealtimeBusTopic, Set<Listener>>();

export function subscribeRealtimeTopic(
  topic: RealtimeBusTopic,
  listener: Listener,
): () => void {
  const bucket = listeners.get(topic) ?? new Set<Listener>();
  bucket.add(listener);
  listeners.set(topic, bucket);

  return () => {
    bucket.delete(listener);
    if (bucket.size === 0) {
      listeners.delete(topic);
    }
  };
}

export function emitRealtimeTopic(topic: RealtimeBusTopic): void {
  const bucket = listeners.get(topic);
  if (!bucket) {
    return;
  }

  for (const listener of bucket) {
    listener();
  }
}
