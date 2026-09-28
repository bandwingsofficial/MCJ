export type GlobalSearchEntityType =
  | "course"
  | "branch"
  | "trainer"
  | "batch"
  | "category"
  | "financial-article";

export interface GlobalSearchItem {
  id: string;
  type: GlobalSearchEntityType;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  href: string;
}

export interface GlobalSearchGroup {
  type: GlobalSearchEntityType;
  label: string;
  items: GlobalSearchItem[];
}

export interface GlobalSearchResult {
  groups: GlobalSearchGroup[];
  query: string;
}
