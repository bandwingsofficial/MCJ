export function branchLiveRecordedBatchPath(
  branchId: string,
  batchId: string,
): string {
  return `/branches/${branchId}/live-recorded/${batchId}`;
}

export function branchLiveRecordedLessonPath(
  branchId: string,
  batchId: string,
  moduleId: string,
  lessonId: string,
): string {
  return `/branches/${branchId}/live-recorded/${batchId}/modules/${moduleId}/lessons/${lessonId}`;
}
