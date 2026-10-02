export const BATCH_LIFECYCLE_CHANGED_EVENT = "mcj:batch-lifecycle-changed";

export function notifyBatchLifecycleChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(BATCH_LIFECYCLE_CHANGED_EVENT));
}
