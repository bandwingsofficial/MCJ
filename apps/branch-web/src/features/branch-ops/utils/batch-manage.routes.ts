export function batchManagePath(batchId: string) {
  return `/batches/${batchId}`;
}

export function batchTimingManagePath(batchId: string, timingId: string) {
  return `/batches/${batchId}/timings/${timingId}`;
}
