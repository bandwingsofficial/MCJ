import { formatBatchSessionCode } from '@modules/batch/domain/utils/batch-session.util';

/** Attendance UI label: "Session 1 - CA Foundation" */
export function formatAttendanceSessionLabel(
  sessionNumber: number | null | undefined,
  courseTitle: string,
): string {
  const title = courseTitle.trim();
  if (!sessionNumber || sessionNumber < 1) {
    return title || 'Session';
  }

  const label = `Session ${Math.trunc(sessionNumber)}`;
  return title ? `${label} - ${title}` : label;
}

export function toAttendanceSessionDto(params: {
  batchCourseId: string;
  sessionId?: string | null;
  sessionNumber?: number | null;
  courseId: string;
  courseTitle: string;
  courseCode?: string | null;
}) {
  const number = params.sessionNumber ?? null;
  return {
    batchCourseId: params.batchCourseId,
    sessionId: params.sessionId ?? null,
    sessionNumber: number,
    sessionCode: number != null ? formatBatchSessionCode(number) : null,
    label: formatAttendanceSessionLabel(number, params.courseTitle),
    course: {
      id: params.courseId,
      title: params.courseTitle,
      code: params.courseCode ?? null,
    },
  };
}
