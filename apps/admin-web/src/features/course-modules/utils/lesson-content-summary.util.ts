export interface LessonContentSummaryCounts {
  learn: number;
  resources: number;
  quizzes: number;
  assignments: number;
  selfPacedVideos: number;
  liveRecordedVideos: number;
}

export function emptyLessonContentSummaryCounts(): LessonContentSummaryCounts {
  return {
    learn: 0,
    resources: 0,
    quizzes: 0,
    assignments: 0,
    selfPacedVideos: 0,
    liveRecordedVideos: 0,
  };
}

function pluralize(count: number, singular: string, plural?: string): string {
  const label = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${label}`;
}

export function formatLessonContentSummary(
  counts: LessonContentSummaryCounts,
): string | null {
  const parts: string[] = [];

  if (counts.learn > 0) {
    parts.push(pluralize(counts.learn, "Learn item", "Learn items"));
  }

  if (counts.resources > 0) {
    parts.push(pluralize(counts.resources, "Resource"));
  }

  if (counts.quizzes > 0) {
    parts.push(pluralize(counts.quizzes, "Quiz", "Quizzes"));
  }

  if (counts.assignments > 0) {
    parts.push(pluralize(counts.assignments, "Assignment"));
  }

  if (counts.selfPacedVideos > 0) {
    parts.push(pluralize(counts.selfPacedVideos, "Video", "Videos"));
  }

  if (counts.liveRecordedVideos > 0) {
    parts.push(
      pluralize(counts.liveRecordedVideos, "Live recording", "Live recordings"),
    );
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
