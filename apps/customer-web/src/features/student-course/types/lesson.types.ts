/**
 * Customer-safe lesson model.
 * Does not include video URLs or resource metadata.
 */
export interface Lesson {
  id: string;
  title: string;
  duration: number | null;
  displayOrder: number;
}
