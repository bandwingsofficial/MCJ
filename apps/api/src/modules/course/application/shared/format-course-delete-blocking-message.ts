import type { CourseDeleteBlockingBatch } from '../../domain/types/course-delete-blocking-batch';

function formatBatchStatusLabel(
  status: CourseDeleteBlockingBatch['lifecycleStatus'],
): string {
  return status === 'UPCOMING' ? 'Upcoming' : 'Ongoing';
}

function formatBlockingBatchLines(
  batches: CourseDeleteBlockingBatch[],
): string[] {
  return batches.map(
    (batch) =>
      `- ${formatBatchStatusLabel(batch.lifecycleStatus)} ${batch.batchName}`,
  );
}

export function formatCourseDeleteBlockingMessage(
  batches: CourseDeleteBlockingBatch[],
): string {
  if (batches.length === 0) {
    return 'This course cannot be deleted because it is assigned to active batches.';
  }

  return [
    'This course cannot be deleted because it is currently assigned to the following batch(es):',
    '',
    ...formatBlockingBatchLines(batches),
    '',
    'Remove the course from those batches before deleting it.',
  ].join('\n');
}

export function formatCourseDeactivateBlockingMessage(
  batches: CourseDeleteBlockingBatch[],
): string {
  if (batches.length === 0) {
    return 'This course cannot be deactivated because it is assigned to active batches.';
  }

  return [
    'This course cannot be deactivated because it is currently assigned to the following batch(es):',
    '',
    ...formatBlockingBatchLines(batches),
    '',
    'Remove the course from those batches before deactivating it.',
  ].join('\n');
}
