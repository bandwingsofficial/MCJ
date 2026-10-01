/** Compact blue gradient — Branch Live Recorded add actions (table + lesson cards). */
export const LIVE_RECORDED_GRADIENT_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.22)] hover:from-[#0284C7] hover:to-[#1D4ED8]";

export function formatLiveRecordedCount(count: number): string {
  if (count <= 0) {
    return "No Live Videos";
  }

  if (count === 1) {
    return "1 Live Recorded Video";
  }

  return `${count} Live Recorded Videos`;
}

export function formatModuleLiveSummary(
  lessonCount: number,
  liveVideoCount: number,
): string {
  const lessons = `${lessonCount} Lesson${lessonCount === 1 ? "" : "s"}`;
  const lives =
    liveVideoCount === 1
      ? "1 Live Video"
      : `${liveVideoCount} Live Videos`;

  return `${lessons} · ${lives}`;
}
