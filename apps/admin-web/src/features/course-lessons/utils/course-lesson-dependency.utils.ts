export interface CourseLessonDeleteBlockingItem {
  id: string;
  title: string;
}

export interface CourseLessonDeleteBlocking {
  selfPacedVideos: CourseLessonDeleteBlockingItem[];
  liveRecordedVideos: CourseLessonDeleteBlockingItem[];
  learnItems: CourseLessonDeleteBlockingItem[];
  resources: CourseLessonDeleteBlockingItem[];
  quizzes: CourseLessonDeleteBlockingItem[];
}

function formatSection(
  heading: string,
  items: CourseLessonDeleteBlockingItem[],
): string[] {
  if (items.length === 0) {
    return [];
  }

  return [
    `${heading}:`,
    ...items.map((item) => `- ${item.title}`),
    "",
  ];
}

export function buildLessonDeleteBlockedDescription(
  blocking: CourseLessonDeleteBlocking,
): string {
  const sections = [
    "Lesson cannot be deleted because it contains dependent content:",
    "",
    ...formatSection("Self-Paced Videos", blocking.selfPacedVideos),
    ...formatSection("Learning Content", blocking.learnItems),
    ...formatSection("Resources", blocking.resources),
    ...formatSection("Quizzes", blocking.quizzes),
  ];

  return sections.join("\n").trimEnd();
}

export function buildLessonDeleteConfirmDescription(
  lessonTitle: string | undefined,
  contentLabel = "lesson",
): string {
  const title = lessonTitle?.trim();
  if (title) {
    return `This action will permanently delete "${title}".\nThis cannot be undone.`;
  }

  return `This action will permanently delete this ${contentLabel.toLowerCase()}.\nThis cannot be undone.`;
}
